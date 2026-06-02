import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
export declare class CronService {
    private prisma;
    private notificationsService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    handleBirthdayWishes(): Promise<void>;
    handleInactivityCheck(): Promise<void>;
    triggerBirthdayWishForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    } | null>;
    handleEventReminders(): Promise<void>;
    triggerInactivityCheckForUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    } | null>;
}
