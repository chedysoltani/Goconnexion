export interface WiseAccountDetails {
    currency: string;
    accountHolderName: string;
    details: Record<string, string>;
}
export interface WiseBalance {
    currency: string;
    amount: {
        value: number;
        currency: string;
    };
}
export interface WiseCreditEvent {
    data: {
        resource: {
            id: number;
            profile_id: number;
            type: string;
        };
        amount: number;
        currency: string;
        transaction_type: string;
        reference_number: string;
        running_balance: {
            amount: number;
            currency: string;
        };
    };
    event_type: string;
    schema_version: string;
    sent_at: string;
}
export declare class WiseService {
    private readonly logger;
    private readonly apiUrl;
    private readonly apiToken;
    private readonly profileId;
    private readonly webhookPublicKey;
    isConfigured(): boolean;
    generateReference(userId: string): string;
    getAccountDetails(currency?: string): Promise<WiseAccountDetails>;
    getBalances(): Promise<WiseBalance[]>;
    verifyWebhookSignature(payload: Buffer, signature: string): boolean;
    extractReferenceFromEvent(event: WiseCreditEvent): string | null;
    extractAmountFromEvent(event: WiseCreditEvent): {
        amount: number;
        currency: string;
    } | null;
    private getMockAccountDetails;
}
