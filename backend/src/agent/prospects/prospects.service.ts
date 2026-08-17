import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FollowUpReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';

const INACTIVITY_THRESHOLD_DAYS = 4;
const RESEND_COOLDOWN_DAYS = 14;

@Injectable()
export class ProspectsService {
  private readonly logger = new Logger(ProspectsService.name);

  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendInactivityReminders() {
    const thresholdDate = new Date(
      Date.now() - INACTIVITY_THRESHOLD_DAYS * 86_400_000,
    );
    const cooldownDate = new Date(
      Date.now() - RESEND_COOLDOWN_DAYS * 86_400_000,
    );

    const candidates = await this.prisma.user.findMany({
      where: {
        lastActiveAt: { lte: thresholdDate },
        followUps: {
          none: {
            reason: FollowUpReason.INACTIVITY,
            sentAt: { gte: cooldownDate },
          },
        },
      },
      select: { id: true, email: true, firstName: true },
    });

    for (const user of candidates) {
      try {
        await this.mail.sendReengagement(user);
        await this.prisma.agentFollowUp.create({
          data: { userId: user.id, reason: FollowUpReason.INACTIVITY },
        });
      } catch (err) {
        this.logger.error(
          `Échec relance inactivité pour ${user.email}: ${err}`,
        );
      }
    }

    if (candidates.length > 0) {
      this.logger.log(
        `Relance d'inactivité envoyée à ${candidates.length} utilisateur(s)`,
      );
    }
  }
}
