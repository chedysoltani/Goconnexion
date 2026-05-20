import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ConnectionsService } from './connections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionsController {
  constructor(private readonly connectionsService: ConnectionsService) {}

  @Post('request')
  async sendRequest(
    @Req() req: any,
    @Body() body: { receiverId: string; message?: string; isCoffee?: boolean },
  ) {
    const senderId = req.user.id;
    return this.connectionsService.sendRequest(
      senderId,
      body.receiverId,
      body.message,
      body.isCoffee,
    );
  }

  @Post('accept/:id')
  async acceptRequest(@Req() req: any, @Param('id') id: string) {
    const receiverId = req.user.id;
    return this.connectionsService.acceptRequest(id, receiverId);
  }

  @Post('decline/:id')
  async declineRequest(@Req() req: any, @Param('id') id: string) {
    const receiverId = req.user.id;
    return this.connectionsService.declineRequest(id, receiverId);
  }

  @Get('pending')
  async getPendingRequests(@Req() req: any) {
    const userId = req.user.id;
    return this.connectionsService.getPendingRequests(userId);
  }

  @Get('sent')
  async getSentRequests(@Req() req: any) {
    const userId = req.user.id;
    return this.connectionsService.getSentRequests(userId);
  }

  @Get('friends')
  async getFriends(@Req() req: any) {
    const userId = req.user.id;
    return this.connectionsService.getFriends(userId);
  }

  @Delete(':friendId')
  async removeConnection(@Req() req: any, @Param('friendId') friendId: string) {
    const userId = req.user.id;
    return this.connectionsService.removeConnection(userId, friendId);
  }
}
