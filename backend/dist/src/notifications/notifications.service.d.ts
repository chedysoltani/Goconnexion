import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: {
        userId: string;
        title: string;
        content: string;
        type: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    }[]>;
    markAsRead(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        userId: string;
        content: string;
        type: string;
        read: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
