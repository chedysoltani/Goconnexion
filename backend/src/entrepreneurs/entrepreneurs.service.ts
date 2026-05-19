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
  }) {
    return this.prisma.entrepreneurProfile.update({
      where: { userId },
      data,
    });
  }

  async findAll() {
    return this.prisma.entrepreneurProfile.findMany({
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
