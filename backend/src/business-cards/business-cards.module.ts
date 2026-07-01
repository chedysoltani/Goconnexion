import { Module } from '@nestjs/common';
import { BusinessCardsController } from './business-cards.controller';
import { BusinessCardsService } from './business-cards.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [BusinessCardsController],
  providers: [BusinessCardsService],
})
export class BusinessCardsModule {}
