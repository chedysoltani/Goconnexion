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

// FRONTEND_URL peut contenir plusieurs origines séparées par des virgules
// (ex: "https://goconnexion.vercel.app,https://goconnexions.com")
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  static instance: MessagingGateway | null = null;

  private onlineUsers = new Set<string>();

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

  static getOnlineUsers(): string[] {
    return MessagingGateway.instance ? Array.from(MessagingGateway.instance.onlineUsers) : [];
  }

  async handleConnection(client: Socket) {
    try {
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
      this.onlineUsers.add(payload.sub);
      this.server.emit('user-online', { userId: payload.sub });
      console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (err) {
      console.log(`Connection rejected for client ${client.id}:`, err instanceof Error ? err.message : err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.sub;
    if (userId) {
      this.onlineUsers.delete(userId);
      this.server.emit('user-offline', { userId });
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  // ── WebRTC Signaling ────────────────────────────────────────────
  @SubscribeMessage('video-call-request')
  handleVideoCallRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; callType: 'video' | 'audio'; offer: any },
  ) {
    const caller = client.data.user;
    this.server.to(data.targetUserId).emit('incoming-call', {
      callerId: caller.sub,
      callerFirstName: caller.firstName ?? '',
      callerLastName: caller.lastName ?? '',
      callerRole: caller.role ?? 'FREELANCER',
      callType: data.callType,
      offer: data.offer,
    });
  }

  @SubscribeMessage('video-call-answer')
  handleVideoCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: string; answer: any },
  ) {
    this.server.to(data.callerId).emit('call-answered', { answer: data.answer });
  }

  @SubscribeMessage('video-call-reject')
  handleVideoCallReject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callerId: string },
  ) {
    this.server.to(data.callerId).emit('call-rejected', {});
  }

  @SubscribeMessage('video-call-end')
  handleVideoCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string },
  ) {
    this.server.to(data.targetUserId).emit('call-ended', {});
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; candidate: any },
  ) {
    this.server.to(data.targetUserId).emit('ice-candidate', { candidate: data.candidate });
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
