import type { RawBodyRequest } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutDto, UpgradePlanDto } from './dto/subscription.dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getPlans(): {
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
    webhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
    getSubscription(req: any): Promise<{
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
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.PlanStatus;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: Date | null;
    }>;
    createCheckout(req: any, dto: CreateCheckoutDto): Promise<{
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
    createPortal(req: any): Promise<{
        url: string;
    }>;
    upgradeDirect(req: any, dto: UpgradePlanDto): Promise<{
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
    cancelSubscription(req: any): Promise<{
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import("@prisma/client").$Enums.PlanStatus;
        stripeCustomerId: string | null;
        stripeSubId: string | null;
        currentPeriodEnd: Date | null;
        cancelAtPeriodEnd: boolean;
        trialEndsAt: Date | null;
    }>;
}
