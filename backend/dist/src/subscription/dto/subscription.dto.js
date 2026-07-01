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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWisePaymentDto = exports.CreateCheckoutDto = exports.UpgradePlanDto = void 0;
const class_validator_1 = require("class-validator");
class UpgradePlanDto {
    plan;
}
exports.UpgradePlanDto = UpgradePlanDto;
__decorate([
    (0, class_validator_1.IsEnum)(['PRO', 'BUSINESS']),
    __metadata("design:type", String)
], UpgradePlanDto.prototype, "plan", void 0);
class CreateCheckoutDto {
    plan;
    interval = 'monthly';
    provider = 'stripe';
}
exports.CreateCheckoutDto = CreateCheckoutDto;
__decorate([
    (0, class_validator_1.IsEnum)(['PRO', 'BUSINESS']),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['monthly', 'yearly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "interval", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['stripe', 'wise']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "provider", void 0);
class CreateWisePaymentDto {
    plan;
    interval = 'monthly';
}
exports.CreateWisePaymentDto = CreateWisePaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(['PRO', 'BUSINESS', 'PREMIUM_ENTREPRENEUR', 'PREMIUM_FREELANCER', 'PREMIUM_INCUBATEUR']),
    __metadata("design:type", String)
], CreateWisePaymentDto.prototype, "plan", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['monthly', 'yearly']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateWisePaymentDto.prototype, "interval", void 0);
//# sourceMappingURL=subscription.dto.js.map