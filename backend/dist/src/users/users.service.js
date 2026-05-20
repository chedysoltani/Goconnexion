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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
                isEmailVerified: true,
                birthDate: true,
                lastActiveAt: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
                birthDate: true,
                lastActiveAt: true,
            },
        });
    }
    async getSuggestions(userId) {
        const user = await this.findOne(userId);
        let userSkills = [];
        if (user.role === 'FREELANCER') {
            const flProfile = await this.prisma.freelancerProfile.findUnique({
                where: { userId },
            });
            if (flProfile && flProfile.skills) {
                userSkills = flProfile.skills;
            }
        }
        const suggestedRole = user.role === 'ENTREPRENEUR' ? 'FREELANCER' : 'ENTREPRENEUR';
        const suggestions = await this.prisma.user.findMany({
            where: {
                role: suggestedRole,
                NOT: { id: userId },
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                role: true,
                freelancerProfile: true,
                entrepreneurProfile: true,
            },
            take: 20,
        });
        if (userSkills.length > 0) {
            return suggestions.sort((a, b) => {
                const aSkills = a.freelancerProfile?.skills || [];
                const bSkills = b.freelancerProfile?.skills || [];
                const aMatches = aSkills.filter((s) => userSkills.includes(s)).length;
                const bMatches = bSkills.filter((s) => userSkills.includes(s)).length;
                return bMatches - aMatches;
            });
        }
        return suggestions;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map