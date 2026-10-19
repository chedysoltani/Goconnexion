import { Controller, Get, Body, Put, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ReferralService } from '../referral/referral.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AmbassadorGuard } from '../auth/guards/ambassador.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly referralService: ReferralService,
  ) {}

  @Get('suggestions')
  async getSuggestions(@Request() req: any) {
    return this.usersService.getSuggestions(req.user.id);
  }

  @Get('me/completion')
  async getCompletion(@Request() req: any) {
    return this.usersService.getCompletion(req.user.id);
  }

  @Get('me/ambassador-stats')
  @UseGuards(AmbassadorGuard)
  async getAmbassadorStats(@Request() req: any) {
    return this.referralService.getAmbassadorStats(req.user.id);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.usersService.findAllExceptSelf(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('profile')
  async update(
    @Request() req: any,
    @Body() body: UpdateProfileDto,
  ) {
    const { birthDate, ...rest } = body;
    const updateData: { firstName?: string; lastName?: string; avatarUrl?: string; birthDate?: Date | null; country?: string } = { ...rest };
    if (birthDate) {
      updateData.birthDate = new Date(birthDate);
    } else if (birthDate !== undefined) {
      updateData.birthDate = null;
    }
    return this.usersService.update(req.user.id, updateData);
  }
}
