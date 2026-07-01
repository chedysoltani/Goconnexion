import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getEarnings(userId: string): Promise<{
        earnings: {
            id: string;
            source: string;
            amount: number;
            date: Date;
            status: string;
            client: {
                name: string;
                company: string;
            };
            project: string;
        }[];
        totalPaid: number;
        totalPending: number;
    }>;
    getUserDashboardStats(userId: string): Promise<{
        role: string;
        stats: {
            totalApplications: number;
            acceptedApplications: number;
            isAvailable: boolean;
            hourlyRate: number;
            skillsCount: number;
            totalProjects?: undefined;
            totalApplicationsReceived?: undefined;
            companyName?: undefined;
            website?: undefined;
            totalUsers?: undefined;
            totalConversations?: undefined;
        };
    } | {
        role: string;
        stats: {
            totalProjects: number;
            totalApplicationsReceived: number;
            companyName: string;
            website: string;
            totalApplications?: undefined;
            acceptedApplications?: undefined;
            isAvailable?: undefined;
            hourlyRate?: undefined;
            skillsCount?: undefined;
            totalUsers?: undefined;
            totalConversations?: undefined;
        };
    } | {
        role: string;
        stats: {
            totalUsers: number;
            totalProjects: number;
            totalConversations: number;
            totalApplications?: undefined;
            acceptedApplications?: undefined;
            isAvailable?: undefined;
            hourlyRate?: undefined;
            skillsCount?: undefined;
            totalApplicationsReceived?: undefined;
            companyName?: undefined;
            website?: undefined;
        };
    }>;
}
