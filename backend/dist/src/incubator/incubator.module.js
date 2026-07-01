"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncubatorModule = void 0;
const common_1 = require("@nestjs/common");
const incubator_controller_1 = require("./incubator.controller");
const incubator_service_1 = require("./incubator.service");
const prisma_module_1 = require("../prisma/prisma.module");
let IncubatorModule = class IncubatorModule {
};
exports.IncubatorModule = IncubatorModule;
exports.IncubatorModule = IncubatorModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [incubator_controller_1.IncubatorController],
        providers: [incubator_service_1.IncubatorService],
    })
], IncubatorModule);
//# sourceMappingURL=incubator.module.js.map