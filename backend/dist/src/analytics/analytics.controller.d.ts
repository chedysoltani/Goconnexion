import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboardStats(req: any): Promise<{
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
    getEarnings(req: any): Promise<{
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
}
