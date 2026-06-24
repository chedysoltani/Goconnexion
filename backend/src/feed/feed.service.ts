import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    let whereClause: any = {};

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

  async create(userId: string, data: { content: string; imageUrl?: string }) {
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

  async toggleLike(postId: string, userId: string) {
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
    } else {
      await this.prisma.feedPostLike.create({
        data: {
          postId,
          userId,
        },
      });

      // Notification with 10-min cooldown per post to avoid spam
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
      } catch (err) {
        console.error('Error creating post like notification:', err);
      }

      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    // Validate post exists
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
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

    // Notification with 5-min cooldown per post for comments
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
    } catch (err) {
      console.error('Error creating post comment notification:', err);
    }

    return comment;
  }
}
