"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const messaging_service_1 = require("./messaging.service");
const common_1 = require("@nestjs/common");
let MessagingGateway = class MessagingGateway {
    jwtService;
    messagingService;
    server;
    constructor(jwtService, messagingService) {
        this.jwtService = jwtService;
        this.messagingService = messagingService;
    }
    async handleConnection(client) {
        try {
            const authHeader = client.handshake.auth?.token || client.handshake.query?.token;
            if (!authHeader) {
                throw new common_1.UnauthorizedException('No token provided');
            }
            const token = authHeader.replace('Bearer ', '');
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'goconnexions-super-secret-key-12345!',
            });
            client.data.user = payload;
            console.log(`Client connected: ${client.id} (User: ${payload.sub})`);
        }
        catch (err) {
            console.log(`Connection rejected for client ${client.id}:`, err instanceof Error ? err.message : err);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    handleJoinConversation(client, conversationId) {
        client.join(conversationId);
        console.log(`User ${client.data.user?.sub} joined conversation: ${conversationId}`);
        return { status: 'joined', conversationId };
    }
    handleLeaveConversation(client, conversationId) {
        client.leave(conversationId);
        console.log(`User ${client.data.user?.sub} left conversation: ${conversationId}`);
        return { status: 'left', conversationId };
    }
    async handleSendMessage(client, data) {
        const senderId = client.data.user.sub;
        const message = await this.messagingService.sendMessage(data.conversationId, senderId, data.content);
        this.server.to(data.conversationId).emit('newMessage', message);
        return message;
    }
};
exports.MessagingGateway = MessagingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MessagingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleJoinConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveConversation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MessagingGateway.prototype, "handleLeaveConversation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], MessagingGateway.prototype, "handleSendMessage", null);
exports.MessagingGateway = MessagingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        messaging_service_1.MessagingService])
], MessagingGateway);
//# sourceMappingURL=messaging.gateway.js.map