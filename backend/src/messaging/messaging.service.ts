import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PLAN_LIMITS } from '../subscription/subscription.service';

@Injectable()
export class MessagingService {
  constructor(private prisma: PrismaService) {}

  async startConversation(userId: string, targetUserId: string) {
    // Check if a direct message conversation already exists between these two users
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

    // Create a new direct conversation
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

  async getConversations(userId: string) {
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

  async getMessages(conversationId: string, userId: string) {
    // Validate membership
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
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

  async sendMessage(conversationId: string, senderId: string, content: string) {
    // Validate membership
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: senderId,
        },
      },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    // Check monthly message limit
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      include: { subscription: true },
    });
    const plan = sender?.subscription?.plan ?? 'FREE';
    const limit = PLAN_LIMITS[plan]?.maxMessagesPerMonth ?? 50;
    if (limit !== -1) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const messageCount = await this.prisma.message.count({
        where: { senderId, createdAt: { gte: startOfMonth } },
      });
      if (messageCount >= limit) {
        throw new ForbiddenException(
          `Limite atteinte : votre plan ${plan === 'FREE' ? 'Gratuit' : plan} permet ${limit} messages par mois. Passez à un plan supérieur pour continuer.`
        );
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

      // Update conversation timestamp
      await tx.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      // Create notifications for other participants
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
        } catch (err) {
          console.error('Error creating/emitting message notification:', err);
        }
      }

      return message;
    });
  }
}
