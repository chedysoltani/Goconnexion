import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, ApplicationStatus } from '@prisma/client';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        title: string;
        description: string;
        budget?: number;
        skills: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        status: import("@prisma/client").$Enums.ProjectStatus;
        description: string;
        budget: number | null;
        ownerId: string;
    }>;
    findAll(filters: {
        search?: string;
        status?: ProjectStatus;
    }): Promise<({
        owner: {
            user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        status: import("@prisma/client").$Enums.ProjectStatus;
        description: string;
        budget: number | null;
        ownerId: string;
    })[]>;
    findOne(id: string): Promise<{
        applications: ({
            project: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                skills: string[];
                status: import("@prisma/client").$Enums.ProjectStatus;
                description: string;
                budget: number | null;
                ownerId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            coverLetter: string | null;
            projectId: string;
            freelancerId: string;
        })[];
        owner: {
            user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        status: import("@prisma/client").$Enums.ProjectStatus;
        description: string;
        budget: number | null;
        ownerId: string;
    }>;
    update(id: string, userId: string, data: {
        title?: string;
        description?: string;
        budget?: number;
        skills?: string[];
        status?: ProjectStatus;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        status: import("@prisma/client").$Enums.ProjectStatus;
        description: string;
        budget: number | null;
        ownerId: string;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        status: import("@prisma/client").$Enums.ProjectStatus;
        description: string;
        budget: number | null;
        ownerId: string;
    }>;
    apply(projectId: string, userId: string, coverLetter?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        projectId: string;
        freelancerId: string;
    }>;
    getApplications(projectId: string, userId: string): Promise<({
        freelancer: {
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
            title: string | null;
            bio: string | null;
            skills: string[];
            portfolioUrl: string | null;
            cvUrl: string | null;
            isAvailable: boolean;
            hourlyRate: number | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        projectId: string;
        freelancerId: string;
    })[]>;
    updateApplicationStatus(applicationId: string, userId: string, status: ApplicationStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        coverLetter: string | null;
        projectId: string;
        freelancerId: string;
    }>;
}
