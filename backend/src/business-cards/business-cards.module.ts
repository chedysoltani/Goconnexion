import { Module } from '@nestjs/common';
import { BusinessCardsController } from './business-cards.controller';
import { BusinessCardsService } from './business-cards.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessCardsController],
  providers: [BusinessCardsService],
})
export class BusinessCardsModule {}
