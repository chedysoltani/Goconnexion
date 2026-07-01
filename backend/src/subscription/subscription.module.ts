import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { StripeService } from './stripe.service';
import { WiseService } from './wise.service';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, StripeService, WiseService],
  exports: [SubscriptionService, StripeService, WiseService],
})
export class SubscriptionModule {}
