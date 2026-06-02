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
exports.CreateBusinessCardInvitationDto = exports.InviteMethod = void 0;
const class_validator_1 = require("class-validator");
var InviteMethod;
(function (InviteMethod) {
    InviteMethod["EMAIL"] = "EMAIL";
    InviteMethod["SMS"] = "SMS";
})(InviteMethod || (exports.InviteMethod = InviteMethod = {}));
class CreateBusinessCardInvitationDto {
    name;
    email;
    phone;
    company;
    position;
    inviteMethod;
}
exports.CreateBusinessCardInvitationDto = CreateBusinessCardInvitationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(InviteMethod),
    __metadata("design:type", String)
], CreateBusinessCardInvitationDto.prototype, "inviteMethod", void 0);
//# sourceMappingURL=business-card.dto.js.map