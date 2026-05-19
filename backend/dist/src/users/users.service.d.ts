import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
        isEmailVerified: boolean;
        createdAt: Date;
    }>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    }): Promise<{
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
    }>;
    getSuggestions(userId: string): Promise<{
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
            userId: string;
            companyName: string | null;
            website: string | null;
        } | null;
        email: string;
        firstName: string;
        lastName: string;
        role: import("@prisma/client").$Enums.UserRole;
        id: string;
        avatarUrl: string | null;
    }[]>;
}
