import { EntrepreneursService } from './entrepreneurs.service';
export declare class EntrepreneursController {
    private readonly entrepreneursService;
    constructor(entrepreneursService: EntrepreneursService);
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
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, body: {
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
}
