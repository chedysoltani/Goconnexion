import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlanFeatureGuard, RequiresFeature } from '../subscription/plan-feature.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, PlanFeatureGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @RequiresFeature('canAccessAnalytics')
  @Get('dashboard')
  async getDashboardStats(@Request() req: any) {
    return this.analyticsService.getUserDashboardStats(req.user.id);
  }

  @Get('earnings')
  async getEarnings(@Request() req: any) {
    return this.analyticsService.getEarnings(req.user.id);
  }
}
