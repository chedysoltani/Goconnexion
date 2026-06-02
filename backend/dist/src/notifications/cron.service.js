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
var CronService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("./notifications.service");
let CronService = CronService_1 = class CronService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(CronService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async handleBirthdayWishes() {
        this.logger.log('Starting daily birthday checks...');
        try {
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            const birthdayUsers = (await this.prisma.$queryRaw `
        SELECT id, "firstName", "lastName"
        FROM "User"
        WHERE EXTRACT(MONTH FROM "birthDate") = ${currentMonth}
          AND EXTRACT(DAY FROM "birthDate") = ${currentDay}
      `);
            this.logger.log(`Found ${birthdayUsers.length} user(s) celebrating their birthday today.`);
            for (const u of birthdayUsers) {
                await this.notificationsService.create({
                    userId: u.id,
                    title: 'Joyeux Anniversaire ! 🎂',
                    content: `Toute l'équipe de GoConnexion vous souhaite un excellent anniversaire, ${u.firstName} ! Nous vous souhaitons une très belle réussite dans tous vos projets professionnels ! ✨`,
                    type: 'SYSTEM',
                });
                this.logger.log(`Birthday notification sent to user ${u.id} (${u.firstName} ${u.lastName})`);
            }
        }
        catch (error) {
            this.logger.error('Error running birthday wishes cron job:', error);
        }
    }
    async handleInactivityCheck() {
        this.logger.log('Starting daily inactivity checks...');
        try {
            const now = new Date();
            const twentyTwoDaysAgo = new Date();
            twentyTwoDaysAgo.setDate(now.getDate() - 22);
            const twentyOneDaysAgo = new Date();
            twentyOneDaysAgo.setDate(now.getDate() - 21);
            const inactiveUsers = await this.prisma.user.findMany({
                where: {
                    lastActiveAt: {
                        gte: twentyTwoDaysAgo,
                        lte: twentyOneDaysAgo,
                    },
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            });
            this.logger.log(`Found ${inactiveUsers.length} inactive user(s) (3 weeks of inactivity).`);
            for (const u of inactiveUsers) {
                await this.notificationsService.create({
                    userId: u.id,
                    title: 'Vous nous manquez ! 👋',
                    content: `Bonjour ${u.firstName}, cela fait 3 semaines que vous n'êtes pas venu sur GoConnexion. Nous espérons que tout va bien pour vous ! N'hésitez pas à venir faire un coucou et à découvrir les nouvelles opportunités professionnelles de la communauté. ✨`,
                    type: 'SYSTEM',
                });
                this.logger.log(`Inactivity notification sent to user ${u.id} (${u.firstName} ${u.lastName})`);
            }
        }
        catch (error) {
            this.logger.error('Error running inactivity checks cron job:', error);
        }
    }
    async triggerBirthdayWishForUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return null;
        return this.notificationsService.create({
            userId: user.id,
            title: 'Joyeux Anniversaire ! 🎂 (Test)',
            content: `Toute l'équipe de GoConnexion vous souhaite un excellent anniversaire, ${user.firstName} ! Nous vous souhaitons une très belle réussite dans tous vos projets professionnels ! ✨`,
            type: 'SYSTEM',
        });
    }
    async handleEventReminders() {
        this.logger.log('Starting daily event reminder checks...');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dayAfter = new Date();
            dayAfter.setDate(dayAfter.getDate() + 2);
            const events = (await this.prisma.$queryRaw `
        SELECT e.id, e.title, e.type, e.location, e."virtualLink"
        FROM "Event" e
        WHERE e."startDate" >= ${tomorrow} AND e."startDate" <= ${dayAfter} AND e."isActive" = true
      `);
            for (const event of events) {
                const registrations = (await this.prisma.$queryRaw `
          SELECT "userId" FROM "EventRegistration" WHERE "eventId" = ${event.id} AND status = 'REGISTERED'
        `);
                for (const reg of registrations) {
                    await this.notificationsService.create({
                        userId: reg.userId,
                        title: `Rappel : ${event.title} demain`,
                        content: `N'oubliez pas ! "${event.title}" commence demain. ${event.type === 'PHYSICAL' ? `Lieu : ${event.location}` : `Lien : ${event.virtualLink}`}`,
                        type: 'EVENT',
                    });
                }
            }
            this.logger.log(`Event reminders sent for ${events.length} upcoming events.`);
        }
        catch (error) {
            this.logger.error('Error running event reminders cron job:', error);
        }
    }
    async triggerInactivityCheckForUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            return null;
        return this.notificationsService.create({
            userId: user.id,
            title: "Vous nous manquez ! 👋 (Test)",
            content: `Bonjour ${user.firstName}, cela fait 3 semaines que vous n'êtes pas venu sur GoConnexion. Nous espérons que tout va bien pour vous ! N'hésitez pas à venir faire un coucou et à découvrir les nouvelles opportunités professionnelles de la communauté. ✨`,
            type: 'SYSTEM',
        });
    }
};
exports.CronService = CronService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleBirthdayWishes", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleInactivityCheck", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronService.prototype, "handleEventReminders", null);
exports.CronService = CronService = CronService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CronService);
//# sourceMappingURL=cron.service.js.map