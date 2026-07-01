import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateBusinessCardInvitationDto } from './dto/business-card.dto';

@Injectable()
export class BusinessCardsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(senderId: string, dto: CreateBusinessCardInvitationDto) {
    if (dto.inviteMethod === 'EMAIL' && !dto.email) {
      throw new BadRequestException('Email requis pour invitation par email');
    }
    if (dto.inviteMethod === 'SMS' && !dto.phone) {
      throw new BadRequestException('Téléphone requis pour invitation par SMS');
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

  async findAllBySender(senderId: string) {
    return this.prisma.businessCardInvitation.findMany({
      where: { senderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, senderId: string, status: string) {
    const invitation = await this.prisma.businessCardInvitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundException('Invitation introuvable');
    if (invitation.senderId !== senderId) throw new ForbiddenException('Accès refusé');
    return this.prisma.businessCardInvitation.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async findAllReceived(recipientEmail: string) {
    return this.prisma.businessCardInvitation.findMany({
      where: { email: recipientEmail },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'desc' },
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
