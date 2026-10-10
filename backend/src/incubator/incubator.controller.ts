import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { IncubatorService } from './incubator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlanFeatureGuard, RequiresFeature } from '../subscription/plan-feature.guard';

@Controller('incubator')
@UseGuards(JwtAuthGuard, PlanFeatureGuard)
export class IncubatorController {
  constructor(private readonly incubatorService: IncubatorService) {}

  @RequiresFeature('canReadIncubator')
  @Get()
  async findAll(@Query('category') category?: string) {
    return this.incubatorService.findAll(category);
  }

  @RequiresFeature('canReadIncubator')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.incubatorService.findOne(id);
  }

  @RequiresFeature('canWriteIncubator')
  @Post()
  async createPost(
    @Request() req: any,
    @Body() body: { title: string; content: string; category: string },
  ) {
    return this.incubatorService.createPost(req.user.id, body);
  }

  // Pas de contrôle de plan : un ancien membre doit pouvoir supprimer ses posts.
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req: any) {
    return this.incubatorService.deletePost(id, req.user.id);
  }

  @RequiresFeature('canWriteIncubator')
  @Post(':id/comments')
  async addComment(
    @Param('id') postId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.incubatorService.addComment(req.user.id, postId, content);
  }

  @RequiresFeature('canWriteIncubator')
  @Post(':id/like')
  async toggleLike(@Param('id') postId: string, @Request() req: any) {
    return this.incubatorService.toggleLike(req.user.id, postId);
  }
}
