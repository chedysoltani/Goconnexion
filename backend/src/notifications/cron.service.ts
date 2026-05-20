import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Run every day at 8:00 AM to wish users Happy Birthday
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleBirthdayWishes() {
    this.logger.log('Starting daily birthday checks...');
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentDay = today.getDate(); // 1-31

      // Find all users whose birthDate matches today's month and day (PostgreSQL raw query)
      const birthdayUsers = (await this.prisma.$queryRaw`
        SELECT id, "firstName", "lastName"
        FROM "User"
        WHERE EXTRACT(MONTH FROM "birthDate") = ${currentMonth}
          AND EXTRACT(DAY FROM "birthDate") = ${currentDay}
      `) as any[];

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
    } catch (error) {
      this.logger.error('Error running birthday wishes cron job:', error);
    }
  }

  /**
   * Run every day at 9:00 AM to check for inactive users (3 weeks of inactivity)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleInactivityCheck() {
    this.logger.log('Starting daily inactivity checks...');
    try {
      const now = new Date();
      
      // We check for users whose last active date is between 21 and 22 days ago
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
    } catch (error) {
      this.logger.error('Error running inactivity checks cron job:', error);
    }
  }

  /**
   * Helper to manually trigger birthday notification for testing
   */
  async triggerBirthdayWishForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;

    return this.notificationsService.create({
      userId: user.id,
      title: 'Joyeux Anniversaire ! 🎂 (Test)',
      content: `Toute l'équipe de GoConnexion vous souhaite un excellent anniversaire, ${user.firstName} ! Nous vous souhaitons une très belle réussite dans tous vos projets professionnels ! ✨`,
      type: 'SYSTEM',
    });
  }

  /**
   * Helper to manually trigger inactivity notification for testing
   */
  async triggerInactivityCheckForUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) return null;

    return this.notificationsService.create({
      userId: user.id,
      title: "Vous nous manquez ! 👋 (Test)",
      content: `Bonjour ${user.firstName}, cela fait 3 semaines que vous n'êtes pas venu sur GoConnexion. Nous espérons que tout va bien pour vous ! N'hésitez pas à venir faire un coucou et à découvrir les nouvelles opportunités professionnelles de la communauté. ✨`,
      type: 'SYSTEM',
    });
  }
}
