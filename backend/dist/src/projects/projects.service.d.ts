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
        description: string;
        budget: number | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
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
            userId: string;
            companyName: string | null;
            website: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        description: string;
        budget: number | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        ownerId: string;
    })[]>;
    findOne(id: string): Promise<{
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
            userId: string;
            companyName: string | null;
            website: string | null;
        };
        applications: ({
            project: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                skills: string[];
                description: string;
                budget: number | null;
                status: import("@prisma/client").$Enums.ProjectStatus;
                ownerId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.ApplicationStatus;
            projectId: string;
            freelancerId: string;
            coverLetter: string | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        description: string;
        budget: number | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
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
        description: string;
        budget: number | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        ownerId: string;
    }>;
    delete(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        skills: string[];
        description: string;
        budget: number | null;
        status: import("@prisma/client").$Enums.ProjectStatus;
        ownerId: string;
    }>;
    apply(projectId: string, userId: string, coverLetter?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    getApplications(projectId: string, userId: string): Promise<({} & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    })[]>;
    updateApplicationStatus(applicationId: string, userId: string, status: ApplicationStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
}
