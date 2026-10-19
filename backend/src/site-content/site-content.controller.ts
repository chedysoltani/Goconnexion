import { Body, Controller, Get, Param, Put, Request, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SiteContentService } from './site-content.service';
import { UpdateSiteContentDto } from './dto/site-content.dto';

// Textes de présentation du site (page À propos, …).
// Lecture publique ; modification réservée à ADMIN et EDITOR (équipe marketing).
@Controller('site-content')
export class SiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.siteContentService.findOne(key);
  }

  @Get(':key/editor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  findOneForEditor(@Param('key') key: string) {
    return this.siteContentService.findOneForEditor(key);
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  update(@Param('key') key: string, @Body() dto: UpdateSiteContentDto, @Request() req: any) {
    return this.siteContentService.update(key, dto, req.user.id);
  }
}
