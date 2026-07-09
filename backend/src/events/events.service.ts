import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Logger, Inject, forwardRef,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { StripeService } from '../subscription/stripe.service';
import { WiseService } from '../subscription/wise.service';
import { PaymentProvider } from '@prisma/client';
import {
  CreateEventDto, UpdateEventDto,
  CreateTicketTypeDto, UpdateTicketTypeDto,
  CreateBoothDto, UpdateBoothDto,
  RegisterCheckoutDto,
} from './dto/event.dto';

const EVENT_INCLUDE = {
  organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
  ticketTypes: true,
  booths: { include: { reservedBy: { select: { id: true, firstName: true, lastName: true } } } },
  _count: { select: { registrations: { where: { status: { in: ['REGISTERED', 'ATTENDED'] as any } } } } },
};

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private mail: MailService,
    @Inject(forwardRef(() => StripeService)) private stripe: StripeService,
    @Inject(forwardRef(() => WiseService)) private wise: WiseService,
  ) {}

  // ── List & Detail ──────────────────────────────────────────────────────

  async findAll(filters?: { category?: string; type?: string; upcoming?: boolean }) {
    const where: any = { isActive: true };
    if (filters?.category) where.category = filters.category;
    if (filters?.type) where.type = filters.type;
    if (filters?.upcoming) where.startDate = { gte: new Date() };

    return this.prisma.event.findMany({
      where,
      include: EVENT_INCLUDE,
      orderBy: { startDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        ...EVENT_INCLUDE,
        registrations: {
          where: { status: { in: ['REGISTERED', 'ATTENDED'] as any } },
          include: {
            user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            ticketType: true,
          },
        },
      },
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  // ── CRUD ──────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        isFree: dto.isFree ?? (dto.price === 0 || !dto.price),
        organizerId: userId,
      },
      include: EVENT_INCLUDE,
    });
  }

  async update(id: string, userId: string, dto: UpdateEventDto) {
    await this.assertOrganizer(id, userId);
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: EVENT_INCLUDE,
    });
  }

  async remove(id: string, userId: string) {
    await this.assertOrganizer(id, userId);
    await this.prisma.event.update({ where: { id }, data: { isActive: false } });
    return { message: 'Événement supprimé' };
  }

  // ── Ticket Types ──────────────────────────────────────────────────────

  async getTicketTypes(eventId: string) {
    return this.prisma.ticketType.findMany({
      where: { eventId },
      include: { _count: { select: { registrations: true } } },
      orderBy: { price: 'asc' },
    });
  }

  async createTicketType(eventId: string, userId: string, dto: CreateTicketTypeDto) {
    await this.assertOrganizer(eventId, userId);
    return this.prisma.ticketType.create({ data: { ...dto, eventId } });
  }

  async updateTicketType(ttId: string, userId: string, dto: UpdateTicketTypeDto) {
    const tt = await this.prisma.ticketType.findUnique({ where: { id: ttId } });
    if (!tt) throw new NotFoundException('Type de billet introuvable');
    await this.assertOrganizer(tt.eventId, userId);
    return this.prisma.ticketType.update({ where: { id: ttId }, data: dto });
  }

  async deleteTicketType(ttId: string, userId: string) {
    const tt = await this.prisma.ticketType.findUnique({ where: { id: ttId } });
    if (!tt) throw new NotFoundException('Type de billet introuvable');
    await this.assertOrganizer(tt.eventId, userId);
    await this.prisma.ticketType.delete({ where: { id: ttId } });
    return { message: 'Type de billet supprimé' };
  }

  // ── Booths ────────────────────────────────────────────────────────────

  async getBooths(eventId: string) {
    return this.prisma.booth.findMany({
      where: { eventId },
      include: { reservedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { number: 'asc' },
    });
  }

  async createBooth(eventId: string, userId: string, dto: CreateBoothDto) {
    await this.assertOrganizer(eventId, userId);
    return this.prisma.booth.create({ data: { ...dto, eventId } });
  }

  async updateBooth(boothId: string, userId: string, dto: UpdateBoothDto) {
    const booth = await this.prisma.booth.findUnique({ where: { id: boothId } });
    if (!booth) throw new NotFoundException('Stand introuvable');
    await this.assertOrganizer(booth.eventId, userId);
    return this.prisma.booth.update({ where: { id: boothId }, data: dto });
  }

  async deleteBooth(boothId: string, userId: string) {
    const booth = await this.prisma.booth.findUnique({ where: { id: boothId } });
    if (!booth) throw new NotFoundException('Stand introuvable');
    if (booth.status !== 'AVAILABLE') throw new BadRequestException('Impossible de supprimer un stand réservé');
    await this.assertOrganizer(booth.eventId, userId);
    await this.prisma.booth.delete({ where: { id: boothId } });
    return { message: 'Stand supprimé' };
  }

  // ── Registration with payment ─────────────────────────────────────────

  async registerWithPayment(eventId: string, userId: string, dto: RegisterCheckoutDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: { where: { status: { in: ['REGISTERED', 'ATTENDED'] as any } } } } } },
    });
    if (!event || !event.isActive) throw new NotFoundException('Événement introuvable ou inactif');

    const existing = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing && existing.status !== 'CANCELLED') throw new BadRequestException('Déjà inscrit à cet événement');

    // Validate ticket type
    let ticketType: any = null;
    if (dto.ticketTypeId) {
      ticketType = await this.prisma.ticketType.findUnique({ where: { id: dto.ticketTypeId } });
      if (!ticketType || ticketType.eventId !== eventId) throw new NotFoundException('Type de billet invalide');
      if (ticketType.capacity) {
        const sold = await this.prisma.eventRegistration.count({
          where: { ticketTypeId: dto.ticketTypeId, status: { in: ['REGISTERED', 'ATTENDED'] as any } },
        });
        if (sold >= ticketType.capacity) throw new BadRequestException('Ce type de billet est épuisé');
      }
    }

    // Validate booth
    let booth: any = null;
    if (dto.boothId) {
      booth = await this.prisma.booth.findUnique({ where: { id: dto.boothId } });
      if (!booth || booth.eventId !== eventId) throw new NotFoundException('Stand invalide');
      if (booth.status !== 'AVAILABLE') throw new BadRequestException('Ce stand n\'est plus disponible');
    }

    // Calculate total
    const registeredCount = event._count.registrations;
    const capacityStatus = event.capacity && registeredCount >= event.capacity ? 'WAITLISTED' : 'REGISTERED';

    const ticketPrice = ticketType?.price ?? (event.isFree ? 0 : event.price ?? 0);
    const boothPrice = booth?.price ?? 0;
    const totalAmount = ticketPrice + boothPrice;
    const currency = ticketType?.currency ?? booth?.currency ?? event.currency ?? 'CAD';
    const isFree = totalAmount === 0;

    // Create or reactivate registration
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const registration = existing
      ? await this.prisma.eventRegistration.update({
          where: { id: existing.id },
          data: {
            status: isFree ? capacityStatus : 'WAITLISTED',
            ticketTypeId: dto.ticketTypeId ?? null,
            boothId: dto.boothId ?? null,
            paidAt: null,
            paymentId: null,
          },
        })
      : await this.prisma.eventRegistration.create({
          data: {
            eventId, userId,
            status: isFree ? capacityStatus : 'WAITLISTED',
            ticketTypeId: dto.ticketTypeId ?? undefined,
            boothId: dto.boothId ?? undefined,
          },
        });

    // Reserve booth immediately (pending payment)
    if (booth && !isFree) {
      await this.prisma.booth.update({
        where: { id: booth.id },
        data: { status: 'RESERVED', reservedById: userId },
      });
    }

    // Free flow — activate immediately
    if (isFree) {
      await this.activateEventRegistration(registration.id, 'free', PaymentProvider.STRIPE);
      return { free: true, registrationId: registration.id };
    }

    // Stripe flow
    if (!dto.provider || dto.provider === 'stripe') {
      if (this.stripe.isConfigured()) {
        const customer = await this.stripe.createOrRetrieveCustomer(userId, user.email, `${user.firstName} ${user.lastName}`);
        const session = await this.stripe.createEventCheckoutSession({
          customerId: customer,
          amount: Math.round(totalAmount * 100),
          currency: currency.toLowerCase(),
          eventTitle: event.title,
          registrationId: registration.id,
          eventId,
          userId,
          boothId: booth?.id,
          successUrl: `${process.env.FRONTEND_URL}/events/ticket/${registration.ticketCode}?payment=success`,
          cancelUrl: `${process.env.FRONTEND_URL}/events/${eventId}?payment=cancelled`,
        });
        return { url: session, free: false, registrationId: registration.id };
      }
      // Sandbox — activate directly
      await this.activateEventRegistration(registration.id, 'sandbox', PaymentProvider.STRIPE);
      return { free: true, registrationId: registration.id, sandboxActivated: true };
    }

    // Wise flow
    const reference = `WE-${registration.id.slice(0, 8)}-${Date.now()}`;
    await this.prisma.eventRegistration.update({
      where: { id: registration.id },
      data: { paymentId: reference },
    });
    const accountDetails = await this.wise.getAccountDetails(currency);
    return {
      free: false,
      registrationId: registration.id,
      ticketCode: registration.ticketCode,
      reference,
      amount: totalAmount,
      currency,
      accountDetails,
      redirectUrl: `${process.env.FRONTEND_URL}/events/ticket/${registration.ticketCode}?provider=wise&ref=${reference}&amount=${totalAmount}&currency=${currency}`,
    };
  }

  async activateEventRegistration(registrationId: string, paymentId: string, provider: PaymentProvider) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        ticketType: true,
        booth: true,
      },
    });
    if (!reg) throw new NotFoundException('Inscription introuvable');
    if (reg.status === 'ATTENDED' || (reg.status === 'REGISTERED' && reg.paidAt)) return;

    await this.prisma.$transaction(async (tx) => {
      await tx.eventRegistration.update({
        where: { id: registrationId },
        data: { status: 'REGISTERED', paidAt: new Date(), paymentId, paymentProvider: provider },
      });
      if (reg.boothId) {
        await tx.booth.update({ where: { id: reg.boothId }, data: { status: 'OCCUPIED', paidAt: new Date() } });
      }
    });

    await this.notifications.create({
      userId: reg.userId,
      title: 'Inscription confirmée',
      content: `Votre inscription à "${reg.event.title}" est confirmée. ${reg.booth ? `Stand : ${reg.booth.number}` : ''}`,
      type: 'EVENT',
    });

    try {
      await this.mail.sendEventTicket(reg.user, reg.event, reg.ticketCode, reg.ticketType, reg.booth);
    } catch (e) {
      this.logger.warn(`Email ticket non envoyé : ${e.message}`);
    }
  }

  // ── Check-in ──────────────────────────────────────────────────────────

  async checkIn(ticketCode: string, organizerId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { ticketCode },
      include: { event: true },
    });
    if (!reg) throw new NotFoundException('Ticket introuvable');
    if (reg.event.organizerId !== organizerId) {
      const user = await this.prisma.user.findUnique({ where: { id: organizerId } });
      if (user?.role !== 'ADMIN') throw new ForbiddenException('Seul l\'organisateur peut effectuer le check-in');
    }
    if (reg.status === 'CANCELLED') throw new BadRequestException('Inscription annulée');
    if (reg.status === 'WAITLISTED') throw new BadRequestException('Inscription en liste d\'attente — paiement non confirmé');

    return this.prisma.eventRegistration.update({
      where: { ticketCode },
      data: { status: 'ATTENDED', checkedInAt: new Date() },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        ticketType: true,
        booth: true,
        event: { select: { id: true, title: true } },
      },
    });
  }

  async getRegistrationByTicketCode(ticketCode: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { ticketCode },
      include: {
        event: {
          include: {
            organizer: { select: { id: true, firstName: true, lastName: true } },
          },
        },
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        ticketType: true,
        booth: true,
      },
    });
    if (!reg) throw new NotFoundException('Ticket introuvable');
    return reg;
  }

  // ── Registrations ─────────────────────────────────────────────────────

  async register(eventId: string, userId: string) {
    return this.registerWithPayment(eventId, userId, {});
  }

  async cancelRegistration(eventId: string, userId: string) {
    const reg = await this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!reg) throw new NotFoundException('Inscription introuvable');

    await this.prisma.eventRegistration.update({
      where: { eventId_userId: { eventId, userId } },
      data: { status: 'CANCELLED' },
    });

    // Release booth if reserved
    if (reg.boothId) {
      await this.prisma.booth.update({
        where: { id: reg.boothId },
        data: { status: 'AVAILABLE', reservedById: null, paidAt: null },
      });
    }

    // Promote first WAITLISTED to REGISTERED
    const next = await this.prisma.eventRegistration.findFirst({
      where: { eventId, status: 'WAITLISTED' },
      orderBy: { createdAt: 'asc' },
    });
    if (next) {
      await this.prisma.eventRegistration.update({
        where: { id: next.id },
        data: { status: 'REGISTERED' },
      });
      await this.notifications.create({
        userId: next.userId,
        title: 'Bonne nouvelle !',
        content: `Une place s'est libérée — vous êtes maintenant inscrit à l'événement.`,
        type: 'EVENT',
      });
    }

    return { message: 'Inscription annulée' };
  }

  async getMyRegistrations(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: {
        event: { include: { organizer: { select: { id: true, firstName: true, lastName: true } }, _count: { select: { registrations: true } } } },
        ticketType: true,
        booth: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEventParticipants(eventId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId, status: { in: ['REGISTERED', 'ATTENDED'] as any } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true } },
        ticketType: true,
        booth: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ── Reminders cron ────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendUpcomingReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const events = await this.prisma.event.findMany({
      where: { startDate: { gte: tomorrow, lte: dayAfter }, isActive: true },
      include: {
        registrations: {
          where: { status: 'REGISTERED' },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        },
      },
    });

    for (const event of events) {
      for (const reg of event.registrations) {
        await this.notifications.create({
          userId: reg.userId,
          title: `Rappel : ${event.title} demain`,
          content: `N'oubliez pas ! "${event.title}" commence demain. ${event.type === 'PHYSICAL' ? `Lieu : ${event.location ?? event.address}` : `Lien : ${event.virtualLink}`}`,
          type: 'EVENT',
        });
        try {
          await this.mail.sendEventReminder(reg.user, event, reg.ticketCode);
        } catch { /* non bloquant */ }
      }
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  private async assertOrganizer(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Événement introuvable');
    if (event.organizerId === userId) return event;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== 'ADMIN') throw new ForbiddenException('Seul l\'organisateur peut effectuer cette action');
    return event;
  }
}
