import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    constructor(prisma: PrismaService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        plan: import("@prisma/client").$Enums.PlanType;
        subscription: {
            plan: import("@prisma/client").$Enums.PlanType;
            status: import("@prisma/client").$Enums.PlanStatus;
            currentPeriodEnd: Date | null;
            cancelAtPeriodEnd: boolean;
        } | null;
        freelancerProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string | null;
            bio: string | null;
            skills: string[];
            portfolioUrl: string | null;
            cvUrl: string | null;
            isAvailable: boolean;
            hourlyRate: number | null;
            userId: string;
        } | null;
        entrepreneurProfile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            bio: string | null;
            companyName: string | null;
            website: string | null;
            userId: string;
        } | null;
    }>;
}
export {};
