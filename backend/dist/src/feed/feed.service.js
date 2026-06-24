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
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FeedService = class FeedService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(userId) {
        let whereClause = {};
        if (userId) {
            const relations = await this.prisma.userRelation.findMany({
                where: { userId },
                select: { friendId: true },
            });
            const friendIds = relations.map(r => r.friendId);
            whereClause = { authorId: { in: [...friendIds, userId] } };
        }
        return this.prisma.feedPost.findMany({
            where: whereClause,
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
                likes: {
                    select: {
                        userId: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async create(userId, data) {
        return this.prisma.feedPost.create({
            data: {
                content: data.content,
                imageUrl: data.imageUrl,
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
                likes: true,
                comments: true,
            },
        });
    }
    async toggleLike(postId, userId) {
        const existing = await this.prisma.feedPostLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId,
                },
            },
        });
        if (existing) {
            await this.prisma.feedPostLike.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId,
                    },
                },
            });
            return { liked: false };
        }
        else {
            await this.prisma.feedPostLike.create({
                data: {
                    postId,
                    userId,
                },
            });
            try {
                const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
                if (post && post.authorId !== userId) {
                    const cooldownMs = 10 * 60 * 1000;
                    const recent = await this.prisma.notification.findFirst({
                        where: {
                            userId: post.authorId,
                            type: 'LIKE',
                            createdAt: { gte: new Date(Date.now() - cooldownMs) },
                        },
                    });
                    if (!recent) {
                        const sender = await this.prisma.user.findUnique({ where: { id: userId } });
                        if (sender) {
                            const notif = await this.prisma.notification.create({
                                data: {
                                    userId: post.authorId,
                                    title: 'Nouveau j\'aime sur votre publication',
                                    content: `${sender.firstName} ${sender.lastName} a aimé votre publication.`,
                                    type: 'LIKE',
                                },
                            });
                            const { MessagingGateway } = require('../messaging/messaging.gateway');
                            MessagingGateway.emitToUser(post.authorId, 'notification', notif);
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error creating post like notification:', err);
            }
            return { liked: true };
        }
    }
    async addComment(postId, userId, content) {
        const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const comment = await this.prisma.feedPostComment.create({
            data: {
                postId,
                authorId: userId,
                content,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        try {
            if (post.authorId !== userId) {
                const cooldownMs = 5 * 60 * 1000;
                const recent = await this.prisma.notification.findFirst({
                    where: {
                        userId: post.authorId,
                        type: 'COMMENT',
                        createdAt: { gte: new Date(Date.now() - cooldownMs) },
                    },
                });
                if (!recent) {
                    const notif = await this.prisma.notification.create({
                        data: {
                            userId: post.authorId,
                            title: 'Nouveau commentaire sur votre publication',
                            content: `${comment.author.firstName} ${comment.author.lastName} a commenté : "${content.length > 40 ? content.substring(0, 40) + '...' : content}"`,
                            type: 'COMMENT',
                        },
                    });
                    const { MessagingGateway } = require('../messaging/messaging.gateway');
                    MessagingGateway.emitToUser(post.authorId, 'notification', notif);
                }
            }
        }
        catch (err) {
            console.error('Error creating post comment notification:', err);
        }
        return comment;
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FeedService);
//# sourceMappingURL=feed.service.js.map