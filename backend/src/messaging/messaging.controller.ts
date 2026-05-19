import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messaging')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations')
  async startConversation(
    @Request() req: any,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.messagingService.startConversation(req.user.id, targetUserId);
  }

  @Get('conversations')
  async getConversations(@Request() req: any) {
    return this.messagingService.getConversations(req.user.id);
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Param('id') conversationId: string,
    @Request() req: any,
  ) {
    return this.messagingService.getMessages(conversationId, req.user.id);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') conversationId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.messagingService.sendMessage(conversationId, req.user.id, content);
  }
}
