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
exports.ConnectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ConnectionsService = class ConnectionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendRequest(senderId, receiverId) {
        if (senderId === receiverId) {
            throw new common_1.BadRequestException('Vous ne pouvez pas vous connecter avec vous-même.');
        }
        const relationExists = await this.prisma.userRelation.findFirst({
            where: {
                OR: [
                    { userId: senderId, friendId: receiverId },
                    { userId: receiverId, friendId: senderId }
                ]
            }
        });
        if (relationExists) {
            throw new common_1.BadRequestException('Vous êtes déjà connectés avec ce membre.');
        }
        const requestExists = await this.prisma.connectionRequest.findFirst({
            where: {
                OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            }
        });
        if (requestExists) {
            if (requestExists.status === client_1.RequestStatus.ACCEPTED) {
                throw new common_1.BadRequestException('Vous êtes déjà connectés.');
            }
            throw new common_1.BadRequestException('Une demande de connexion est déjà en cours avec ce membre.');
        }
        const request = await this.prisma.connectionRequest.create({
            data: {
                senderId,
                receiverId,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    }
                }
            }
        });
        try {
            const sender = await this.prisma.user.findUnique({ where: { id: senderId } });
            if (sender) {
                const notif = await this.prisma.notification.create({
                    data: {
                        userId: receiverId,
                        title: 'Nouvelle invitation de connexion',
                        content: `${sender.firstName} ${sender.lastName} souhaite rejoindre votre réseau professionnel.`,
                        type: 'CONNECTION_REQUEST',
                    }
                });
                const { MessagingGateway } = require('../messaging/messaging.gateway');
                MessagingGateway.emitToUser(receiverId, 'notification', notif);
            }
        }
        catch (err) {
            console.error('Error creating connection request notification:', err);
        }
        return request;
    }
    async acceptRequest(requestId, receiverId) {
        const request = await this.prisma.connectionRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.NotFoundException('Demande de connexion introuvable.');
        }
        if (request.receiverId !== receiverId) {
            throw new common_1.BadRequestException('Vous n\'êtes pas autorisé à accepter cette demande.');
        }
        if (request.status === client_1.RequestStatus.ACCEPTED) {
            throw new common_1.BadRequestException('Cette demande a déjà été acceptée.');
        }
        await this.prisma.connectionRequest.update({
            where: { id: requestId },
            data: { status: client_1.RequestStatus.ACCEPTED },
        });
        await this.prisma.userRelation.createMany({
            data: [
                { userId: request.senderId, friendId: request.receiverId },
                { userId: request.receiverId, friendId: request.senderId },
            ],
            skipDuplicates: true,
        });
        try {
            const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } });
            if (receiver) {
                const notif = await this.prisma.notification.create({
                    data: {
                        userId: request.senderId,
                        title: 'Invitation de connexion acceptée',
                        content: `${receiver.firstName} ${receiver.lastName} a accepté votre invitation de connexion ! Vous êtes désormais connectés.`,
                        type: 'CONNECTION_ACCEPTED',
                    }
                });
                const { MessagingGateway } = require('../messaging/messaging.gateway');
                MessagingGateway.emitToUser(request.senderId, 'notification', notif);
            }
        }
        catch (err) {
            console.error('Error creating connection accept notification:', err);
        }
        return { success: true, message: 'Demande de connexion acceptée !' };
    }
    async declineRequest(requestId, receiverId) {
        const request = await this.prisma.connectionRequest.findUnique({
            where: { id: requestId },
        });
        if (!request) {
            throw new common_1.NotFoundException('Demande de connexion introuvable.');
        }
        if (request.receiverId !== receiverId) {
            throw new common_1.BadRequestException('Vous n\'êtes pas autorisé à refuser cette demande.');
        }
        await this.prisma.connectionRequest.delete({
            where: { id: requestId },
        });
        return { success: true, message: 'Demande de connexion refusée.' };
    }
    async getPendingRequests(userId) {
        return this.prisma.connectionRequest.findMany({
            where: {
                receiverId: userId,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getSentRequests(userId) {
        return this.prisma.connectionRequest.findMany({
            where: {
                senderId: userId,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    async getFriends(userId) {
        const relations = await this.prisma.userRelation.findMany({
            where: { userId },
            include: {
                friend: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return relations.map(r => r.friend);
    }
    async removeConnection(userId, friendId) {
        await this.prisma.userRelation.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });
        await this.prisma.connectionRequest.deleteMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: friendId },
                    { senderId: friendId, receiverId: userId }
                ]
            }
        });
        return { success: true, message: 'Connexion supprimée.' };
    }
};
exports.ConnectionsService = ConnectionsService;
exports.ConnectionsService = ConnectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ConnectionsService);
//# sourceMappingURL=connections.service.js.map