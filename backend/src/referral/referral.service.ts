import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';
import { getFrontendUrl } from '../common/frontend-url';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  private generateCode(firstName: string): string {
    const base = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    const random = randomBytes(3).toString('hex').toUpperCase();
    return `${base}-${random}`;
  }

  async getOrCreateCode(userId: string) {
    const existing = await this.prisma.referralCode.findUnique({
      where: { userId },
      include: {
        referrals: {
          include: {
            referredUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    let code = this.generateCode(user.firstName);
    let attempts = 0;
    while (attempts < 5) {
      const taken = await this.prisma.referralCode.findUnique({ where: { code } });
      if (!taken) break;
      code = this.generateCode(user.firstName);
      attempts++;
    }

    return this.prisma.referralCode.create({
      data: { userId, code },
      include: { referrals: true },
    });
  }

  async getDashboard(userId: string) {
    const referralCode = await this.getOrCreateCode(userId);
    const referrals = await this.prisma.referral.findMany({
      where: { referralCodeId: referralCode.id },
      include: {
        referredUser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, createdAt: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      code: referralCode.code,
      totalReferrals: referralCode.totalReferrals,
      referrals,
    };
  }

  async registerReferral(code: string, newUserId: string) {
    const referralCode = await this.prisma.referralCode.findUnique({ where: { code } });
    if (!referralCode) return null;
    if (referralCode.userId === newUserId) return null;

    const alreadyReferred = await this.prisma.referral.findUnique({
      where: { referredUserId: newUserId },
    });
    if (alreadyReferred) return null;

    await this.prisma.$transaction([
      this.prisma.referral.create({
        data: { referralCodeId: referralCode.id, referredUserId: newUserId },
      }),
      this.prisma.referralCode.update({
        where: { id: referralCode.id },
        data: { totalReferrals: { increment: 1 } },
      }),
    ]);

    return { success: true };
  }

  // Stats détaillées pour la page /ambassadeur — inclut le statut d'abonnement payant de chaque filleul.
  async getAmbassadorStats(userId: string) {
    const referralCode = await this.getOrCreateCode(userId);
    const referrals = await this.prisma.referral.findMany({
      where: { referralCodeId: referralCode.id },
      include: {
        referredUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
            role: true,
            subscription: { select: { plan: true, status: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      referralCode: referralCode.code,
      referralLink: `${getFrontendUrl()}/auth/signup?ref=${referralCode.code}`,
      totalReferrals: referralCode.totalReferrals,
      referrals: referrals.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        referredUser: {
          id: r.referredUser.id,
          firstName: r.referredUser.firstName,
          lastName: r.referredUser.lastName,
          avatarUrl: r.referredUser.avatarUrl,
          role: r.referredUser.role,
        },
        isPaidSubscriber:
          r.referredUser.subscription?.status === 'ACTIVE' &&
          r.referredUser.subscription?.plan !== 'FREE',
      })),
    };
  }

  async getLeaderboard() {
    return this.prisma.referralCode.findMany({
      where: { totalReferrals: { gt: 0 } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { totalReferrals: 'desc' },
      take: 10,
    });
  }
}
