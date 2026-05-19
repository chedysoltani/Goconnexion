import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getSuggestions(req: any): Promise<{
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
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        isEmailVerified: boolean;
        createdAt: Date;
    }>;
    update(req: any, body: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }>;
}
