import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

export type BillingInterval = 'monthly' | 'yearly';

const PRICE_MAP: Record<string, Record<BillingInterval, string>> = {
  PRO: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_PRO_YEARLY  ?? '',
  },
  BUSINESS: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_BUSINESS_YEARLY  ?? '',
  },
  PREMIUM_INCUBATEUR: {
    monthly: process.env.STRIPE_PRICE_INCUBATEUR_MONTHLY ?? '',
    yearly:  process.env.STRIPE_PRICE_INCUBATEUR_YEARLY  ?? '',
  },
};

@Injectable()
export class StripeService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

    if (!this.isKeyConfigured(key)) {
      this.logger.warn('⚠️  STRIPE_SECRET_KEY non configurée — mode sandbox actif (dev uniquement)');
    } else {
      const mode = key.startsWith('sk_live_') ? 'LIVE 🔴' : 'TEST 🟡';
      this.logger.log(`✅ Stripe configuré en mode ${mode}`);
    }

    if (!webhookSecret || webhookSecret.includes('REMPLACE') || webhookSecret.includes('placeholder')) {
      this.logger.warn(
        '⚠️  STRIPE_WEBHOOK_SECRET non configuré — les webhooks de paiement seront rejetés.\n' +
        '   → En local : stripe listen --forward-to localhost:3001/subscription/webhook\n' +
        '   → En production : configurer le webhook sur dashboard.stripe.com'
      );
    }

    this.stripe = new Stripe(key);
  }

  // ── Customer ──────────────────────────────────────────────────

  async createOrRetrieveCustomer(
    userId: string,
    email: string,
    name: string,
    existingCustomerId?: string | null,
  ): Promise<string> {
    if (existingCustomerId) return existingCustomerId;

    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: { userId },
    });
    return customer.id;
  }

  // ── Checkout Session ──────────────────────────────────────────

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    userId: string;
    plan: string;
    interval: BillingInterval;
    successUrl: string;
    cancelUrl: string;
    enableAcssDebit?: boolean;
  }): Promise<string> {
    const paymentMethodTypes = params.enableAcssDebit
      ? ['card', 'acss_debit']
      : ['card'];

    const sessionParams: any = {
      customer: params.customerId,
      mode: 'subscription',
      payment_method_types: paymentMethodTypes,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      subscription_data: {
        metadata: {
          userId: params.userId,
          plan: params.plan,
          interval: params.interval,
        },
      },
      metadata: {
        userId: params.userId,
        plan: params.plan,
        interval: params.interval,
      },
      allow_promotion_codes: true,
    };

    if (params.enableAcssDebit) {
      sessionParams.payment_method_options = {
        acss_debit: {
          currency: 'cad',
          mandate_options: {
            payment_schedule: 'interval',
            interval_description: `Abonnement ${params.plan} ${params.interval}`,
            transaction_type: 'personal',
          },
          verification_method: 'automatic',
        },
      };
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    if (!session.url) throw new Error('Stripe session URL manquante');
    return session.url;
  }

  // ── Event Checkout Session ────────────────────────────────────

  async createEventCheckoutSession(params: {
    customerId: string;
    amount: number;
    currency: string;
    eventTitle: string;
    registrationId: string;
    eventId: string;
    userId: string;
    boothId?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const session = await this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: params.currency,
          unit_amount: params.amount,
          product_data: { name: params.eventTitle },
        },
        quantity: 1,
      }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        type: 'event',
        registrationId: params.registrationId,
        eventId: params.eventId,
        userId: params.userId,
        ...(params.boothId ? { boothId: params.boothId } : {}),
      },
    });
    if (!session.url) throw new Error('Stripe session URL manquante');
    return { url: session.url, sessionId: session.id };
  }

  // ── Marketplace Order Checkout ────────────────────────────────

  async createMarketplaceCheckoutSession(params: {
    amount: number;
    currency: string;
    serviceTitle: string;
    orderId: string;
    serviceId: string;
    buyerId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     params.currency,
          unit_amount:  params.amount,
          product_data: { name: params.serviceTitle },
        },
        quantity: 1,
      }],
      success_url: params.successUrl,
      cancel_url:  params.cancelUrl,
      metadata: {
        type:      'marketplace',
        orderId:   params.orderId,
        serviceId: params.serviceId,
        buyerId:   params.buyerId,
      },
    });
    if (!session.url) throw new Error('Stripe session URL manquante');
    return { url: session.url, sessionId: session.id };
  }

  // ── Customer Portal ───────────────────────────────────────────

  async createPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  }

  // ── Webhook verification ──────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructEvent(payload: Buffer, signature: string): any {
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }

  // ── Subscription ──────────────────────────────────────────────

  async getSubscription(stripeSubId: string): Promise<any> {
    return this.stripe.subscriptions.retrieve(stripeSubId);
  }

  async cancelSubscription(stripeSubId: string): Promise<any> {
    return this.stripe.subscriptions.update(stripeSubId, {
      cancel_at_period_end: true,
    });
  }

  // ── Helper ────────────────────────────────────────────────────

  getPriceId(plan: string, interval: BillingInterval): string {
    const priceId = PRICE_MAP[plan]?.[interval];
    if (!priceId) throw new Error(`Price ID non configuré pour ${plan}/${interval}`);
    return priceId;
  }

  isConfigured(): boolean {
    return this.isKeyConfigured(process.env.STRIPE_SECRET_KEY ?? '');
  }

  private isKeyConfigured(key: string): boolean {
    return key.startsWith('sk_') && !key.includes('REMPLACE') && !key.includes('placeholder');
  }
}
