import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FreelancersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.freelancerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Freelancer profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: {
    title?: string;
    bio?: string;
    skills?: string[];
    portfolioUrl?: string;
    cvUrl?: string;
    isAvailable?: boolean;
    hourlyRate?: number;
  }) {
    return this.prisma.freelancerProfile.update({
      where: { userId },
      data,
    });
  }

  async findAll(filters: { skills?: string; minRate?: number; maxRate?: number; availableOnly?: boolean; search?: string }) {
    const where: any = {};

    if (filters.skills) {
      // Split comma separated skills and clean them
      const skillList = filters.skills.split(',').map(s => s.trim().toLowerCase());
      where.skills = {
        hasSome: skillList, // Match any of these skills
      };
    }

    if (filters.availableOnly) {
      where.isAvailable = true;
    }

    if (filters.minRate !== undefined || filters.maxRate !== undefined) {
      where.hourlyRate = {};
      if (filters.minRate !== undefined) {
        where.hourlyRate.gte = Number(filters.minRate);
      }
      if (filters.maxRate !== undefined) {
        where.hourlyRate.lte = Number(filters.maxRate);
      }
    }

    if (filters.search) {
      const searchWord = filters.search.trim();
      where.OR = [
        { title: { contains: searchWord, mode: 'insensitive' } },
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

    return this.prisma.freelancerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });
  }
}
