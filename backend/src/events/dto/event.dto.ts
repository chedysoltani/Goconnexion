import {
  IsString, IsEnum, IsBoolean, IsOptional, IsNumber,
  IsDateString, Min, IsHexColor,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum EventCategory {
  NETWORKING    = 'NETWORKING',
  STARTUP       = 'STARTUP',
  INVESTISSEMENT= 'INVESTISSEMENT',
  FORMATION     = 'FORMATION',
  INCUBATEUR    = 'INCUBATEUR',
  SALON         = 'SALON',
  CONFERENCE    = 'CONFERENCE',
  HACKATHON     = 'HACKATHON',
}

export enum EventType {
  PHYSICAL = 'PHYSICAL',
  VIRTUAL  = 'VIRTUAL',
}

export enum BoothType {
  SMALL  = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE  = 'LARGE',
  CORNER = 'CORNER',
  VIP    = 'VIP',
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

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  latitude?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  longitude?: number;

  @IsOptional() @IsString()
  virtualLink?: string;

  @IsOptional() @IsNumber() @Min(1) @Type(() => Number)
  capacity?: number;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  price?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsBoolean()
  isFree?: boolean;

  @IsOptional() @IsString()
  imageUrl?: string;
}

export class UpdateEventDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsEnum(EventCategory)
  category?: EventCategory;

  @IsOptional() @IsEnum(EventType)
  type?: EventType;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsNumber() @Type(() => Number)
  latitude?: number;

  @IsOptional() @IsNumber() @Type(() => Number)
  longitude?: number;

  @IsOptional() @IsString()
  virtualLink?: string;

  @IsOptional() @IsNumber() @Min(1) @Type(() => Number)
  capacity?: number;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  price?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsBoolean()
  isFree?: boolean;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

// ── Ticket Types ──────────────────────────────────────────────────────────

export class CreateTicketTypeDto {
  @IsString()
  name: string;

  @IsNumber() @Min(0) @Type(() => Number)
  price: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsNumber() @Min(1) @Type(() => Number)
  capacity?: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  color?: string;
}

export class UpdateTicketTypeDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  price?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsNumber() @Min(1) @Type(() => Number)
  capacity?: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  color?: string;
}

// ── Booths ────────────────────────────────────────────────────────────────

export class CreateBoothDto {
  @IsString()
  number: string;

  @IsEnum(BoothType)
  type: BoothType;

  @IsNumber() @Min(0) @Type(() => Number)
  price: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  surface?: number;

  @IsOptional() @IsString()
  description?: string;
}

export class UpdateBoothDto {
  @IsOptional() @IsString()
  number?: string;

  @IsOptional() @IsEnum(BoothType)
  type?: BoothType;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  price?: number;

  @IsOptional() @IsString()
  currency?: string;

  @IsOptional() @IsNumber() @Min(0) @Type(() => Number)
  surface?: number;

  @IsOptional() @IsString()
  description?: string;
}

// ── Registration with payment ─────────────────────────────────────────────

export class RegisterCheckoutDto {
  @IsOptional() @IsString()
  ticketTypeId?: string;

  @IsOptional() @IsString()
  boothId?: string;

  @IsOptional() @IsString()
  provider?: 'stripe' | 'wise';
}
