import { Module } from '@nestjs/common';
import { IncubatorController } from './incubator.controller';
import { IncubatorService } from './incubator.service';

@Module({
  controllers: [IncubatorController],
  providers: [IncubatorService]
})
export class IncubatorModule {}
