import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feedPost.findMany({
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

      try {
        const { MessagingGateway } = require('../messaging/messaging.gateway');
        MessagingGateway.emitToAll('postLikeUpdated', { postId, userId, liked: false });
      } catch (err) {
        console.error('Error broadcasting postLikeUpdated over socket:', err);
      }

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

      try {
        const { MessagingGateway } = require('../messaging/messaging.gateway');
        MessagingGateway.emitToAll('postLikeUpdated', { postId, userId, liked: true });
      } catch (err) {
        console.error('Error broadcasting postLikeUpdated over socket:', err);
      }

      return { liked: true };
    }
  }

  async getTrending() {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await this.prisma.feedPost.findMany({
      where: { createdAt: { gte: since } },
      select: { content: true },
    });

    const counts = new Map<string, number>();
    const hashtagRegex = /#[\wÀ-ɏ]+/g;
    for (const post of posts) {
      const tags = post.content.match(hashtagRegex) ?? [];
      for (const tag of tags) {
        const key = tag.toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }

  async toggleSave(postId: string, userId: string) {
    const existing = await this.prisma.savedPost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.savedPost.delete({
        where: { userId_postId: { userId, postId } },
      });
      return { saved: false };
    }

    await this.prisma.savedPost.create({ data: { postId, userId } });
    return { saved: true };
  }

  async getSavedPosts(userId: string) {
    const saved = await this.prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
            likes: { select: { userId: true } },
            comments: {
              include: { author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return saved.map((s) => s.post);
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

    try {
      const { MessagingGateway } = require('../messaging/messaging.gateway');
      MessagingGateway.emitToAll('postCommentAdded', { postId, comment });
    } catch (err) {
      console.error('Error broadcasting postCommentAdded over socket:', err);
    }

    return comment;
  }
}
