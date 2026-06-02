import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum EventCategory {
  NETWORKING = 'NETWORKING',
  STARTUP = 'STARTUP',
  INVESTISSEMENT = 'INVESTISSEMENT',
  FORMATION = 'FORMATION',
  INCUBATEUR = 'INCUBATEUR',
}

export enum EventType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL = 'VIRTUAL',
}

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(EventCategory)
  category: EventCategory;

  @IsEnum(EventType)
  type: EventType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  virtualLink?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional()
  @IsEnum(EventType)
  type?: EventType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  virtualLink?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
