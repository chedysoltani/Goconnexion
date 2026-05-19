import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserDashboardStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: true,
        entrepreneurProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'FREELANCER') {
      const freelancerProfileId = user.freelancerProfile?.id;
      
      const totalApplications = freelancerProfileId
        ? await this.prisma.projectApplication.count({ where: { freelancerId: freelancerProfileId } })
        : 0;

      const acceptedApplications = freelancerProfileId
        ? await this.prisma.projectApplication.count({
            where: { freelancerId: freelancerProfileId, status: 'ACCEPTED' },
          })
        : 0;

      return {
        role: 'FREELANCER',
        stats: {
          totalApplications,
          acceptedApplications,
          isAvailable: user.freelancerProfile?.isAvailable || false,
          hourlyRate: user.freelancerProfile?.hourlyRate || 0,
          skillsCount: user.freelancerProfile?.skills?.length || 0,
        },
      };
    } else if (user.role === 'ENTREPRENEUR') {
      const entrepreneurProfileId = user.entrepreneurProfile?.id;

      const totalProjects = entrepreneurProfileId
        ? await this.prisma.project.count({ where: { ownerId: entrepreneurProfileId } })
        : 0;

      const totalApplicationsReceived = entrepreneurProfileId
        ? await this.prisma.projectApplication.count({
            where: { project: { ownerId: entrepreneurProfileId } },
          })
        : 0;

      return {
        role: 'ENTREPRENEUR',
        stats: {
          totalProjects,
          totalApplicationsReceived,
          companyName: user.entrepreneurProfile?.companyName || '',
          website: user.entrepreneurProfile?.website || '',
        },
      };
    } else {
      // ADMIN or fallback
      const totalUsers = await this.prisma.user.count();
      const totalProjects = await this.prisma.project.count();
      const totalConversations = await this.prisma.conversation.count();
      
      return {
        role: 'ADMIN',
        stats: {
          totalUsers,
          totalProjects,
          totalConversations,
        },
      };
    }
  }
}
