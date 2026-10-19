import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsIn, IsOptional } from 'class-validator';
import { UserRole } from '@prisma/client';

export const SELF_SERVICE_ROLES = [UserRole.FREELANCER, UserRole.ENTREPRENEUR, UserRole.COLLABORATOR] as const;
export type SelfServiceRole = (typeof SELF_SERVICE_ROLES)[number];

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  // Liste fermée : ADMIN (et tout rôle interne) ne peut jamais être choisi à l'inscription
  @IsIn(SELF_SERVICE_ROLES)
  @IsOptional()
  role?: SelfServiceRole;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country!: string;

  // Attribution marketing (voir prisma/schema.prisma → User.signupUtm*). Valeurs issues de l'URL
  // côté client (lib/tracking/campaign.ts) : jamais sûres, donc bornées en longueur ici aussi.
  @IsString()
  @IsOptional()
  @MaxLength(100)
  signupUtmSource?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  signupUtmMedium?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  signupUtmCampaign?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  signupUtmContent?: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
