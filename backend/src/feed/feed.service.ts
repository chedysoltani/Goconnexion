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
      return { liked: false };
    } else {
      await this.prisma.feedPostLike.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  async addComment(postId: string, userId: string, content: string) {
    // Validate post exists
    const post = await this.prisma.feedPost.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.feedPostComment.create({
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
  }
}
