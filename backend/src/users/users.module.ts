import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ReferralModule } from '../referral/referral.module';

@Module({
  imports: [PrismaModule, ReferralModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
