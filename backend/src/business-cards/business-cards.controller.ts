import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BusinessCardsService } from './business-cards.service';
import { CreateBusinessCardInvitationDto } from './dto/business-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('business-cards')
@UseGuards(JwtAuthGuard)
export class BusinessCardsController {
  constructor(private readonly businessCardsService: BusinessCardsService) {}

  @Post()
  create(@Request() req: any, @Body() dto: CreateBusinessCardInvitationDto) {
    return this.businessCardsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.businessCardsService.findAllBySender(req.user.id);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.businessCardsService.getStats(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.businessCardsService.remove(id, req.user.id);
  }
}
