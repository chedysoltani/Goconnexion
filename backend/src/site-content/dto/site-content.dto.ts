import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpdateSiteContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  // Validé selon la clé dans SiteContentService (voir SITE_CONTENT_SCHEMAS)
  @IsObject()
  content!: Record<string, unknown>;
}

// ── Clé "about" : page /a-propos ─────────────────────────────────────────────
// Les paragraphes sont séparés par une ligne vide ; pas de HTML (rendu en texte brut).

export class AboutOfferItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(300)
  text!: string;
}

export class AboutTeamMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(100)
  role!: string;

  @IsString()
  @MaxLength(4)
  initials!: string;
}

export class AboutContentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  intro!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  mission!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  history!: string;

  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => AboutOfferItemDto)
  offer!: AboutOfferItemDto[];

  @IsArray()
  @ArrayMaxSize(12)
  @ValidateNested({ each: true })
  @Type(() => AboutTeamMemberDto)
  team!: AboutTeamMemberDto[];
}
