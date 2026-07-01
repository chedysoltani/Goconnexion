import { PrismaService } from '../prisma/prisma.service';
import { StripeService, BillingInterval } from './stripe.service';
import { WiseService } from './wise.service';
import { MailService } from '../mail/mail.service';
import { PlanType } from '@prisma/client';
export declare const PLAN_LIMITS: {
    readonly FREE: {
        readonly maxProjects: 1;
        readonly maxApplications: 3;
        readonly maxConnections: 10;
        readonly maxMessagesPerMonth: 50;
        readonly maxIncubatorPosts: 1;
        readonly canAccessAnalytics: false;
        readonly canAccessContracts: false;
        readonly canBoostProfile: false;
        readonly canAccessVideoCall: false;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: false;
        readonly badge: null;
    };
    readonly PRO: {
        readonly maxProjects: 5;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "PRO";
    };
    readonly BUSINESS: {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: true;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "BUSINESS";
    };
    readonly PREMIUM_ENTREPRENEUR: {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "ENTREPRENEUR";
    };
    readonly PREMIUM_FREELANCER: {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "FREELANCER";
    };
    readonly PREMIUM_INCUBATEUR: {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: true;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "INCUBATEUR";
    };
};
export declare const PLAN_PRICES: {
    readonly FREE: {
        readonly monthly: 0;
        readonly yearly: 0;
    };
    readonly PRO: {
        readonly monthly: 19;
        readonly yearly: 159;
    };
    readonly BUSINESS: {
        readonly monthly: 49;
        readonly yearly: 399;
    };
    readonly PREMIUM_ENTREPRENEUR: {
        readonly monthly: 29;
        readonly yearly: 249;
    };
    readonly PREMIUM_FREELANCER: {
        readonly monthly: 25;
        readonly yearly: 199;
    };
    readonly PREMIUM_INCUBATEUR: {
        readonly monthly: 99;
        readonly yearly: 890;
    };
};
export declare class SubscriptionService {
    private prisma;
    private stripeService;
    private wiseService;
    private mailService;
    private readonly logger;
    constructor(prisma: PrismaService, stripeService: StripeService, wiseService: WiseService, mailService: MailService);
    getSubscription(userId: string): Promise<{
        limits: {
            readonly maxProjects: 1;
            readonly maxApplications: 3;
            readonly maxConnections: 10;
            readonly maxMessagesPerMonth: 50;
            readonly maxIncubatorPosts: 1;
            readonly canAccessAnalytics: false;
            readonly canAccessContracts: false;
            readonly canBoostProfile: false;
            readonly canAccessVideoCall: false;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: false;
            readonly badge: null;
        } | {
            readonly maxProjects: 5;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "PRO";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: true;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "BUSINESS";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "ENTREPRENEUR";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "FREELANCER";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: true;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "INCUBATEUR";
        };
        prices: {
            readonly FREE: {
                readonly monthly: 0;
                readonly yearly: 0;
            };
            readonly PRO: {
                readonly monthly: 19;
                readonly yearly: 159;
            };
            readonly BUSINESS: {
                readonly monthly: 49;
                readonly yearly: 399;
            };
            readonly PREMIUM_ENTREPRENEUR: {
                readonly monthly: 29;
                readonly yearly: 249;
            };
            readonly PREMIUM_FREELANCER: {
                readonly monthly: 25;
                readonly yearly: 199;
            };
            readonly PREMIUM_INCUBATEUR: {
                readonly monthly: 99;
                readonly yearly: 890;
            };
        };
        stripeConfigured: boolean;
        wiseConfigured: boolean;
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PlanStatus;
        paymentProvider: import("@prisma/client").$Enums.PaymentProvider;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
        wiseReference: string | null;
        pendingAmount: number | null;
        pendingCurrency: string | null;
        lastPaymentDate: Date | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: Date | null;
        userId: string;
    }>;
    getUserPlan(userId: string): Promise<PlanType>;
    getPlanLimits(plan: PlanType): {
        readonly maxProjects: 1;
        readonly maxApplications: 3;
        readonly maxConnections: 10;
        readonly maxMessagesPerMonth: 50;
        readonly maxIncubatorPosts: 1;
        readonly canAccessAnalytics: false;
        readonly canAccessContracts: false;
        readonly canBoostProfile: false;
        readonly canAccessVideoCall: false;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: false;
        readonly badge: null;
    } | {
        readonly maxProjects: 5;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "PRO";
    } | {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: true;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "BUSINESS";
    } | {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "ENTREPRENEUR";
    } | {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: false;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "FREELANCER";
    } | {
        readonly maxProjects: -1;
        readonly maxApplications: -1;
        readonly maxConnections: -1;
        readonly maxMessagesPerMonth: -1;
        readonly maxIncubatorPosts: -1;
        readonly canAccessAnalytics: true;
        readonly canAccessContracts: true;
        readonly canBoostProfile: true;
        readonly canAccessVideoCall: true;
        readonly canAccessApiAccess: true;
        readonly canAccessExclusiveEvents: true;
        readonly badge: "INCUBATEUR";
    };
    createCheckoutSession(userId: string, plan: 'PRO' | 'BUSINESS', interval: BillingInterval, provider?: 'stripe' | 'wise'): Promise<{
        provider: string;
        wiseInstructions: boolean;
        reference: string;
        amount: 0 | 49 | 25 | 890 | 19 | 159 | 399 | 29 | 249 | 199 | 99;
        currency: string;
        accountDetails: import("./wise.service").WiseAccountDetails;
        plan: import("@prisma/client").$Enums.PlanType;
        interval: BillingInterval;
        redirectUrl: string;
    } | {
        upgraded: boolean;
        plan: import("@prisma/client").$Enums.PlanType;
        limits: {
            readonly maxProjects: 1;
            readonly maxApplications: 3;
            readonly maxConnections: 10;
            readonly maxMessagesPerMonth: 50;
            readonly maxIncubatorPosts: 1;
            readonly canAccessAnalytics: false;
            readonly canAccessContracts: false;
            readonly canBoostProfile: false;
            readonly canAccessVideoCall: false;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: false;
            readonly badge: null;
        } | {
            readonly maxProjects: 5;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "PRO";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: true;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "BUSINESS";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "ENTREPRENEUR";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: false;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "FREELANCER";
        } | {
            readonly maxProjects: -1;
            readonly maxApplications: -1;
            readonly maxConnections: -1;
            readonly maxMessagesPerMonth: -1;
            readonly maxIncubatorPosts: -1;
            readonly canAccessAnalytics: true;
            readonly canAccessContracts: true;
            readonly canBoostProfile: true;
            readonly canAccessVideoCall: true;
            readonly canAccessApiAccess: true;
            readonly canAccessExclusiveEvents: true;
            readonly badge: "INCUBATEUR";
        };
    } | {
        checkoutUrl: string;
    }>;
    createWisePaymentSession(userId: string, plan: PlanType, interval: BillingInterval): Promise<{
        provider: string;
        wiseInstructions: boolean;
        reference: string;
        amount: 0 | 49 | 25 | 890 | 19 | 159 | 399 | 29 | 249 | 199 | 99;
        currency: string;
        accountDetails: import("./wise.service").WiseAccountDetails;
        plan: import("@prisma/client").$Enums.PlanType;
        interval: BillingInterval;
        redirectUrl: string;
    }>;
    handleWiseWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
        ignored: boolean;
        activated?: undefined;
    } | {
        received: boolean;
        ignored?: undefined;
        activated?: undefined;
    } | {
        received: boolean;
        activated: boolean;
        ignored?: undefined;
    }>;
    sendWiseRenewalReminders(): Promise<void>;
    createPortalSession(userId: string): Promise<{
        url: string;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    cancelSubscription(userId: string): Promise<{
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PlanStatus;
        paymentProvider: import("@prisma/client").$Enums.PaymentProvider;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
        wiseReference: string | null;
        pendingAmount: number | null;
        pendingCurrency: string | null;
        lastPaymentDate: Date | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: Date | null;
        userId: string;
    }>;
    getPlansInfo(): {
        stripeConfigured: boolean;
        plans: ({
            id: string;
            name: string;
            price: {
                readonly monthly: 0;
                readonly yearly: 0;
            };
            limits: {
                readonly maxProjects: 1;
                readonly maxApplications: 3;
                readonly maxConnections: 10;
                readonly maxMessagesPerMonth: 50;
                readonly maxIncubatorPosts: 1;
                readonly canAccessAnalytics: false;
                readonly canAccessContracts: false;
                readonly canBoostProfile: false;
                readonly canAccessVideoCall: false;
                readonly canAccessApiAccess: false;
                readonly canAccessExclusiveEvents: false;
                readonly badge: null;
            };
            features: string[];
            popular?: undefined;
        } | {
            id: string;
            name: string;
            price: {
                readonly monthly: 19;
                readonly yearly: 159;
            };
            limits: {
                readonly maxProjects: 5;
                readonly maxApplications: -1;
                readonly maxConnections: -1;
                readonly maxMessagesPerMonth: -1;
                readonly maxIncubatorPosts: -1;
                readonly canAccessAnalytics: true;
                readonly canAccessContracts: true;
                readonly canBoostProfile: true;
                readonly canAccessVideoCall: true;
                readonly canAccessApiAccess: false;
                readonly canAccessExclusiveEvents: true;
                readonly badge: "PRO";
            };
            popular: boolean;
            features: string[];
        } | {
            id: string;
            name: string;
            price: {
                readonly monthly: 49;
                readonly yearly: 399;
            };
            limits: {
                readonly maxProjects: -1;
                readonly maxApplications: -1;
                readonly maxConnections: -1;
                readonly maxMessagesPerMonth: -1;
                readonly maxIncubatorPosts: -1;
                readonly canAccessAnalytics: true;
                readonly canAccessContracts: true;
                readonly canBoostProfile: true;
                readonly canAccessVideoCall: true;
                readonly canAccessApiAccess: true;
                readonly canAccessExclusiveEvents: true;
                readonly badge: "BUSINESS";
            };
            features: string[];
            popular?: undefined;
        })[];
    };
    private activatePlan;
    private upgradeDirect;
}
