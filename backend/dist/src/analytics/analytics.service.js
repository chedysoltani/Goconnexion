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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEarnings(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { freelancerProfile: true },
        });
        if (!user?.freelancerProfile) {
            return { earnings: [], totalPaid: 0, totalPending: 0 };
        }
        const applications = await this.prisma.projectApplication.findMany({
            where: {
                freelancerId: user.freelancerProfile.id,
                status: { in: ['ACCEPTED', 'PENDING'] },
            },
            include: {
                project: {
                    include: {
                        owner: {
                            include: {
                                user: { select: { firstName: true, lastName: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        const earnings = applications.map((app) => ({
            id: app.id,
            source: app.project.title,
            amount: app.project.budget ?? 0,
            date: app.updatedAt,
            status: app.status === 'ACCEPTED' ? 'paid' : 'pending',
            client: {
                name: `${app.project.owner.user.firstName} ${app.project.owner.user.lastName}`,
                company: app.project.owner.companyName ?? '',
            },
            project: app.project.title,
        }));
        const totalPaid = earnings
            .filter((e) => e.status === 'paid')
            .reduce((s, e) => s + e.amount, 0);
        const totalPending = earnings
            .filter((e) => e.status === 'pending')
            .reduce((s, e) => s + e.amount, 0);
        return { earnings, totalPaid, totalPending };
    }
    async getUserDashboardStats(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                freelancerProfile: true,
                entrepreneurProfile: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.role === 'FREELANCER') {
            const freelancerProfileId = user.freelancerProfile?.id;
            const totalApplications = freelancerProfileId
                ? await this.prisma.projectApplication.count({ where: { freelancerId: freelancerProfileId } })
                : 0;
            const acceptedApplications = freelancerProfileId
                ? await this.prisma.projectApplication.count({
                    where: { freelancerId: freelancerProfileId, status: 'ACCEPTED' },
                })
                : 0;
            return {
                role: 'FREELANCER',
                stats: {
                    totalApplications,
                    acceptedApplications,
                    isAvailable: user.freelancerProfile?.isAvailable || false,
                    hourlyRate: user.freelancerProfile?.hourlyRate || 0,
                    skillsCount: user.freelancerProfile?.skills?.length || 0,
                },
            };
        }
        else if (user.role === 'ENTREPRENEUR') {
            const entrepreneurProfileId = user.entrepreneurProfile?.id;
            const totalProjects = entrepreneurProfileId
                ? await this.prisma.project.count({ where: { ownerId: entrepreneurProfileId } })
                : 0;
            const totalApplicationsReceived = entrepreneurProfileId
                ? await this.prisma.projectApplication.count({
                    where: { project: { ownerId: entrepreneurProfileId } },
                })
                : 0;
            return {
                role: 'ENTREPRENEUR',
                stats: {
                    totalProjects,
                    totalApplicationsReceived,
                    companyName: user.entrepreneurProfile?.companyName || '',
                    website: user.entrepreneurProfile?.website || '',
                },
            };
        }
        else {
            const totalUsers = await this.prisma.user.count();
            const totalProjects = await this.prisma.project.count();
            const totalConversations = await this.prisma.conversation.count();
            return {
                role: 'ADMIN',
                stats: {
                    totalUsers,
                    totalProjects,
                    totalConversations,
                },
            };
        }
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map