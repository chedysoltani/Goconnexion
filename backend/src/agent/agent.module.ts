import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ClaudeService } from './shared/claude.service';
import { ChatbotController } from './chatbot/chatbot.controller';
import { ChatbotService } from './chatbot/chatbot.service';
import { ContentController } from './content/content.controller';
import { ContentService } from './content/content.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController, ContentController],
  providers: [ClaudeService, ChatbotService, ContentService],
  exports: [ClaudeService],
})
export class AgentModule {}
