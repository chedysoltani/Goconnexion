import { PrismaService } from '../prisma/prisma.service';
export declare class FreelancersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
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
    }>;
    updateProfile(userId: string, data: {
        title?: string;
        bio?: string;
        skills?: string[];
        portfolioUrl?: string;
        cvUrl?: string;
        isAvailable?: boolean;
        hourlyRate?: number;
    }): Promise<{
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
    }>;
    findAll(filters: {
        skills?: string;
        minRate?: number;
        maxRate?: number;
        availableOnly?: boolean;
    }): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
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
    })[]>;
}
