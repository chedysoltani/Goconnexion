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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const [totalUsers, totalProjects, totalEvents, totalConversations, activeSubscriptions] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.project.count(),
            this.prisma.event.count({ where: { isActive: true } }),
            this.prisma.conversation.count(),
            this.prisma.subscription.count({
                where: { status: 'ACTIVE', plan: { not: client_1.PlanType.FREE } },
            }),
        ]);
        return { totalUsers, totalProjects, totalEvents, totalConversations, activeSubscriptions };
    }
    async getUsers(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    plan: true,
                    createdAt: true,
                    lastActiveAt: true,
                    subscription: { select: { plan: true, status: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { users, total, page, limit };
    }
    async deleteUser(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        await this.prisma.user.delete({ where: { id } });
        return { message: 'Utilisateur supprimé' };
    }
    async updateUserPlan(id, plan) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        await this.prisma.user.update({ where: { id }, data: { plan } });
        await this.prisma.subscription.upsert({
            where: { userId: id },
            update: { plan, status: 'ACTIVE' },
            create: { userId: id, plan, status: 'ACTIVE' },
        });
        return { id, plan };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map