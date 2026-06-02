import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService, BillingInterval } from './stripe.service';
import { PlanType, PlanStatus } from '@prisma/client';

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 1,
    maxApplications: 3,
    maxConnections: 10,
    maxMessagesPerMonth: 50,
    maxIncubatorPosts: 1,
    canAccessAnalytics: false,
    canAccessContracts: false,
    canBoostProfile: false,
    canAccessVideoCall: false,
    canAccessApiAccess: false,
    canAccessExclusiveEvents: false,
    badge: null,
  },
  PRO: {
    maxProjects: 5,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    maxIncubatorPosts: -1,
    canAccessAnalytics: true,
    canAccessContracts: true,
    canBoostProfile: true,
    canAccessVideoCall: true,
    canAccessApiAccess: false,
    canAccessExclusiveEvents: true,
    badge: 'PRO',
  },
  BUSINESS: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    maxIncubatorPosts: -1,
    canAccessAnalytics: true,
    canAccessContracts: true,
    canBoostProfile: true,
    canAccessVideoCall: true,
    canAccessApiAccess: true,
    canAccessExclusiveEvents: true,
    badge: 'BUSINESS',
  },
  PREMIUM_ENTREPRENEUR: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    maxIncubatorPosts: -1,
    canAccessAnalytics: true,
    canAccessContracts: true,
    canBoostProfile: true,
    canAccessVideoCall: true,
    canAccessApiAccess: false,
    canAccessExclusiveEvents: true,
    badge: 'ENTREPRENEUR',
  },
  PREMIUM_FREELANCER: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    maxIncubatorPosts: -1,
    canAccessAnalytics: true,
    canAccessContracts: true,
    canBoostProfile: true,
    canAccessVideoCall: true,
    canAccessApiAccess: false,
    canAccessExclusiveEvents: true,
    badge: 'FREELANCER',
  },
  PREMIUM_INCUBATEUR: {
    maxProjects: -1,
    maxApplications: -1,
    maxConnections: -1,
    maxMessagesPerMonth: -1,
    maxIncubatorPosts: -1,
    canAccessAnalytics: true,
    canAccessContracts: true,
    canBoostProfile: true,
    canAccessVideoCall: true,
    canAccessApiAccess: true,
    canAccessExclusiveEvents: true,
    badge: 'INCUBATEUR',
  },
} as const;

