import { BusinessCardsService } from './business-cards.service';
import { CreateBusinessCardInvitationDto } from './dto/business-card.dto';
export declare class BusinessCardsController {
    private readonly businessCardsService;
    constructor(businessCardsService: BusinessCardsService);
    create(req: any, dto: CreateBusinessCardInvitationDto): Promise<{
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
    findAll(req: any): Promise<{
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
    findReceived(req: any): Promise<({
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
    getStats(req: any): Promise<{
        total: number;
        pending: number;
        sent: number;
        accepted: number;
    }>;
    accept(id: string, req: any): Promise<{
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
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
