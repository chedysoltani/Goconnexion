export declare class UpgradePlanDto {
    plan: 'PRO' | 'BUSINESS';
}
export declare class CreateCheckoutDto {
    plan: 'PRO' | 'BUSINESS';
    interval?: 'monthly' | 'yearly';
    provider?: 'stripe' | 'wise';
}
export declare class CreateWisePaymentDto {
    plan: string;
    interval?: 'monthly' | 'yearly';
}
