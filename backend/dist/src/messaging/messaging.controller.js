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
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const messaging_service_1 = require("./messaging.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let MessagingController = class MessagingController {
    messagingService;
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async startConversation(req, targetUserId) {
        return this.messagingService.startConversation(req.user.id, targetUserId);
    }
    async getConversations(req) {
        return this.messagingService.getConversations(req.user.id);
    }
    async getMessages(conversationId, req) {
        return this.messagingService.getMessages(conversationId, req.user.id);
    }
    async sendMessage(conversationId, req, content) {
        return this.messagingService.sendMessage(conversationId, req.user.id, content);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('targetUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "startConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('content')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendMessage", null);
exports.MessagingController = MessagingController = __decorate([
    (0, common_1.Controller)('messaging'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map