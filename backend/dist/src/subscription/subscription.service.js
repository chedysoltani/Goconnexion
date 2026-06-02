"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SubscriptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.PLAN_PRICES = exports.PLAN_LIMITS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("./stripe.service");
const client_1 = require("@prisma/client");
exports.PLAN_LIMITS = {
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
};
exports.PLAN_PRICES = {
    FREE: { monthly: 0, yearly: 0 },
    PRO: { monthly: 19, yearly: 159 },
    BUSINESS: { monthly: 49, yearly: 399 },
    PREMIUM_ENTREPRENEUR: { monthly: 29, yearly: 249 },
    PREMIUM_FREELANCER: { monthly: 25, yearly: 199 },
    PREMIUM_INCUBATEUR: { monthly: 99, yearly: 890 },
};
let SubscriptionService = SubscriptionService_1 = class SubscriptionService {
    prisma;
    stripeService;
    logger = new common_1.Logger(SubscriptionService_1.name);
    constructor(prisma, stripeService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
    }
    async getSubscription(userId) {
        let sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub) {
            sub = await this.prisma.subscription.create({
                data: { userId, plan: client_1.PlanType.FREE, status: client_1.PlanStatus.ACTIVE },
            });
        }
        return {
            ...sub,
            limits: exports.PLAN_LIMITS[sub.plan],
            prices: exports.PLAN_PRICES,
            stripeConfigured: this.stripeService.isConfigured(),
        };
    }
    async getUserPlan(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { plan: true },
        });
        return user?.plan ?? client_1.PlanType.FREE;
    }
    getPlanLimits(plan) {
        return exports.PLAN_LIMITS[plan];
    }
    async createCheckoutSession(userId, plan, interval) {
        if (!this.stripeService.isConfigured()) {
            return this.upgradeDirect(userId, plan);
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });
        if (!user)
            throw new common_1.BadRequestException('Utilisateur introuvable');
        let sub = await this.prisma.subscription.findUnique({ where: { userId } });
        const customerId = await this.stripeService.createOrRetrieveCustomer(userId, user.email, `${user.firstName} ${user.lastName}`, sub?.stripeCustomerId);
        if (!sub?.stripeCustomerId) {
            sub = await this.prisma.subscription.upsert({
                where: { userId },
                create: { userId, plan: client_1.PlanType.FREE, status: client_1.PlanStatus.ACTIVE, stripeCustomerId: customerId },
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
    async createPortalSession(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub?.stripeCustomerId) {
            throw new common_1.BadRequestException('Aucun compte de facturation trouvé');
        }
        const baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        const url = await this.stripeService.createPortalSession(sub.stripeCustomerId, `${baseUrl}/dashboard`);
        return { url };
    }
    async handleWebhook(payload, signature) {
        let event;
        try {
            event = this.stripeService.constructEvent(payload, signature);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook invalide: ${err.message}`);
        }
        this.logger.log(`Stripe event: ${event.type}`);
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const { userId, plan } = session.metadata ?? {};
                if (userId && plan) {
                    await this.activatePlan(userId, plan, session.subscription);
                }
                break;
            }
            case 'customer.subscription.updated': {
                const sub = event.data.object;
                const userId = sub.metadata?.userId;
                if (userId) {
                    const isActive = ['active', 'trialing'].includes(sub.status);
                    const plan = sub.metadata?.plan ?? client_1.PlanType.FREE;
                    const periodEnd = new Date(sub.current_period_end * 1000);
                    await this.prisma.subscription.update({
                        where: { userId },
                        data: {
                            plan: isActive ? plan : client_1.PlanType.FREE,
                            status: isActive ? client_1.PlanStatus.ACTIVE : client_1.PlanStatus.CANCELLED,
                            currentPeriodEnd: periodEnd,
                            cancelAtPeriodEnd: sub.cancel_at_period_end,
                            stripeSubId: sub.id,
                        },
                    });
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { plan: isActive ? plan : client_1.PlanType.FREE },
                    });
                }
                break;
            }
            case 'customer.subscription.deleted': {
                const sub = event.data.object;
                const userId = sub.metadata?.userId;
                if (userId) {
                    await this.prisma.subscription.update({
                        where: { userId },
                        data: { plan: client_1.PlanType.FREE, status: client_1.PlanStatus.CANCELLED },
                    });
                    await this.prisma.user.update({
                        where: { id: userId },
                        data: { plan: client_1.PlanType.FREE },
                    });
                }
                break;
            }
            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                const customerId = invoice.customer;
                const sub = await this.prisma.subscription.findFirst({
                    where: { stripeCustomerId: customerId },
                });
                if (sub) {
                    await this.prisma.subscription.update({
                        where: { id: sub.id },
                        data: { status: client_1.PlanStatus.EXPIRED },
                    });
                }
                break;
            }
        }
        return { received: true };
    }
    async cancelSubscription(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub || sub.plan === client_1.PlanType.FREE) {
            throw new common_1.BadRequestException('Aucun abonnement payant actif');
        }
        if (sub.stripeSubId && this.stripeService.isConfigured()) {
            await this.stripeService.cancelSubscription(sub.stripeSubId);
        }
        return this.prisma.subscription.update({
            where: { userId },
            data: { cancelAtPeriodEnd: true },
        });
    }
    getPlansInfo() {
        return {
            stripeConfigured: this.stripeService.isConfigured(),
            plans: [
                {
                    id: 'FREE',
                    name: 'Gratuit',
                    price: exports.PLAN_PRICES.FREE,
                    limits: exports.PLAN_LIMITS.FREE,
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
                    price: exports.PLAN_PRICES.PRO,
                    limits: exports.PLAN_LIMITS.PRO,
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
                    price: exports.PLAN_PRICES.BUSINESS,
                    limits: exports.PLAN_LIMITS.BUSINESS,
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
    async activatePlan(userId, plan, stripeSubId) {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        await this.prisma.$transaction([
            this.prisma.subscription.upsert({
                where: { userId },
                create: {
                    userId,
                    plan,
                    status: client_1.PlanStatus.ACTIVE,
                    currentPeriodEnd: periodEnd,
                    stripeSubId: stripeSubId ?? null,
                },
                update: {
                    plan,
                    status: client_1.PlanStatus.ACTIVE,
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
    async upgradeDirect(userId, plan) {
        await this.activatePlan(userId, plan);
        const limits = exports.PLAN_LIMITS[plan];
        return { upgraded: true, plan, limits };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = SubscriptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map