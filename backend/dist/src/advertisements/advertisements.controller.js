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
exports.AdvertisementsController = void 0;
const common_1 = require("@nestjs/common");
const advertisements_service_1 = require("./advertisements.service");
const advertisement_dto_1 = require("./dto/advertisement.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let AdvertisementsController = class AdvertisementsController {
    adsService;
    constructor(adsService) {
        this.adsService = adsService;
    }
    findActive(placement) {
        return this.adsService.findActive(placement);
    }
    findMyAds(req) {
        return this.adsService.findMyAds(req.user.id);
    }
    getStats(id, req) {
        return this.adsService.getStats(id, req.user.id);
    }
    create(req, dto) {
        return this.adsService.create(req.user.id, dto);
    }
    update(id, req, dto) {
        return this.adsService.update(id, req.user.id, dto);
    }
    trackImpression(id) {
        return this.adsService.trackImpression(id);
    }
    trackClick(id) {
        return this.adsService.trackClick(id);
    }
};
exports.AdvertisementsController = AdvertisementsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('placement')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('mine'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "findMyAds", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "getStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, advertisement_dto_1.CreateAdvertisementDto]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, advertisement_dto_1.UpdateAdvertisementDto]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/impression'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "trackImpression", null);
__decorate([
    (0, common_1.Post)(':id/click'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdvertisementsController.prototype, "trackClick", null);
exports.AdvertisementsController = AdvertisementsController = __decorate([
    (0, common_1.Controller)('advertisements'),
    __metadata("design:paramtypes", [advertisements_service_1.AdvertisementsService])
], AdvertisementsController);
//# sourceMappingURL=advertisements.controller.js.map