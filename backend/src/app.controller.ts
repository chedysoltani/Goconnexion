import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('support')
  async submitSupport(
    @Body() body: { name?: string; email?: string; subject?: string; message: string },
  ) {
    await this.mailService.sendSupportTicket({
      fromName: body.name ?? 'Anonyme',
      fromEmail: body.email ?? '',
      subject: body.subject ?? 'Support général',
      message: body.message,
    });
    return { success: true };
  }
}
