import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async findAll(filters?: { category?: string; type?: string; upcoming?: boolean }) {
    const where: any = { isActive: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;
    if (filters?.upcoming) where.startDate = { gte: new Date() };

    return this.prisma.event.findMany({
      where,
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
        registrations: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          },
          where: { status: { in: ['REGISTERED', 'ATTENDED'] } },
        },
        _count: { select: { registrations: true } },
      },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  async create(userId: string, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isFree: dto.isFree ?? (dto.price === 0 || !dto.price),
        organizerId: userId,
      },
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });
    return event;
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Événement introuvable');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (event.organizerId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Accès interdit');
    }

    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id } });
    if (!event) throw new NotFoundException('Événement introuvable');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (event.organizerId !== userId && user?.role !== 'ADMIN') {
      throw new ForbiddenException('Accès interdit');
    }

    await this.prisma.event.update({ where: { id }, data: { isActive: false } });
    return { message: 'Événement supprimé' };
  }

  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    if (!event.isActive) throw new BadRequestException('Événement non disponible');

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new BadRequestException('Déjà inscrit');

    const registeredCount = event._count.registrations;
    const status = event.capacity && registeredCount >= event.capacity ? 'WAITLISTED' : 'REGISTERED';

    const registration = await this.prisma.eventRegistration.create({
      data: { eventId, userId, status },
    });

    await this.notifications.create({
      userId,
      title: 'Inscription confirmée',
      content: `Votre inscription à "${event.title}" est confirmée. ${status === 'WAITLISTED' ? 'Vous êtes sur liste d\'attente.' : ''}`,
      type: 'EVENT',
    });

    return registration;
  }

  async cancelRegistration(eventId: string, userId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!reg) throw new NotFoundException('Inscription introuvable');

    return this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status: 'CANCELLED' },
    });
  }

  async getMyRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: {
        event: {
          include: {
            organizer: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { registrations: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventParticipants(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId, status: { in: ['REGISTERED', 'ATTENDED'] } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
      },
    });
  }

  async sendUpcomingReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const events = await this.prisma.event.findMany({
      where: { startDate: { gte: tomorrow, lte: dayAfter }, isActive: true },
      include: { registrations: { where: { status: 'REGISTERED' }, select: { userId: true } } },
    });

    for (const event of events) {
      for (const reg of event.registrations) {
        await this.notifications.create({
          userId: reg.userId,
          title: `Rappel : ${event.title} demain`,
          content: `N'oubliez pas ! "${event.title}" commence demain. ${event.type === 'PHYSICAL' ? `Lieu : ${event.location}` : `Lien : ${event.virtualLink}`}`,
          type: 'EVENT',
        });
      }
    }
  }
}
