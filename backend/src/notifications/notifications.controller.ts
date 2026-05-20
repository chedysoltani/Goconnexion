import { Controller, Get, Post, Put, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CronService } from './cron.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly cronService: CronService,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.notificationsService.findAll(req.user.id);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Post('test/birthday')
  async testBirthday(@Request() req: any) {
    return this.cronService.triggerBirthdayWishForUser(req.user.id);
  }

  @Post('test/inactivity')
  async testInactivity(@Request() req: any) {
    return this.cronService.triggerInactivityCheckForUser(req.user.id);
  }
}
