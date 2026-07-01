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
exports.BusinessCardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let BusinessCardsService = class BusinessCardsService {
    prisma;
    mailService;
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
    }
    async create(senderId, dto) {
        if (dto.inviteMethod === 'EMAIL' && !dto.email) {
            throw new common_1.BadRequestException('Email requis pour invitation par email');
        }
        if (dto.inviteMethod === 'SMS' && !dto.phone) {
            throw new common_1.BadRequestException('Téléphone requis pour invitation par SMS');
        }
        const sender = await this.prisma.user.findUnique({
            where: { id: senderId },
            select: { firstName: true, lastName: true },
        });
        const senderName = sender ? `${sender.firstName} ${sender.lastName}` : 'Un membre GoConnexions';
        const invitation = await this.prisma.businessCardInvitation.create({
            data: { ...dto, senderId, status: 'SENT' },
        });
        if (dto.inviteMethod === 'EMAIL' && dto.email) {
            await this.mailService.sendBusinessCardInvitation(senderName, dto.email);
        }
        return invitation;
    }
    async findAllBySender(senderId) {
        return this.prisma.businessCardInvitation.findMany({
            where: { senderId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, senderId, status) {
        const invitation = await this.prisma.businessCardInvitation.findUnique({ where: { id } });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation introuvable');
        if (invitation.senderId !== senderId)
            throw new common_1.ForbiddenException('Accès refusé');
        return this.prisma.businessCardInvitation.update({
            where: { id },
            data: { status: status },
        });
    }
    async findAllReceived(recipientEmail) {
        return this.prisma.businessCardInvitation.findMany({
            where: { email: recipientEmail },
            include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStats(senderId) {
        const [total, pending, sent, accepted] = await Promise.all([
            this.prisma.businessCardInvitation.count({ where: { senderId } }),
            this.prisma.businessCardInvitation.count({ where: { senderId, status: 'PENDING' } }),
            this.prisma.businessCardInvitation.count({ where: { senderId, status: 'SENT' } }),
            this.prisma.businessCardInvitation.count({ where: { senderId, status: 'ACCEPTED' } }),
        ]);
        return { total, pending, sent, accepted };
    }
    async remove(id, senderId) {
        await this.prisma.businessCardInvitation.deleteMany({ where: { id, senderId } });
        return { message: 'Invitation supprimée' };
    }
};
exports.BusinessCardsService = BusinessCardsService;
exports.BusinessCardsService = BusinessCardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], BusinessCardsService);
//# sourceMappingURL=business-cards.service.js.map