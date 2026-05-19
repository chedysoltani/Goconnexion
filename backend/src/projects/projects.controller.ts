import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ProjectStatus, ApplicationStatus } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.projectsService.findAll({ search, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Post()
  async create(
    @Request() req: any,
    @Body() body: { title: string; description: string; budget?: number; skills: string[] },
  ) {
    return this.projectsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { title?: string; description?: string; budget?: number; skills?: string[]; status?: ProjectStatus },
  ) {
    return this.projectsService.update(id, req.user.id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.delete(id, req.user.id);
  }

  // Applications
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FREELANCER)
  @Post(':id/apply')
  async apply(
    @Param('id') projectId: string,
    @Request() req: any,
    @Body('coverLetter') coverLetter?: string,
  ) {
    return this.projectsService.apply(projectId, req.user.id, coverLetter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Get(':id/applications')
  async getApplications(@Param('id') projectId: string, @Request() req: any) {
    return this.projectsService.getApplications(projectId, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ENTREPRENEUR)
  @Put('applications/:applicationId')
  async updateApplicationStatus(
    @Param('applicationId') applicationId: string,
    @Request() req: any,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.projectsService.updateApplicationStatus(applicationId, req.user.id, status);
  }
}
