import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IncubatorService {
  constructor(private prisma: PrismaService) {}

  async createPost(userId: string, data: { title: string; content: string; category: string }) {
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

  async findAll(category?: string) {
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

  async findOne(id: string) {
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
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async deletePost(id: string, userId: string) {
    const post = await this.findOne(id);
    if (post.authorId !== userId) {
      throw new ForbiddenException('You are not the author of this post');
    }

    return this.prisma.incubatorPost.delete({
      where: { id },
    });
  }

  async addComment(userId: string, postId: string, content: string) {
    // Validate post exists
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

  async toggleLike(userId: string, postId: string) {
    // Validate post exists
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
    } else {
      await this.prisma.incubatorLike.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }
}
