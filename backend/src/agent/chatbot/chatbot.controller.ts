import { Body, Controller, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ChatbotService } from './chatbot.service';
import {
  StartChatSessionDto,
  SendChatMessageDto,
  ConvertChatSessionDto,
} from './dto/chatbot-message.dto';

// Endpoint public (visiteurs anonymes du site marketing) — throttling dédié
// plus strict que la limite globale de l'app, chaque appel déclenchant une
// requête vers l'API Anthropic.
@Controller('agent/chatbot')
@Throttle({ default: { limit: 15, ttl: 60000 } })
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('sessions')
  startSession(@Body() dto: StartChatSessionDto) {
    return this.chatbotService.startSession(dto);
  }

  @Post('messages')
  sendMessage(@Body() dto: SendChatMessageDto) {
    return this.chatbotService.sendMessage(dto);
  }

  @Post('sessions/:id/convert')
  markConverted(@Param('id') id: string, @Body() dto: ConvertChatSessionDto) {
    return this.chatbotService.markConverted(id, dto.userId);
  }
}
