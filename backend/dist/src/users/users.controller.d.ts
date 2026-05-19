import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getSuggestions(req: any): Promise<{
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
    update(req: any, body: {
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
}
