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
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
let MessagingService = class MessagingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async startConversation(userId, targetUserId) {
        const existing = await this.prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: targetUserId } } },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.conversation.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId },
                        { userId: targetUserId },
                    ],
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                                role: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getConversations(userId) {
        return this.prisma.conversation.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                                role: true,
                            },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getMessages(conversationId, userId) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId,
                },
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        return this.prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
    async sendMessage(conversationId, senderId, content) {
        const participant = await this.prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId,
                    userId: senderId,
                },
            },
        });
        if (!participant) {
            throw new common_1.ForbiddenException('You are not a participant in this conversation');
        }
        const sender = await this.prisma.user.findUnique({
            where: { id: senderId },
            include: { subscription: true },
        });
        const plan = sender?.subscription?.plan ?? 'FREE';
        const limit = subscription_service_1.PLAN_LIMITS[plan]?.maxMessagesPerMonth ?? 50;
        if (limit !== -1) {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const messageCount = await this.prisma.message.count({
                where: { senderId, createdAt: { gte: startOfMonth } },
            });
            if (messageCount >= limit) {
                throw new common_1.ForbiddenException(`Limite atteinte : votre plan ${plan === 'FREE' ? 'Gratuit' : plan} permet ${limit} messages par mois. Passez à un plan supérieur pour continuer.`);
            }
        }
        return this.prisma.$transaction(async (tx) => {
            const message = await tx.message.create({
                data: {
                    conversationId,
                    senderId,
                    content,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });
            await tx.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            });
            const otherParticipants = await tx.conversationParticipant.findMany({
                where: {
                    conversationId,
                    userId: { not: senderId },
                },
            });
            for (const p of otherParticipants) {
                try {
                    const notif = await tx.notification.create({
                        data: {
                            userId: p.userId,
                            title: `Nouveau message de ${message.sender.firstName}`,
                            content: content.length > 60 ? `${content.substring(0, 60)}...` : content,
                            type: 'MESSAGE',
                        },
                    });
                    const { MessagingGateway } = require('./messaging.gateway');
                    MessagingGateway.emitToUser(p.userId, 'notification', notif);
                }
                catch (err) {
                    console.error('Error creating/emitting message notification:', err);
                }
            }
            return message;
        });
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map