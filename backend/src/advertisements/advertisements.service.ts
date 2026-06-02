import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/advertisement.dto';

@Injectable()
export class AdvertisementsService {
  constructor(private prisma: PrismaService) {}

  async findActive(placement?: string) {
    const now = new Date();
    return this.prisma.advertisement.findMany({
      where: {
        isActive: true,
        ...(placement ? { placement: placement as any } : {}),
        AND: [
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        ],
      },
      include: {
        advertiser: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  async findMyAds(userId: string) {
    return this.prisma.advertisement.findMany({
      where: { advertiserId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateAdvertisementDto) {
    return this.prisma.advertisement.create({
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        advertiserId: userId,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateAdvertisementDto) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Publicité introuvable');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (ad.advertiserId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Accès interdit');
    }

    return this.prisma.advertisement.update({ where: { id }, data: dto });
  }

  async trackImpression(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { impressions: { increment: 1 } },
    });
  }

  async trackClick(id: string) {
    return this.prisma.advertisement.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    });
  }

  async getStats(id: string, userId: string) {
    const ad = await this.prisma.advertisement.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Publicité introuvable');
    if (ad.advertiserId !== userId) throw new ForbiddenException('Accès interdit');

    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
    return { ...ad, ctr };
  }
}
