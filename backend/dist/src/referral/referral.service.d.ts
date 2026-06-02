import { PrismaService } from '../prisma/prisma.service';
export declare class ReferralService {
    private prisma;
    constructor(prisma: PrismaService);
    private generateCode;
    getOrCreateCode(userId: string): Promise<{
        referrals: {
            id: string;
            createdAt: Date;
            referralCodeId: string;
            referredUserId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        code: string;
        totalReferrals: number;
    }>;
    getDashboard(userId: string): Promise<{
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
    registerReferral(code: string, newUserId: string): Promise<{
        success: boolean;
    } | null>;
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
}
