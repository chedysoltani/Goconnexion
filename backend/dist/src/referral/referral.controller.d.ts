import { ReferralService } from './referral.service';
export declare class ReferralController {
    private readonly referralService;
    constructor(referralService: ReferralService);
    getDashboard(req: any): Promise<{
        code: string;
        totalReferrals: number;
        referrals: ({
            referredUser: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                role: import("@prisma/client").$Enums.UserRole;
                createdAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            referralCodeId: string;
            referredUserId: string;
        })[];
    }>;
    getLeaderboard(): Promise<({
        user: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        code: string;
        totalReferrals: number;
    })[]>;
    registerReferral(code: string, req: any): Promise<{
        success: boolean;
    } | null>;
}
