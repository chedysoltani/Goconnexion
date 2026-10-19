import { Controller, Get, Delete, Put, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { SetEditorDto } from './dto/set-editor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PlanType } from '@prisma/client';

// Tout le contrôleur est réservé à ADMIN (EDITOR inclus → 403).
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Put('users/:id/plan')
  updateUserPlan(@Param('id') id: string, @Body('plan') plan: PlanType) {
    return this.adminService.updateUserPlan(id, plan);
  }

  @Get('ambassadors')
  getAmbassadors() {
    return this.adminService.getAmbassadors();
  }

  @Put('users/:id/ambassador')
  setAmbassador(@Param('id') id: string, @Body('isAmbassador') isAmbassador: boolean) {
    return this.adminService.setAmbassador(id, isAmbassador);
  }

  // Donne ou retire le rôle EDITOR. Seul ce rôle est géré ici (ADMIN : script cli/set-role).
  @Put('users/:id/role')
  setEditor(@Param('id') id: string, @Body() dto: SetEditorDto) {
    return this.adminService.setEditor(id, dto.editor);
  }
}
