import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed() {
    return this.feedService.findAll();
  }

  @Get('trending')
  async getTrending() {
    return this.feedService.getTrending();
  }

  @Get('saved')
  async getSaved(@Req() req: any) {
    return this.feedService.getSavedPosts(req.user.id ?? req.user.sub);
  }

  @Post()
  async createPost(
    @Req() req: any,
    @Body() body: { content: string; imageUrl?: string },
  ) {
    const userId = req.user.id ?? req.user.sub;
    return this.feedService.create(userId, body);
  }

  @Post(':id/like')
  async toggleLike(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.feedService.toggleLike(id, userId);
  }

  @Post(':id/save')
  async toggleSave(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id ?? req.user.sub;
    return this.feedService.toggleSave(id, userId);
  }

  @Post(':id/comment')
  async addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    const userId = req.user.id ?? req.user.sub;
    return this.feedService.addComment(id, userId, body.content);
  }
}
