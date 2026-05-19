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
    
    let userSkills: string[] = [];
    if (user.role === 'FREELANCER') {
      const flProfile = await this.prisma.freelancerProfile.findUnique({
        where: { userId },
      });
      if (flProfile && flProfile.skills) {
        userSkills = flProfile.skills;
      }
    }

    // Suggest other professional users
    const suggestedRole = user.role === 'ENTREPRENEUR' ? 'FREELANCER' : 'ENTREPRENEUR';

    const suggestions = await this.prisma.user.findMany({
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
      take: 20,
    });

    if (userSkills.length > 0) {
      return suggestions.sort((a, b) => {
        const aSkills = a.freelancerProfile?.skills || [];
        const bSkills = b.freelancerProfile?.skills || [];
        const aMatches = aSkills.filter((s) => userSkills.includes(s)).length;
        const bMatches = bSkills.filter((s) => userSkills.includes(s)).length;
        return bMatches - aMatches;
      });
    }

    return suggestions;
  }
}
