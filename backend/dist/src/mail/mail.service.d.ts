export declare class MailService {
    private readonly resend;
    private readonly logger;
    private readonly from;
    constructor();
    private isConfigured;
    private send;
    sendWelcome(user: {
        email: string;
        firstName: string;
    }): Promise<void>;
    sendEmailVerification(user: {
        email: string;
        firstName: string;
    }, token: string): Promise<void>;
    sendPasswordReset(user: {
        email: string;
        firstName: string;
    }, token: string): Promise<void>;
    sendSubscriptionActivated(user: {
        email: string;
        firstName: string;
    }, plan: string, periodEnd: Date): Promise<void>;
    sendSubscriptionCancelled(user: {
        email: string;
        firstName: string;
    }, plan: string, periodEnd: Date): Promise<void>;
    sendPaymentFailed(user: {
        email: string;
        firstName: string;
    }, plan: string): Promise<void>;
    sendWiseRenewalReminder(user: {
        email: string;
        firstName: string;
    }, amount: number, currency: string, reference: string, periodEnd: Date, accountDetails: {
        accountHolderName: string;
        details: Record<string, string>;
    }): Promise<void>;
    sendBusinessCardInvitation(senderName: string, recipientEmail: string): Promise<void>;
    private btn;
    private esc;
    private wrap;
}
