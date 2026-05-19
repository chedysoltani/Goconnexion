import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(
    private jwtService: JwtService,
    private messagingService: MessagingService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.auth?.token || client.handshake.query?.token;
      if (!authHeader) {
        throw new UnauthorizedException('No token provided');
      }

      const token = authHeader.replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'goconnexions-super-secret-key-12345!',
      });

      client.data.user = payload;
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err) {
      console.log(`Connection rejected for client ${client.id}:`, err instanceof Error ? err.message : err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinConversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    client.join(conversationId);
    console.log(`User ${client.data.user?.sub} joined conversation: ${conversationId}`);
    return { status: 'joined', conversationId };
  }

  @SubscribeMessage('leaveConversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody('conversationId') conversationId: string,
  ) {
    client.leave(conversationId);
    console.log(`User ${client.data.user?.sub} left conversation: ${conversationId}`);
    return { status: 'left', conversationId };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const senderId = client.data.user.sub;
    const message = await this.messagingService.sendMessage(
      data.conversationId,
      senderId,
      data.content,
    );

    // Broadcast the message to everyone in the room (including sender)
    this.server.to(data.conversationId).emit('newMessage', message);
    return message;
  }
}
