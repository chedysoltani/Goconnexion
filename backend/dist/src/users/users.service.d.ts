import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        birthDate: Date | null;
        lastActiveAt: Date;
        createdAt: Date;
    }>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
        birthDate?: Date;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        birthDate: Date | null;
        lastActiveAt: Date;
    }>;
    getSuggestions(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
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
    }[]>;
}
