"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let EventsService = class EventsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async findAll(filters) {
        const where = { isActive: true };
        if (filters?.category)
            where.category = filters.category;
        if (filters?.type)
            where.type = filters.type;
        if (filters?.upcoming)
            where.startDate = { gte: new Date() };
        return this.prisma.event.findMany({
            where,
            include: {
                organizer: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } },
                _count: { select: { registrations: true } },
            },
            orderBy: { startDate: 'asc' },
        });
    }
    async findOne(id) {
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
        if (!event)
            throw new common_1.NotFoundException('Événement introuvable');
        return event;
    }
    async create(userId, dto) {
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
    async update(id, userId, dto) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Événement introuvable');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (event.organizerId !== userId && user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Accès interdit');
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
    async remove(id, userId) {
        const event = await this.prisma.event.findUnique({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException('Événement introuvable');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (event.organizerId !== userId && user?.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Accès interdit');
        }
        await this.prisma.event.update({ where: { id }, data: { isActive: false } });
        return { message: 'Événement supprimé' };
    }
    async register(eventId, userId) {
        const event = await this.prisma.event.findUnique({
            where: { id: eventId },
            include: { _count: { select: { registrations: true } } },
        });
        if (!event)
            throw new common_1.NotFoundException('Événement introuvable');
        if (!event.isActive)
            throw new common_1.BadRequestException('Événement non disponible');
        const existing = await this.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
        if (existing)
            throw new common_1.BadRequestException('Déjà inscrit');
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
    async cancelRegistration(eventId, userId) {
        const reg = await this.prisma.eventRegistration.findUnique({
            where: { eventId_userId: { eventId, userId } },
        });
        if (!reg)
            throw new common_1.NotFoundException('Inscription introuvable');
        return this.prisma.eventRegistration.update({
            where: { eventId_userId: { eventId, userId } },
            data: { status: 'CANCELLED' },
        });
    }
    async getMyRegistrations(userId) {
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
    async getEventParticipants(eventId) {
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
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], EventsService);
//# sourceMappingURL=events.service.js.map