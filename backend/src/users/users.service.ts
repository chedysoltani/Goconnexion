import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: { firstName?: string; lastName?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
      },
    });
  }

  // Networking Suggestions
  async getSuggestions(userId: string) {
    const user = await this.findOne(userId);
    
    // Suggest other professional users (freelancers if entrepreneur, entrepreneurs if freelancer)
    const suggestedRole = user.role === 'ENTREPRENEUR' ? 'FREELANCER' : 'ENTREPRENEUR';

    return this.prisma.user.findMany({
      where: {
        role: suggestedRole,
        NOT: { id: userId },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        role: true,
        freelancerProfile: true,
        entrepreneurProfile: true,
      },
      take: 10,
    });
  }
}
