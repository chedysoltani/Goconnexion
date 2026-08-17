import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { ClaudeService } from './shared/claude.service';
import { ChatbotController } from './chatbot/chatbot.controller';
import { ChatbotService } from './chatbot/chatbot.service';
import { ContentController } from './content/content.controller';
import { ContentService } from './content/content.service';
import { ProspectsService } from './prospects/prospects.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ChatbotController, ContentController],
  providers: [ClaudeService, ChatbotService, ContentService, ProspectsService],
  exports: [ClaudeService],
})
export class AgentModule {}
