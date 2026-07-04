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

// Extrait gc_access depuis le header Cookie de la connexion WebSocket
function extractCookieToken(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === 'gc_access') return rest.join('=');
  }
  return null;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  static instance: MessagingGateway | null = null;

  constructor(
    private jwtService: JwtService,
    private messagingService: MessagingService,
  ) {
    MessagingGateway.instance = this;
  }

  static emitToUser(userId: string, event: string, data: any) {
    if (MessagingGateway.instance && MessagingGateway.instance.server) {
      MessagingGateway.instance.server.to(userId).emit(event, data);
    }
  }

  static emitToAll(event: string, data: any) {
    if (MessagingGateway.instance && MessagingGateway.instance.server) {
      MessagingGateway.instance.server.emit(event, data);
    }
  }

  async handleConnection(client: Socket) {
    try {
      // Priorité : cookie httpOnly gc_access → auth.token (legacy) → query.token
      const cookieHeader = client.handshake.headers.cookie ?? '';
      const rawToken =
        extractCookieToken(cookieHeader) ||
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!rawToken) {
        throw new UnauthorizedException('No token provided');
      }

      const token = String(rawToken).replace('Bearer ', '');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'goconnexions-super-secret-key-12345!',
      });

      client.data.user = payload;
      await client.join(payload.sub);
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err) {
      console.log(`Connection rejected for client ${client.id}:`, err instanceof Error ? err.message : err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string },
  ) {
    const senderId = client.data.user.sub;
    // messagingService.sendMessage diffuse déjà le 'newMessage' à chaque participant via MessagingGateway.emitToUser
    return this.messagingService.sendMessage(
      data.conversationId,
      senderId,
      data.content,
    );
  }
}
