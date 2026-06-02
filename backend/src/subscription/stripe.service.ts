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
};

@Injectable()
export class StripeService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly stripe: any;
  private readonly logger = new Logger(StripeService.name);

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder';
    if (!this.isKeyConfigured(key)) {
      this.logger.warn('⚠️  STRIPE_SECRET_KEY non configurée — mode sandbox actif');
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
  }): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      customer: params.customerId,
      mode: 'subscription',
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
    });

    if (!session.url) throw new Error('Stripe session URL manquante');
    return session.url;
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
