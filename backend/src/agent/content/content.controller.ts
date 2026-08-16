import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AgentContentStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ContentService } from './content.service';
import { GenerateContentDto, UpdateContentDto } from './dto/content.dto';

// Réservé à l'admin — génération et validation du contenu marketing avant
// publication manuelle sur LinkedIn/Facebook (pas de publication automatique).
@Controller('agent/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post('generate')
  generate(@Body() dto: GenerateContentDto) {
    return this.contentService.generate(dto);
  }

  @Get()
  findAll(@Query('status') status?: AgentContentStatus) {
    return this.contentService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @Request() req: any,
  ) {
    return this.contentService.update(id, dto, req.user.id);
  }
}
