import { PrismaService } from '../prisma/prisma.service';
export declare class UploadsService {
    private prisma;
    constructor(prisma: PrismaService);
    saveFileRecord(userId: string, data: {
        name: string;
        path: string;
        mimeType: string;
        size: number;
    }): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        name: string;
        userId: string;
        mimeType: string;
        size: number;
        messageId: string | null;
    }>;
}
