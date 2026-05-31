"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
            where: { userId },
        });
        if (!entrepreneur) {
            throw new common_1.NotFoundException('Entrepreneur profile not found');
        }
        return this.prisma.project.create({
            data: {
                title: data.title,
                description: data.description,
                budget: data.budget,
                skills: data.skills,
                ownerId: entrepreneur.id,
            },
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.project.findMany({
            where,
            include: {
                owner: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                applications: {
                    include: {
                        project: true,
                    },
                },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        return project;
    }
    async update(id, userId, data) {
        const project = await this.findOne(id);
        const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
            where: { userId },
        });
        if (!entrepreneur || project.ownerId !== entrepreneur.id) {
            throw new common_1.ForbiddenException('You do not own this project');
        }
        return this.prisma.project.update({
            where: { id },
            data,
        });
    }
    async delete(id, userId) {
        const project = await this.findOne(id);
        const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
            where: { userId },
        });
        if (!entrepreneur || project.ownerId !== entrepreneur.id) {
            throw new common_1.ForbiddenException('You do not own this project');
        }
        return this.prisma.project.delete({
            where: { id },
        });
    }
    async apply(projectId, userId, coverLetter) {
        const freelancer = await this.prisma.freelancerProfile.findUnique({
            where: { userId },
        });
        if (!freelancer) {
            throw new common_1.NotFoundException('Freelancer profile not found');
        }
        const existing = await this.prisma.projectApplication.findFirst({
            where: {
                projectId,
                freelancerId: freelancer.id,
            },
        });
        if (existing) {
            throw new common_1.ForbiddenException('You have already applied to this project');
        }
        return this.prisma.projectApplication.create({
            data: {
                projectId,
                freelancerId: freelancer.id,
                coverLetter,
            },
        });
    }
    async getApplications(projectId, userId) {
        const project = await this.findOne(projectId);
        const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
            where: { userId },
        });
        if (!entrepreneur || project.ownerId !== entrepreneur.id) {
            throw new common_1.ForbiddenException('You do not own this project');
        }
        return this.prisma.projectApplication.findMany({
            where: { projectId },
            include: {
                freelancer: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateApplicationStatus(applicationId, userId, status) {
        const application = await this.prisma.projectApplication.findUnique({
            where: { id: applicationId },
            include: { project: true },
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
            where: { userId },
        });
        if (!entrepreneur || application.project.ownerId !== entrepreneur.id) {
            throw new common_1.ForbiddenException('You do not own this project');
        }
        return this.prisma.projectApplication.update({
            where: { id: applicationId },
            data: { status },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map