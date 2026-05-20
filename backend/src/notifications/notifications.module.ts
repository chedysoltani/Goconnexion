import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CronService } from './cron.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, CronService],
  exports: [NotificationsService, CronService],
})
export class NotificationsModule {}
