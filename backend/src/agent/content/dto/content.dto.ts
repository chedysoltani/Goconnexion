import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { AgentContentType, AgentContentStatus } from '@prisma/client';

export class GenerateContentDto {
  @IsEnum(AgentContentType)
  type!: AgentContentType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  topic!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  targetAudience?: string;
}

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsEnum(AgentContentStatus)
  @IsOptional()
  status?: AgentContentStatus;
}
