import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCardInvitationDto } from './dto/business-card.dto';
export declare class BusinessCardsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(senderId: string, dto: CreateBusinessCardInvitationDto): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        senderId: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        inviteMethod: import("@prisma/client").$Enums.InviteMethod;
    }>;
    findAllBySender(senderId: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        senderId: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        inviteMethod: import("@prisma/client").$Enums.InviteMethod;
    }[]>;
    updateStatus(id: string, senderId: string, status: string): Promise<{
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        senderId: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        inviteMethod: import("@prisma/client").$Enums.InviteMethod;
    }>;
    findAllReceived(recipientEmail: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        email: string | null;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        status: import("@prisma/client").$Enums.InvitationStatus;
        senderId: string;
        phone: string | null;
        company: string | null;
        position: string | null;
        inviteMethod: import("@prisma/client").$Enums.InviteMethod;
    })[]>;
    getStats(senderId: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        accepted: number;
    }>;
    remove(id: string, senderId: string): Promise<{
        message: string;
    }>;
}
