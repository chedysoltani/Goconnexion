import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto, UpdateAdvertisementDto } from './dto/advertisement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(private readonly adsService: AdvertisementsService) {}

  @Get()
  findActive(@Query('placement') placement?: string) {
    return this.adsService.findActive(placement);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMyAds(@Request() req: any) {
    return this.adsService.findMyAds(req.user.id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Param('id') id: string, @Request() req: any) {
    return this.adsService.getStats(id, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateAdvertisementDto) {
    return this.adsService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateAdvertisementDto) {
    return this.adsService.update(id, req.user.id, dto);
  }

  @Post(':id/impression')
  trackImpression(@Param('id') id: string) {
    return this.adsService.trackImpression(id);
  }

  @Post(':id/click')
  trackClick(@Param('id') id: string) {
    return this.adsService.trackClick(id);
  }
}
