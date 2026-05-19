"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    app.enableCors();
    app.use('/uploads', express_1.default.static((0, path_1.join)(__dirname, '..', 'public', 'uploads')));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`GoConnexions Backend is running on: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map