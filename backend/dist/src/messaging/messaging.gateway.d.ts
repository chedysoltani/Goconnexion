import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
export declare class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private messagingService;
    server: Server;
    static instance: MessagingGateway | null;
    constructor(jwtService: JwtService, messagingService: MessagingService);
    static emitToUser(userId: string, event: string, data: any): void;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, conversationId: string): {
        status: string;
        conversationId: string;
    };
    handleLeaveConversation(client: Socket, conversationId: string): {
        status: string;
        conversationId: string;
    };
    handleSendMessage(client: Socket, data: {
        conversationId: string;
        content: string;
    }): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
    }>;
}
