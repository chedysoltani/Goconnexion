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
exports.FreelancersController = void 0;
const common_1 = require("@nestjs/common");
const freelancers_service_1 = require("./freelancers.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let FreelancersController = class FreelancersController {
    freelancersService;
    constructor(freelancersService) {
        this.freelancersService = freelancersService;
    }
    async findAll(skills, minRate, maxRate, availableOnly, search) {
        return this.freelancersService.findAll({
            skills,
            minRate,
            maxRate,
            availableOnly: availableOnly === 'true',
            search,
        });
    }
    async getProfile(req) {
        return this.freelancersService.getProfile(req.user.id);
    }
    async updateProfile(req, body) {
        return this.freelancersService.updateProfile(req.user.id, body);
    }
};
exports.FreelancersController = FreelancersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('skills')),
    __param(1, (0, common_1.Query)('minRate')),
    __param(2, (0, common_1.Query)('maxRate')),
    __param(3, (0, common_1.Query)('availableOnly')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], FreelancersController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FreelancersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.UserRole.FREELANCER),
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FreelancersController.prototype, "updateProfile", null);
exports.FreelancersController = FreelancersController = __decorate([
    (0, common_1.Controller)('freelancers'),
    __metadata("design:paramtypes", [freelancers_service_1.FreelancersService])
], FreelancersController);
//# sourceMappingURL=freelancers.controller.js.map