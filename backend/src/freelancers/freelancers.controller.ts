import { Controller, Get, Body, Put, UseGuards, Request, Query } from '@nestjs/common';
import { FreelancersService } from './freelancers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('freelancers')
export class FreelancersController {
  constructor(private readonly freelancersService: FreelancersService) {}

  @Get()
  async findAll(
    @Query('skills') skills?: string,
    @Query('industry') industry?: string,
    @Query('minRate') minRate?: number,
    @Query('maxRate') maxRate?: number,
    @Query('availableOnly') availableOnly?: string,
    @Query('search') search?: string,
  ) {
    return this.freelancersService.findAll({
      skills,
      industry,
      minRate,
      maxRate,
      availableOnly: availableOnly === 'true',
      search,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.freelancersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() body: {
      title?: string;
      bio?: string;
      industry?: string;
      skills?: string[];
      portfolioUrl?: string;
      cvUrl?: string;
      isAvailable?: boolean;
      hourlyRate?: number;
    },
  ) {
    return this.freelancersService.updateProfile(req.user.id, body);
  }
}
