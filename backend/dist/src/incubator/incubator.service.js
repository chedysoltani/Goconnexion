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
exports.IncubatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
let IncubatorService = class IncubatorService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPost(userId, data) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { subscription: true },
        });
        const plan = user?.subscription?.plan ?? 'FREE';
        const limit = subscription_service_1.PLAN_LIMITS[plan]?.maxIncubatorPosts ?? 1;
        if (limit !== -1) {
            const postCount = await this.prisma.incubatorPost.count({ where: { authorId: userId } });
            if (postCount >= limit) {
                throw new common_1.ForbiddenException(`Limite atteinte : votre plan ${plan === 'FREE' ? 'Gratuit' : plan} permet ${limit} post(s) dans l'incubateur. Passez à un plan supérieur pour continuer.`);
            }
        }
        return this.prisma.incubatorPost.create({
            data: {
                title: data.title,
                content: data.content,
                category: data.category,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
        });
    }
    async findAll(category) {
        const where = category ? { category } : {};
        return this.prisma.incubatorPost.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                likes: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const post = await this.prisma.incubatorPost.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                likes: true,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    async deletePost(id, userId) {
        const post = await this.findOne(id);
        if (post.authorId !== userId) {
            throw new common_1.ForbiddenException('You are not the author of this post');
        }
        return this.prisma.incubatorPost.delete({
            where: { id },
        });
    }
    async addComment(userId, postId, content) {
        await this.findOne(postId);
        return this.prisma.incubatorComment.create({
            data: {
                postId,
                content,
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }
    async toggleLike(userId, postId) {
        await this.findOne(postId);
        const existingLike = await this.prisma.incubatorLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (existingLike) {
            await this.prisma.incubatorLike.delete({
                where: { id: existingLike.id },
            });
            return { liked: false };
        }
        else {
            await this.prisma.incubatorLike.create({
                data: {
                    postId,
                    userId,
                },
            });
            return { liked: true };
        }
    }
};
exports.IncubatorService = IncubatorService;
exports.IncubatorService = IncubatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IncubatorService);
//# sourceMappingURL=incubator.service.js.map