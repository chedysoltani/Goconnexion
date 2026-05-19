import { PrismaService } from '../prisma/prisma.service';
export declare class MessagingService {
    private prisma;
    constructor(prisma: PrismaService);
    startConversation(userId: string, targetUserId: string): Promise<{
        participants: ({
            user: {
                firstName: string;
                lastName: string;
                id: string;
                avatarUrl: string | null;
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
            conversationId: string;
            senderId: string;
            content: string;
        }[];
        participants: ({
            user: {
                firstName: string;
                lastName: string;
                id: string;
                avatarUrl: string | null;
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
            firstName: string;
            lastName: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        content: string;
    })[]>;
    sendMessage(conversationId: string, senderId: string, content: string): Promise<{
        sender: {
            firstName: string;
            lastName: string;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        conversationId: string;
        senderId: string;
        content: string;
    }>;
}
