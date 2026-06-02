import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCardInvitationDto } from './dto/business-card.dto';

@Injectable()
export class BusinessCardsService {
  constructor(private prisma: PrismaService) {}

  async create(senderId: string, dto: CreateBusinessCardInvitationDto) {
    if (dto.inviteMethod === 'EMAIL' && !dto.email) {
      throw new BadRequestException('Email requis pour invitation par email');
    }
    if (dto.inviteMethod === 'SMS' && !dto.phone) {
      throw new BadRequestException('Téléphone requis pour invitation par SMS');
    }

    const invitation = await this.prisma.businessCardInvitation.create({
      data: { ...dto, senderId, status: 'SENT' },
    });

    // In a real app, send email/SMS here via NodeMailer or Twilio
    // For now we mark as SENT immediately
    return invitation;
  }

  async findAllBySender(senderId: string) {
    return this.prisma.businessCardInvitation.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, senderId: string, status: string) {
    return this.prisma.businessCardInvitation.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getStats(senderId: string) {
    const [total, pending, sent, accepted] = await Promise.all([
      this.prisma.businessCardInvitation.count({ where: { senderId } }),
      this.prisma.businessCardInvitation.count({ where: { senderId, status: 'PENDING' } }),
      this.prisma.businessCardInvitation.count({ where: { senderId, status: 'SENT' } }),
      this.prisma.businessCardInvitation.count({ where: { senderId, status: 'ACCEPTED' } }),
    ]);
    return { total, pending, sent, accepted };
  }

  async remove(id: string, senderId: string) {
    await this.prisma.businessCardInvitation.deleteMany({ where: { id, senderId } });
    return { message: 'Invitation supprimée' };
  }
}
