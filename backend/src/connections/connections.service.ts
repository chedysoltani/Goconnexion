import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { PLAN_LIMITS } from '../subscription/subscription.service';

@Injectable()
export class ConnectionsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(senderId: string, receiverId: string, message?: string, isCoffee?: boolean) {
    if (senderId === receiverId) {
      throw new BadRequestException('Vous ne pouvez pas vous connecter avec vous-même.');
    }

    // Check connection limit for sender's plan
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      include: { subscription: true },
    });
    const plan = sender?.subscription?.plan ?? 'FREE';
    const limit = PLAN_LIMITS[plan]?.maxConnections ?? 10;
    if (limit !== -1) {
      const connectionCount = await this.prisma.userRelation.count({ where: { userId: senderId } });
      if (connectionCount >= limit) {
        throw new ForbiddenException(
          `Limite atteinte : votre plan ${plan === 'FREE' ? 'Gratuit' : plan} permet ${limit} connexions maximum. Passez à un plan supérieur pour continuer.`
        );
      }
    }

    // Check if relation already exists
    const relationExists = await this.prisma.userRelation.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId }
        ]
      }
    });

    if (relationExists) {
      throw new BadRequestException('Vous êtes déjà connectés avec ce membre.');
    }

    // Check if request already pending or accepted
    const requestExists = await this.prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      }
    });

    if (requestExists) {
      if (requestExists.status === RequestStatus.ACCEPTED) {
        throw new BadRequestException('Vous êtes déjà connectés.');
      }
      throw new BadRequestException('Une demande de connexion est déjà en cours avec ce membre.');
    }

    const request = await this.prisma.connectionRequest.create({
      data: {
        senderId,
        receiverId,
        status: RequestStatus.PENDING,
        message,
        isCoffee: isCoffee ?? false,
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
      if (sender) {
        const notif = await this.prisma.notification.create({
          data: {
            userId: receiverId,
            title: isCoffee ? '☕ Proposition de Café Virtuel !' : 'Nouvelle invitation de connexion',
            content: isCoffee
              ? `${sender.firstName} ${sender.lastName} vous propose de prendre un café virtuel ☕`
              : `${sender.firstName} ${sender.lastName} souhaite rejoindre votre réseau professionnel.`,
            type: 'CONNECTION_REQUEST',
          }
        });
        const { MessagingGateway } = require('../messaging/messaging.gateway');
        MessagingGateway.emitToUser(receiverId, 'notification', notif);
      }
    } catch (err) {
      console.error('Error creating connection request notification:', err);
    }

    return request;
  }

  async acceptRequest(requestId: string, receiverId: string) {
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande de connexion introuvable.');
    }

    if (request.receiverId !== receiverId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à accepter cette demande.');
    }

    if (request.status === RequestStatus.ACCEPTED) {
      throw new BadRequestException('Cette demande a déjà été acceptée.');
    }

    // Update status to ACCEPTED
    await this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.ACCEPTED },
    });

    // Create bidirectional relations
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
    } catch (err) {
      console.error('Error creating connection accept notification:', err);
    }

    return { success: true, message: 'Demande de connexion acceptée !' };
  }

  async declineRequest(requestId: string, receiverId: string) {
    const request = await this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Demande de connexion introuvable.');
    }

    if (request.receiverId !== receiverId) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à refuser cette demande.');
    }

    // Deleting the request allows sending it again in the future
    await this.prisma.connectionRequest.delete({
      where: { id: requestId },
    });

    return { success: true, message: 'Demande de connexion refusée.' };
  }

  async getPendingRequests(userId: string) {
    return this.prisma.connectionRequest.findMany({
      where: {
        receiverId: userId,
        status: RequestStatus.PENDING,
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

  async getSentRequests(userId: string) {
    return this.prisma.connectionRequest.findMany({
      where: {
        senderId: userId,
        status: RequestStatus.PENDING,
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

  async getFriends(userId: string) {
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

  async removeConnection(userId: string, friendId: string) {
    // Delete connection in both directions
    await this.prisma.userRelation.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    // Also remove the request
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
}
