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
exports.AdvertisementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdvertisementsService = class AdvertisementsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findActive(placement) {
        const now = new Date();
        return this.prisma.advertisement.findMany({
            where: {
                isActive: true,
                ...(placement ? { placement: placement } : {}),
                AND: [
                    { OR: [{ endDate: null }, { endDate: { gte: now } }] },
                    { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                ],
            },
            include: {
                advertiser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
    }
    async findMyAds(userId) {
        return this.prisma.advertisement.findMany({
            where: { advertiserId: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(userId, dto) {
        return this.prisma.advertisement.create({
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                advertiserId: userId,
            },
        });
    }
    async update(id, userId, dto) {
        const ad = await this.prisma.advertisement.findUnique({ where: { id } });
        if (!ad)
            throw new common_1.NotFoundException('Publicité introuvable');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (ad.advertiserId !== userId && user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Accès interdit');
        }
        return this.prisma.advertisement.update({ where: { id }, data: dto });
    }
    async trackImpression(id) {
        return this.prisma.advertisement.update({
            where: { id },
            data: { impressions: { increment: 1 } },
        });
    }
    async trackClick(id) {
        return this.prisma.advertisement.update({
            where: { id },
            data: { clicks: { increment: 1 } },
        });
    }
    async getStats(id, userId) {
        const ad = await this.prisma.advertisement.findUnique({ where: { id } });
        if (!ad)
            throw new common_1.NotFoundException('Publicité introuvable');
        if (ad.advertiserId !== userId)
            throw new common_1.ForbiddenException('Accès interdit');
        const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
        return { ...ad, ctr };
    }
};
exports.AdvertisementsService = AdvertisementsService;
exports.AdvertisementsService = AdvertisementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdvertisementsService);
//# sourceMappingURL=advertisements.service.js.map