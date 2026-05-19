import { PrismaService } from '../prisma/prisma.service';
export declare class EntrepreneursService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<{
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            avatarUrl: string | null;
        };
        projects: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            skills: string[];
            description: string;
            budget: number | null;
            status: import("@prisma/client").$Enums.ProjectStatus;
            ownerId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        userId: string;
        companyName: string | null;
        website: string | null;
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
        userId: string;
        companyName: string | null;
        website: string | null;
    }>;
    findAll(): Promise<({
        user: {
            email: string;
            firstName: string;
            lastName: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        userId: string;
        companyName: string | null;
        website: string | null;
    })[]>;
}
