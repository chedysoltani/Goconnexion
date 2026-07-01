import { Module } from '@nestjs/common';
import { IncubatorController } from './incubator.controller';
import { IncubatorService } from './incubator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IncubatorController],
  providers: [IncubatorService],
})
export class IncubatorModule {}
