export type BillingInterval = 'monthly' | 'yearly';
export declare class StripeService {
    private readonly stripe;
    private readonly logger;
    constructor();
    createOrRetrieveCustomer(userId: string, email: string, name: string, existingCustomerId?: string | null): Promise<string>;
    createCheckoutSession(params: {
        customerId: string;
        priceId: string;
        userId: string;
        plan: string;
        interval: BillingInterval;
        successUrl: string;
        cancelUrl: string;
    }): Promise<string>;
    createPortalSession(customerId: string, returnUrl: string): Promise<string>;
    constructEvent(payload: Buffer, signature: string): any;
    getSubscription(stripeSubId: string): Promise<any>;
    cancelSubscription(stripeSubId: string): Promise<any>;
    getPriceId(plan: string, interval: BillingInterval): string;
    isConfigured(): boolean;
    private isKeyConfigured;
}
