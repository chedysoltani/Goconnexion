import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { IncubatorService } from './incubator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('incubator')
export class IncubatorController {
  constructor(private readonly incubatorService: IncubatorService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.incubatorService.findAll(category);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.incubatorService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Request() req: any,
    @Body() body: { title: string; content: string; category: string },
  ) {
    return this.incubatorService.createPost(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req: any) {
    return this.incubatorService.deletePost(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Param('id') postId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.incubatorService.addComment(req.user.id, postId, content);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id') postId: string, @Request() req: any) {
    return this.incubatorService.toggleLike(req.user.id, postId);
  }
}
