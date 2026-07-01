import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getEarnings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { freelancerProfile: true },
    });

    if (!user?.freelancerProfile) {
      return { earnings: [], totalPaid: 0, totalPending: 0 };
    }

    const applications = await this.prisma.projectApplication.findMany({
      where: {
        freelancerId: user.freelancerProfile.id,
        status: { in: ['ACCEPTED', 'PENDING'] },
      },
      include: {
        project: {
          include: {
            owner: {
              include: {
                user: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const earnings = applications.map((app) => ({
      id: app.id,
      source: app.project.title,
      amount: app.project.budget ?? 0,
      date: app.updatedAt,
      status: app.status === 'ACCEPTED' ? 'paid' : 'pending',
      client: {
        name: `${app.project.owner.user.firstName} ${app.project.owner.user.lastName}`,
        company: app.project.owner.companyName ?? '',
      },
      project: app.project.title,
    }));

    const totalPaid = earnings
      .filter((e) => e.status === 'paid')
      .reduce((s, e) => s + e.amount, 0);
    const totalPending = earnings
      .filter((e) => e.status === 'pending')
      .reduce((s, e) => s + e.amount, 0);

    return { earnings, totalPaid, totalPending };
  }

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
