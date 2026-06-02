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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StripeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = __importDefault(require("stripe"));
const PRICE_MAP = {
    PRO: {
        monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
        yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
    },
    BUSINESS: {
        monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? '',
        yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? '',
    },
};
let StripeService = StripeService_1 = class StripeService {
    stripe;
    logger = new common_1.Logger(StripeService_1.name);
    constructor() {
        const key = process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder';
        if (!this.isKeyConfigured(key)) {
            this.logger.warn('⚠️  STRIPE_SECRET_KEY non configurée — mode sandbox actif');
        }
        this.stripe = new stripe_1.default(key);
    }
    async createOrRetrieveCustomer(userId, email, name, existingCustomerId) {
        if (existingCustomerId)
            return existingCustomerId;
        const customer = await this.stripe.customers.create({
            email,
            name,
            metadata: { userId },
        });
        return customer.id;
    }
    async createCheckoutSession(params) {
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
        if (!session.url)
            throw new Error('Stripe session URL manquante');
        return session.url;
    }
    async createPortalSession(customerId, returnUrl) {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
        return session.url;
    }
    constructEvent(payload, signature) {
        const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
        return this.stripe.webhooks.constructEvent(payload, signature, secret);
    }
    async getSubscription(stripeSubId) {
        return this.stripe.subscriptions.retrieve(stripeSubId);
    }
    async cancelSubscription(stripeSubId) {
        return this.stripe.subscriptions.update(stripeSubId, {
            cancel_at_period_end: true,
        });
    }
    getPriceId(plan, interval) {
        const priceId = PRICE_MAP[plan]?.[interval];
        if (!priceId)
            throw new Error(`Price ID non configuré pour ${plan}/${interval}`);
        return priceId;
    }
    isConfigured() {
        return this.isKeyConfigured(process.env.STRIPE_SECRET_KEY ?? '');
    }
    isKeyConfigured(key) {
        return key.startsWith('sk_') && !key.includes('REMPLACE') && !key.includes('placeholder');
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = StripeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], StripeService);
//# sourceMappingURL=stripe.service.js.map