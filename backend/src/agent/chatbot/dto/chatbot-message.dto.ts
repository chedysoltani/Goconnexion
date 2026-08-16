import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class StartChatSessionDto {
  @IsString()
  @IsOptional()
  visitorId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  utmSource?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  utmCampaign?: string;
}

export class SendChatMessageDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}

export class ConvertChatSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;
}
