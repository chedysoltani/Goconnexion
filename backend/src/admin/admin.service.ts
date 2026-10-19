import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlanType, UserRole } from '@prisma/client';

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
          isAmbassador: true,
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

  async setAmbassador(id: string, isAmbassador: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return this.prisma.user.update({
      where: { id },
      data: { isAmbassador },
      select: { id: true, firstName: true, lastName: true, email: true, isAmbassador: true },
    });
  }

  // Le rôle EDITOR est réservé à des comptes dédiés (ex. marketing@…) créés comme COLLABORATOR :
  // on refuse de convertir un compte membre FREELANCER/ENTREPRENEUR (il perdrait son profil)
  // et on ne touche jamais à un ADMIN. Retirer EDITOR repasse le compte en COLLABORATOR.
  async setEditor(id: string, editor: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const from = editor ? UserRole.COLLABORATOR : UserRole.EDITOR;
    const to = editor ? UserRole.EDITOR : UserRole.COLLABORATOR;
    if (user.role !== to && user.role !== from) {
      throw new BadRequestException(
        editor
          ? `Seul un compte COLLABORATOR peut devenir EDITOR (rôle actuel : ${user.role}). Créez un compte dédié.`
          : `Ce compte n'est pas EDITOR (rôle actuel : ${user.role}).`,
      );
    }
    return this.prisma.user.update({
      where: { id },
      data: { role: to },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });
  }

  async getAmbassadors() {
    const ambassadors = await this.prisma.user.findMany({
      where: { isAmbassador: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        referralCode: { select: { code: true, totalReferrals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ambassadors.map((a) => ({
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      email: a.email,
      avatarUrl: a.avatarUrl,
      createdAt: a.createdAt,
      referralCode: a.referralCode?.code ?? null,
      totalReferrals: a.referralCode?.totalReferrals ?? 0,
    }));
  }
}
