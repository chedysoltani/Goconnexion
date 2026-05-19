import { FreelancersService } from './freelancers.service';
export declare class FreelancersController {
    private readonly freelancersService;
    constructor(freelancersService: FreelancersService);
    findAll(skills?: string, minRate?: number, maxRate?: number, availableOnly?: string, search?: string): Promise<({
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
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, body: {
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
}
