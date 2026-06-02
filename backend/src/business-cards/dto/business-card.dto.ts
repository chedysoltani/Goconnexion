import { IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';

export enum InviteMethod {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export class CreateBusinessCardInvitationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsEnum(InviteMethod)
  inviteMethod: InviteMethod;
}
