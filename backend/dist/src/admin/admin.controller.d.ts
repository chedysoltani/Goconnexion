import { AdminService } from './admin.service';
import { PlanType } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        totalUsers: number;
        totalProjects: number;
        totalEvents: number;
        totalConversations: number;
        activeSubscriptions: number;
    }>;
    getUsers(page?: string, limit?: string): Promise<{
        users: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            plan: import("@prisma/client").$Enums.PlanType;
            lastActiveAt: Date;
            createdAt: Date;
            subscription: {
                plan: import("@prisma/client").$Enums.PlanType;
                status: import("@prisma/client").$Enums.PlanStatus;
            } | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    updateUserPlan(id: string, plan: PlanType): Promise<{
        id: string;
        plan: import("@prisma/client").$Enums.PlanType;
    }>;
}
