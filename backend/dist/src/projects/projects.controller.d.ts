import { ProjectsService } from './projects.service';
import { ProjectStatus, ApplicationStatus } from '@prisma/client';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(search?: string, status?: ProjectStatus): Promise<({
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
    create(req: any, body: {
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
    update(id: string, req: any, body: {
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
    delete(id: string, req: any): Promise<{
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
    apply(projectId: string, req: any, coverLetter?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
    getApplications(projectId: string, req: any): Promise<({} & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    })[]>;
    updateApplicationStatus(applicationId: string, req: any, status: ApplicationStatus): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ApplicationStatus;
        projectId: string;
        freelancerId: string;
        coverLetter: string | null;
    }>;
}
