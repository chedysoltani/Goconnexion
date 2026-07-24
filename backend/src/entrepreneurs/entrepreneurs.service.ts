import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EntrepreneursService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        projects: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Entrepreneur profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: {
    companyName?: string;
    website?: string;
    bio?: string;
    industry?: string;
  }) {
    return this.prisma.entrepreneurProfile.update({
      where: { userId },
      data,
    });
  }

  async findAll(filters: { industry?: string; search?: string } = {}) {
    const where: any = {};

    if (filters.industry) {
      where.industry = { contains: filters.industry.trim(), mode: 'insensitive' };
    }

    if (filters.search) {
      const searchWord = filters.search.trim();
      where.OR = [
        { companyName: { contains: searchWord, mode: 'insensitive' } },
        { bio: { contains: searchWord, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: searchWord, mode: 'insensitive' } },
              { lastName: { contains: searchWord, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return this.prisma.entrepreneurProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
