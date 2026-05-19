import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectStatus, ApplicationStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: {
    title: string;
    description: string;
    budget?: number;
    skills: string[];
  }) {
    const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });

    if (!entrepreneur) {
      throw new NotFoundException('Entrepreneur profile not found');
    }

    return this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        budget: data.budget,
        skills: data.skills,
        ownerId: entrepreneur.id,
      },
    });
  }

  async findAll(filters: { search?: string; status?: ProjectStatus }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.project.findMany({
      where,
      include: {
        owner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        applications: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, userId: string, data: {
    title?: string;
    description?: string;
    budget?: number;
    skills?: string[];
    status?: ProjectStatus;
  }) {
    const project = await this.findOne(id);
    const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });

    if (!entrepreneur || project.ownerId !== entrepreneur.id) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const project = await this.findOne(id);
    const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });

    if (!entrepreneur || project.ownerId !== entrepreneur.id) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  // Application process
  async apply(projectId: string, userId: string, coverLetter?: string) {
    const freelancer = await this.prisma.freelancerProfile.findUnique({
      where: { userId },
    });

    if (!freelancer) {
      throw new NotFoundException('Freelancer profile not found');
    }

    // Check if already applied
    const existing = await this.prisma.projectApplication.findFirst({
      where: {
        projectId,
        freelancerId: freelancer.id,
      },
    });

    if (existing) {
      throw new ForbiddenException('You have already applied to this project');
    }

    return this.prisma.projectApplication.create({
      data: {
        projectId,
        freelancerId: freelancer.id,
        coverLetter,
      },
    });
  }

  async getApplications(projectId: string, userId: string) {
    const project = await this.findOne(projectId);
    const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });

    if (!entrepreneur || project.ownerId !== entrepreneur.id) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.projectApplication.findMany({
      where: { projectId },
      include: {
        // Find freelancer user data
        // For simplicity, we query freelancer profile and its user
      },
    });
  }

  async updateApplicationStatus(applicationId: string, userId: string, status: ApplicationStatus) {
    const application = await this.prisma.projectApplication.findUnique({
      where: { id: applicationId },
      include: { project: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const entrepreneur = await this.prisma.entrepreneurProfile.findUnique({
      where: { userId },
    });

    if (!entrepreneur || application.project.ownerId !== entrepreneur.id) {
      throw new ForbiddenException('You do not own this project');
    }

    return this.prisma.projectApplication.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
