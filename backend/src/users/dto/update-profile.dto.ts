import { IsOptional, IsString, MaxLength, ValidateIf, IsDateString } from 'class-validator';

// Seuls ces champs sont modifiables par l'utilisateur lui-même.
// Le ValidationPipe global (whitelist) retire tout le reste (role, plan, isAmbassador…).
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;

  // Chaîne vide = effacer la date de naissance
  @IsOptional()
  @ValidateIf((o) => o.birthDate !== '')
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;
}
