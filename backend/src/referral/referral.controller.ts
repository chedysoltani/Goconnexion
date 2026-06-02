import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard(@Request() req: any) {
    return this.referralService.getDashboard(req.user.id);
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.referralService.getLeaderboard();
  }

  @Post('register/:code')
  @UseGuards(JwtAuthGuard)
  registerReferral(@Param('code') code: string, @Request() req: any) {
    return this.referralService.registerReferral(code, req.user.id);
  }
}
