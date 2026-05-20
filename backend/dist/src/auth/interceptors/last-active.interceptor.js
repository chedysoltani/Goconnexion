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
exports.LastActiveInterceptor = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LastActiveInterceptor = class LastActiveInterceptor {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (request && request.user && request.user.id) {
            this.prisma.user
                .update({
                where: { id: request.user.id },
                data: { lastActiveAt: new Date() },
            })
                .catch((err) => {
                console.error('Failed to update lastActiveAt for user:', request.user.id, err);
            });
        }
        return next.handle();
    }
};
exports.LastActiveInterceptor = LastActiveInterceptor;
exports.LastActiveInterceptor = LastActiveInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LastActiveInterceptor);
//# sourceMappingURL=last-active.interceptor.js.map