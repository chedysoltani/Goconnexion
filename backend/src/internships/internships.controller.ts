import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { InternshipsService, AuthUser } from './internships.service';

type AuthRequest = { user: AuthUser };
import {
  CreateInternshipDto,
  UpdateInternshipDto,
  ListInternshipsQueryDto,
  ApplyInternshipDto,
  UpdateApplicationStatusDto,
} from './dto/internship.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  // ── Public ────────────────────────────────────────────────────────────────

  @Get()
  findAll(@Query() query: ListInternshipsQueryDto) {
    return this.internshipsService.findAll(query);
  }

  // ── Routes fixes (avant :id) ──────────────────────────────────────────────

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req: AuthRequest) {
    return this.internshipsService.findMine(req.user.id);
  }

  @Get('applications/mine')
  @UseGuards(JwtAuthGuard)
  findMyApplications(@Request() req: AuthRequest) {
    return this.internshipsService.findMyApplications(req.user.id);
  }

  @Get('applications/:id/cv')
  @UseGuards(JwtAuthGuard)
  async getCv(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename } = await this.internshipsService.getCv(
      id,
      req.user,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    });
    return new StreamableFile(stream);
  }

  @Patch('applications/:id/status')
  @UseGuards(JwtAuthGuard)
  updateApplicationStatus(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.internshipsService.updateApplicationStatus(id, req.user, dto);
  }

  @Delete('applications/:id')
  @UseGuards(JwtAuthGuard)
  withdraw(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.internshipsService.withdraw(id, req.user.id);
  }

  // ── Par offre ─────────────────────────────────────────────────────────────

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(id);
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  findOfferApplications(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.internshipsService.findOfferApplications(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: AuthRequest, @Body() dto: CreateInternshipDto) {
    return this.internshipsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: UpdateInternshipDto,
  ) {
    return this.internshipsService.update(id, req.user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.internshipsService.remove(id, req.user);
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  apply(
    @Param('id') id: string,
    @Request() req: AuthRequest,
    @Body() dto: ApplyInternshipDto,
  ) {
    return this.internshipsService.apply(id, req.user.id, dto);
  }
}
