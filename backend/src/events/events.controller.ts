import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventsService.findAll({
      category,
      type,
      upcoming: upcoming === 'true',
    });
  }

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  getMyRegistrations(@Request() req: any) {
    return this.eventsService.getMyRegistrations(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Get(':id/participants')
  @UseGuards(JwtAuthGuard)
  getParticipants(@Param('id') id: string) {
    return this.eventsService.getEventParticipants(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.id, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Request() req: any, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.remove(id, req.user.id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.register(id, req.user.id);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  cancelRegistration(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.cancelRegistration(id, req.user.id);
  }
}