export const PLAN_PRICES = {
  FREE:                 { monthly: 0,   yearly: 0    },
  PRO:                  { monthly: 19,  yearly: 159  },
  BUSINESS:             { monthly: 49,  yearly: 399  },
  PREMIUM_ENTREPRENEUR: { monthly: 29,  yearly: 249  },
  PREMIUM_FREELANCER:   { monthly: 25,  yearly: 199  },
  PREMIUM_INCUBATEUR:   { monthly: 99,  yearly: 890  },
} as const;

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  // ── Status ─────────────────────────────────────────────────────

  async getSubscription(userId: string) {
    let sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: { userId, plan: PlanType.FREE, status: PlanStatus.ACTIVE },
      });
    }
    return {
      ...sub,
      limits: PLAN_LIMITS[sub.plan],
      prices: PLAN_PRICES,
      stripeConfigured: this.stripeService.isConfigured(),
    };
  }

  async getUserPlan(userId: string): Promise<PlanType> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    return user?.plan ?? PlanType.FREE;
  }

  getPlanLimits(plan: PlanType) {
    return PLAN_LIMITS[plan];
  }

  // ── Checkout ───────────────────────────────────────────────────

  async createCheckoutSession(
    userId: string,
    plan: 'PRO' | 'BUSINESS',
    interval: BillingInterval,
  ) {
    if (!this.stripeService.isConfigured()) {
      // Mode sandbox : upgrade direct sans Stripe
      return this.upgradeDirect(userId, plan as PlanType);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    let sub = await this.prisma.subscription.findUnique({ where: { userId } });

    // Créer/récupérer le customer Stripe
    const customerId = await this.stripeService.createOrRetrieveCustomer(
      userId,
      user.email,
      `${user.firstName} ${user.lastName}`,
      sub?.stripeCustomerId,
    );

    // Sauvegarder le customerId si nouveau
    if (!sub?.stripeCustomerId) {
      sub = await this.prisma.subscription.upsert({
        where: { userId },
        create: { userId, plan: PlanType.FREE, status: PlanStatus.ACTIVE, stripeCustomerId: customerId },
        update: { stripeCustomerId: customerId },
      });
    }

    const priceId = this.stripeService.getPriceId(plan, interval);
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    const checkoutUrl = await this.stripeService.createCheckoutSession({
      customerId,
      priceId,
      userId,
      plan,
      interval,
      successUrl: `${baseUrl}/billing/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/pricing`,
    });

    return { checkoutUrl };
  }

  // ── Customer Portal ────────────────────────────────────────────

  async createPortalSession(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('Aucun compte de facturation trouvé');
    }
    const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const url = await this.stripeService.createPortalSession(
      sub.stripeCustomerId,
      `${baseUrl}/dashboard`,
    );
    return { url };
  }

  // ── Webhook handler ────────────────────────────────────────────

  async handleWebhook(payload: Buffer, signature: string) {
    let event: any;
    try {
      event = this.stripeService.constructEvent(payload, signature);
    } catch (err: any) {
      throw new BadRequestException(`Webhook invalide: ${err.message}`);
    }

    this.logger.log(`Stripe event: ${event.type}`);

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const { userId, plan } = session.metadata ?? {};
        if (userId && plan) {
          await this.activatePlan(userId, plan as PlanType, session.subscription);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (userId) {
          const isActive = ['active', 'trialing'].includes(sub.status);
          const plan = sub.metadata?.plan as PlanType ?? PlanType.FREE;
          const periodEnd = new Date(sub.current_period_end * 1000);
          await this.prisma.subscription.update({
            where: { userId },
            data: {
              plan: isActive ? plan : PlanType.FREE,
              status: isActive ? PlanStatus.ACTIVE : PlanStatus.CANCELLED,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              stripeSubId: sub.id,
            },
          });
          await this.prisma.user.update({
            where: { id: userId },
            data: { plan: isActive ? plan : PlanType.FREE },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const userId = sub.metadata?.userId;
        if (userId) {
          await this.prisma.subscription.update({
            where: { userId },
            data: { plan: PlanType.FREE, status: PlanStatus.CANCELLED },
          });
          await this.prisma.user.update({
            where: { id: userId },
            data: { plan: PlanType.FREE },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        const customerId = invoice.customer;
        const sub = await this.prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (sub) {
          await this.prisma.subscription.update({
            where: { id: sub.id },
            data: { status: PlanStatus.EXPIRED },
          });
        }
        break;
      }
    }

    return { received: true };
  }

  // ── Cancel ─────────────────────────────────────────────────────

  async cancelSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub || sub.plan === PlanType.FREE) {
      throw new BadRequestException('Aucun abonnement payant actif');
    }

    if (sub.stripeSubId && this.stripeService.isConfigured()) {
      await this.stripeService.cancelSubscription(sub.stripeSubId);
    }

    return this.prisma.subscription.update({
      where: { userId },
      data: { cancelAtPeriodEnd: true },
    });
  }

  // ── Plans info ─────────────────────────────────────────────────

  getPlansInfo() {
    return {
      stripeConfigured: this.stripeService.isConfigured(),
      plans: [
        {
          id: 'FREE',
          name: 'Gratuit',
          price: PLAN_PRICES.FREE,
          limits: PLAN_LIMITS.FREE,
          features: [
            '3 candidatures / mois',
            '1 projet actif',
            '10 connexions',
            '50 messages / mois',
            'Profil basique',
          ],
        },
        {
          id: 'PRO',
          name: 'Pro',
          price: PLAN_PRICES.PRO,
          limits: PLAN_LIMITS.PRO,
          popular: true,
          features: [
            'Candidatures illimitées',
            '5 projets actifs',
            'Connexions illimitées',
            'Messagerie illimitée',
            'Badge Pro visible',
            'Analytics de profil',
            'Contrats & signatures',
            'Paiement sécurisé',
            'Appels vidéo',
          ],
        },
        {
          id: 'BUSINESS',
          name: 'Business',
          price: PLAN_PRICES.BUSINESS,
          limits: PLAN_LIMITS.BUSINESS,
          features: [
            'Tout Pro +',
            'Projets illimités',
            'Page entreprise dédiée',
            "Équipe jusqu'à 5 membres",
            'Recrutement IA',
            'Analytics & rapports PDF',
            'Support 24h',
            'Accès API',
            'Badge Entreprise Vérifiée',
          ],
        },
      ],
    };
  }

  // ── Internal helpers ───────────────────────────────────────────

  private async activatePlan(userId: string, plan: PlanType, stripeSubId?: string) {
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await this.prisma.$transaction([
      this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: PlanStatus.ACTIVE,
          currentPeriodEnd: periodEnd,
          stripeSubId: stripeSubId ?? null,
        },
        update: {
          plan,
          status: PlanStatus.ACTIVE,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          stripeSubId: stripeSubId ?? undefined,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { plan },
      }),
    ]);
  }

  // Upgrade direct sans Stripe (sandbox / dev)
  private async upgradeDirect(userId: string, plan: PlanType) {
    await this.activatePlan(userId, plan);
    const limits = PLAN_LIMITS[plan];
    return { upgraded: true, plan, limits };
  }
}
