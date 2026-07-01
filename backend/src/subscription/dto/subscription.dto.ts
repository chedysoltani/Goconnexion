import { IsEnum, IsIn, IsOptional } from 'class-validator';

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

  @IsIn(['stripe', 'wise'])
  @IsOptional()
  provider?: 'stripe' | 'wise' = 'stripe';
}

export class CreateWisePaymentDto {
  @IsEnum(['PRO', 'BUSINESS', 'PREMIUM_ENTREPRENEUR', 'PREMIUM_FREELANCER', 'PREMIUM_INCUBATEUR'])
  plan: string;

  @IsIn(['monthly', 'yearly'])
  @IsOptional()
  interval?: 'monthly' | 'yearly' = 'monthly';
}
