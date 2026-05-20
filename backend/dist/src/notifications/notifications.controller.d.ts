import { NotificationsService } from './notifications.service';
import { CronService } from './cron.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly cronService;
    constructor(notificationsService: NotificationsService, cronService: CronService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    }[]>;
    markAsRead(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    }>;
    markAllAsRead(req: any): Promise<import("@prisma/client").Prisma.BatchPayload>;
    testBirthday(req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    } | null>;
    testInactivity(req: any): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    } | null>;
}
