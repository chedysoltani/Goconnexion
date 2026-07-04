import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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

  @Get('received')
  findReceived(@Request() req: any) {
    return this.businessCardsService.findAllReceived(req.user.email);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.businessCardsService.getStats(req.user.id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req: any) {
    return this.businessCardsService.accept(id, req.user.id, req.user.email);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.businessCardsService.remove(id, req.user.id);
  }
}
