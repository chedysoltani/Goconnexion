import { Controller, Get, Body, Put, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('suggestions')
  async getSuggestions(@Request() req: any) {
    return this.usersService.getSuggestions(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('profile')
  async update(
    @Request() req: any,
    @Body() body: { firstName?: string; lastName?: string; avatarUrl?: string },
  ) {
    return this.usersService.update(req.user.id, body);
  }
}
