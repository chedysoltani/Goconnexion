import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  IsArray,
  IsNotEmpty,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
  Matches,
  Equals,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  InternshipMode,
  InternshipOfferStatus,
  InternshipApplicationStatus,
} from '@prisma/client';

export class CreateInternshipDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  description: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  domain: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsOptional()
  @IsEnum(InternshipMode)
  mode?: InternshipMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  durationMonths?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  skills?: string[];
}

export class UpdateInternshipDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  description?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  companyName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  location?: string;

  @IsOptional()
  @IsEnum(InternshipMode)
  mode?: InternshipMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  @Type(() => Number)
  durationMonths?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  skills?: string[];

  @IsOptional()
  @IsEnum(InternshipOfferStatus)
  status?: InternshipOfferStatus;
}

export class ListInternshipsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  domain?: string;

  @IsOptional()
  @IsEnum(InternshipMode)
  mode?: InternshipMode;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class ApplyInternshipDto {
  // Chemin renvoyé par POST /uploads (ex. /uploads/file-123-456.pdf)
  @IsString()
  @Matches(/^\/uploads\/[A-Za-z0-9._-]+\.pdf$/i, {
    message: 'cvUrl doit être un fichier PDF téléversé',
  })
  cvUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  message?: string;

  // Consentement explicite au partage du CV avec l'auteur de l'offre
  @Equals(true, { message: 'Le consentement au partage du CV est obligatoire' })
  consent: boolean;
}

export class UpdateApplicationStatusDto {
  @IsEnum(InternshipApplicationStatus)
  status: InternshipApplicationStatus;
}
