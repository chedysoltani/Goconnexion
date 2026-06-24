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
exports.BusinessCardsController = void 0;
const common_1 = require("@nestjs/common");
const business_cards_service_1 = require("./business-cards.service");
const business_card_dto_1 = require("./dto/business-card.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let BusinessCardsController = class BusinessCardsController {
    businessCardsService;
    constructor(businessCardsService) {
        this.businessCardsService = businessCardsService;
    }
    create(req, dto) {
        return this.businessCardsService.create(req.user.id, dto);
    }
    findAll(req) {
        return this.businessCardsService.findAllBySender(req.user.id);
    }
    findReceived(req) {
        return this.businessCardsService.findAllReceived(req.user.email);
    }
    getStats(req) {
        return this.businessCardsService.getStats(req.user.id);
    }
    accept(id, req) {
        return this.businessCardsService.updateStatus(id, req.user.id, 'ACCEPTED');
    }
    remove(id, req) {
        return this.businessCardsService.remove(id, req.user.id);
    }
};
exports.BusinessCardsController = BusinessCardsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, business_card_dto_1.CreateBusinessCardInvitationDto]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('received'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "findReceived", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "accept", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], BusinessCardsController.prototype, "remove", null);
exports.BusinessCardsController = BusinessCardsController = __decorate([
    (0, common_1.Controller)('business-cards'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [business_cards_service_1.BusinessCardsService])
], BusinessCardsController);
//# sourceMappingURL=business-cards.controller.js.map