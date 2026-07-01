import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalProjects, totalEvents, totalConversations, activeSubscriptions] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.project.count(),
        this.prisma.event.count({ where: { isActive: true } }),
        this.prisma.conversation.count(),
        this.prisma.subscription.count({
          where: { status: 'ACTIVE', plan: { not: PlanType.FREE } },
        }),
      ]);

    return { totalUsers, totalProjects, totalEvents, totalConversations, activeSubscriptions };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          plan: true,
          createdAt: true,
          lastActiveAt: true,
          subscription: { select: { plan: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total, page, limit };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.prisma.user.delete({ where: { id } });
    return { message: 'Utilisateur supprimé' };
  }

  async updateUserPlan(id: string, plan: PlanType) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    await this.prisma.user.update({ where: { id }, data: { plan } });
    await this.prisma.subscription.upsert({
      where: { userId: id },
      update: { plan, status: 'ACTIVE' },
      create: { userId: id, plan, status: 'ACTIVE' },
    });
    return { id, plan };
  }
}
