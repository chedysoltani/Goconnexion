import { PrismaService } from '../prisma/prisma.service';
export declare class EntrepreneursService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            skills: string[];
            status: import("@prisma/client").$Enums.ProjectStatus;
            description: string;
            budget: number | null;
            ownerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        companyName: string | null;
        website: string | null;
        userId: string;
    }>;
    updateProfile(userId: string, data: {
        companyName?: string;
        website?: string;
        bio?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        companyName: string | null;
        website: string | null;
        userId: string;
    }>;
    findAll(): Promise<({
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        companyName: string | null;
        website: string | null;
        userId: string;
    })[]>;
}
