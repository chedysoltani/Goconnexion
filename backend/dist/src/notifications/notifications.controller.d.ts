import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
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
}
