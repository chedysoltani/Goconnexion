import { Module } from '@nestjs/common';
import { EntrepreneursController } from './entrepreneurs.controller';
import { EntrepreneursService } from './entrepreneurs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EntrepreneursController],
  providers: [EntrepreneursService],
})
export class EntrepreneursModule {}
