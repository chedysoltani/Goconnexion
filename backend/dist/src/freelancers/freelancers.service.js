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
exports.FreelancersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FreelancersService = class FreelancersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const profile = await this.prisma.freelancerProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Freelancer profile not found');
        }
        return profile;
    }
    async updateProfile(userId, data) {
        return this.prisma.freelancerProfile.update({
            where: { userId },
            data,
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters.skills) {
            const skillList = filters.skills.split(',').map(s => s.trim().toLowerCase());
            where.skills = {
                hasSome: skillList,
            };
        }
        if (filters.availableOnly) {
            where.isAvailable = true;
        }
        if (filters.minRate !== undefined || filters.maxRate !== undefined) {
            where.hourlyRate = {};
            if (filters.minRate !== undefined) {
                where.hourlyRate.gte = Number(filters.minRate);
            }
            if (filters.maxRate !== undefined) {
                where.hourlyRate.lte = Number(filters.maxRate);
            }
        }
        return this.prisma.freelancerProfile.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
};
exports.FreelancersService = FreelancersService;
exports.FreelancersService = FreelancersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FreelancersService);
//# sourceMappingURL=freelancers.service.js.map