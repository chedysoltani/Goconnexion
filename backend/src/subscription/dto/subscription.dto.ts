import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { PlanType } from '@prisma/client';

export class UpgradePlanDto {
  @IsEnum(['PRO', 'BUSINESS'])
  plan: 'PRO' | 'BUSINESS';
}

export class CreateCheckoutDto {
  @IsEnum(['PRO', 'BUSINESS'])
  plan: 'PRO' | 'BUSINESS';

  @IsIn(['monthly', 'yearly'])
  @IsOptional()
  interval?: 'monthly' | 'yearly' = 'monthly';
}
