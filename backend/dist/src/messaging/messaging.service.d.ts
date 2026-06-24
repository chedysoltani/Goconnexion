import { PrismaService } from '../prisma/prisma.service';
export declare class MessagingService {
    private prisma;
    constructor(prisma: PrismaService);
    startConversation(userId: string, targetUserId: string): Promise<{
        participants: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            conversationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        isGroup: boolean;
    }>;
    getConversations(userId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            senderId: string;
            content: string;
            conversationId: string;
        }[];
        participants: ({
            user: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
                role: import("@prisma/client").$Enums.UserRole;
            };
        } & {
            id: string;
            userId: string;
            joinedAt: Date;
            conversationId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        isGroup: boolean;
    })[]>;
    getMessages(conversationId: string, userId: string): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        senderId: string;
        content: string;
        conversationId: string;
    })[]>;
    sendMessage(conversationId: string, senderId: string, content: string): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        senderId: string;
        content: string;
        conversationId: string;
    }>;
}
