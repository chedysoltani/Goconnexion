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
exports.ReferralService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let ReferralService = class ReferralService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateCode(firstName) {
        const base = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
        const random = (0, crypto_1.randomBytes)(3).toString('hex').toUpperCase();
        return `${base}-${random}`;
    }
    async getOrCreateCode(userId) {
        const existing = await this.prisma.referralCode.findUnique({
            where: { userId },
            include: {
                referrals: {
                    include: {
                        referredUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (existing)
            return existing;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        let code = this.generateCode(user.firstName);
        let attempts = 0;
        while (attempts < 5) {
            const taken = await this.prisma.referralCode.findUnique({ where: { code } });
            if (!taken)
                break;
            code = this.generateCode(user.firstName);
            attempts++;
        }
        return this.prisma.referralCode.create({
            data: { userId, code },
            include: { referrals: true },
        });
    }
    async getDashboard(userId) {
        const referralCode = await this.getOrCreateCode(userId);
        const referrals = await this.prisma.referral.findMany({
            where: { referralCodeId: referralCode.id },
            include: {
                referredUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            code: referralCode.code,
            totalReferrals: referralCode.totalReferrals,
            referrals,
        };
    }
    async registerReferral(code, newUserId) {
        const referralCode = await this.prisma.referralCode.findUnique({ where: { code } });
        if (!referralCode)
            return null;
        if (referralCode.userId === newUserId)
            return null;
        const alreadyReferred = await this.prisma.referral.findUnique({
            where: { referredUserId: newUserId },
        });
        if (alreadyReferred)
            return null;
        await this.prisma.$transaction([
            this.prisma.referral.create({
                data: { referralCodeId: referralCode.id, referredUserId: newUserId },
            }),
            this.prisma.referralCode.update({
                where: { id: referralCode.id },
                data: { totalReferrals: { increment: 1 } },
            }),
        ]);
        return { success: true };
    }
    async getLeaderboard() {
        return this.prisma.referralCode.findMany({
            where: { totalReferrals: { gt: 0 } },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            },
            orderBy: { totalReferrals: 'desc' },
            take: 10,
        });
    }
};
exports.ReferralService = ReferralService;
exports.ReferralService = ReferralService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReferralService);
//# sourceMappingURL=referral.service.js.map