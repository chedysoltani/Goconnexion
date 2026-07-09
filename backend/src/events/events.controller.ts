import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import {
  CreateEventDto, UpdateEventDto,
  CreateTicketTypeDto, UpdateTicketTypeDto,
  CreateBoothDto, UpdateBoothDto,
  RegisterCheckoutDto,
} from './dto/event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventsService.findAll({ category, type, upcoming: upcoming === 'true' });
  }

  @Get('ticket/:ticketCode')
  getTicket(@Param('ticketCode') ticketCode: string) {
    return this.eventsService.getRegistrationByTicketCode(ticketCode);
  }

  // ── Authenticated — user ──────────────────────────────────────────────────

  @Get('my-registrations')
  @UseGuards(JwtAuthGuard)
  getMyRegistrations(@Request() req: any) {
    return this.eventsService.getMyRegistrations(req.user.id);
  }

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.register(id, req.user.id);
  }

  @Post(':id/register/checkout')
  @UseGuards(JwtAuthGuard)
  registerCheckout(@Param('id') id: string, @Request() req: any, @Body() dto: RegisterCheckoutDto) {
    return this.eventsService.registerWithPayment(id, req.user.id, dto);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  cancelRegistration(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.cancelRegistration(id, req.user.id);
  }

  @Patch('registrations/:ticketCode/checkin')
  @UseGuards(JwtAuthGuard)
  checkIn(@Param('ticketCode') ticketCode: string, @Request() req: any) {
    return this.eventsService.checkIn(ticketCode, req.user.id);
  }

  // ── Ticket Types ──────────────────────────────────────────────────────────

  @Get(':id/ticket-types')
  getTicketTypes(@Param('id') id: string) {
    return this.eventsService.getTicketTypes(id);
  }

  @Post(':id/ticket-types')
  @UseGuards(JwtAuthGuard)
  createTicketType(@Param('id') id: string, @Request() req: any, @Body() dto: CreateTicketTypeDto) {
    return this.eventsService.createTicketType(id, req.user.id, dto);
  }

  @Put(':id/ticket-types/:ttId')
  @UseGuards(JwtAuthGuard)
  updateTicketType(@Param('ttId') ttId: string, @Request() req: any, @Body() dto: UpdateTicketTypeDto) {
    return this.eventsService.updateTicketType(ttId, req.user.id, dto);
  }

  @Delete(':id/ticket-types/:ttId')
  @UseGuards(JwtAuthGuard)
  deleteTicketType(@Param('ttId') ttId: string, @Request() req: any) {
    return this.eventsService.deleteTicketType(ttId, req.user.id);
  }

  // ── Booths ────────────────────────────────────────────────────────────────

  @Get(':id/booths')
  getBooths(@Param('id') id: string) {
    return this.eventsService.getBooths(id);
  }

  @Post(':id/booths')
  @UseGuards(JwtAuthGuard)
  createBooth(@Param('id') id: string, @Request() req: any, @Body() dto: CreateBoothDto) {
    return this.eventsService.createBooth(id, req.user.id, dto);
  }

  @Put(':id/booths/:boothId')
  @UseGuards(JwtAuthGuard)
  updateBooth(@Param('boothId') boothId: string, @Request() req: any, @Body() dto: UpdateBoothDto) {
    return this.eventsService.updateBooth(boothId, req.user.id, dto);
  }

  @Delete(':id/booths/:boothId')
  @UseGuards(JwtAuthGuard)
  deleteBooth(@Param('boothId') boothId: string, @Request() req: any) {
    return this.eventsService.deleteBooth(boothId, req.user.id);
  }

  // ── Organizer ─────────────────────────────────────────────────────────────

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
}
