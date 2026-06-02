import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum AdType {
  COMPANY = 'COMPANY',
  EVENT = 'EVENT',
  SERVICE = 'SERVICE',
}

export enum AdPlacement {
  FEED = 'FEED',
  SIDEBAR = 'SIDEBAR',
  TOP = 'TOP',
}

export class CreateAdvertisementDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsEnum(AdType)
  type: AdType;

  @IsEnum(AdPlacement)
  placement: AdPlacement;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateAdvertisementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
