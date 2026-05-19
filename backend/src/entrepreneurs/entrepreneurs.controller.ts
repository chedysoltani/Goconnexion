import { Controller, Get, Body, Put, UseGuards, Request } from '@nestjs/common';
import { EntrepreneursService } from './entrepreneurs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('entrepreneurs')
export class EntrepreneursController {
  constructor(private readonly entrepreneursService: EntrepreneursService) {}

  @Get()
  async findAll() {
    return this.entrepreneursService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.entrepreneursService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() body: {
      companyName?: string;
      website?: string;
      bio?: string;
    },
  ) {
    return this.entrepreneursService.updateProfile(req.user.id, body);
  }
}
