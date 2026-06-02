import {
  Controller, Get, Post, Delete,
  Body, UseGuards, Request,
  Req, Headers, HttpCode, HttpStatus,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';
import { CreateCheckoutDto, UpgradePlanDto } from './dto/subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ── Public ──────────────────────────────────────────────────
  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlansInfo();
  }

  // ── Stripe webhook (raw body, no auth) ───────────────────────
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const raw = (req as any).rawBody as Buffer;
    return this.subscriptionService.handleWebhook(raw, signature);
  }

  // ── Authenticated ────────────────────────────────────────────
  @UseGuards(JwtAuthGuard)
  @Get()
  getSubscription(@Request() req: any) {
    return this.subscriptionService.getSubscription(req.user.sub ?? req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  createCheckout(@Request() req: any, @Body() dto: CreateCheckoutDto) {
    const userId = req.user.sub ?? req.user.id;
    return this.subscriptionService.createCheckoutSession(userId, dto.plan, dto.interval ?? 'monthly');
  }

  @UseGuards(JwtAuthGuard)
  @Post('portal')
  createPortal(@Request() req: any) {
    return this.subscriptionService.createPortalSession(req.user.sub ?? req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  upgradeDirect(@Request() req: any, @Body() dto: UpgradePlanDto) {
    // Utilisé quand Stripe n'est pas configuré (dev/sandbox)
    const userId = req.user.sub ?? req.user.id;
    return this.subscriptionService.createCheckoutSession(userId, dto.plan, 'monthly');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cancel')
  cancelSubscription(@Request() req: any) {
    return this.subscriptionService.cancelSubscription(req.user.sub ?? req.user.id);
  }
}
