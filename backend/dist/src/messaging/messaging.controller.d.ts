import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    startConversation(req: any, targetUserId: string): Promise<{
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
    getConversations(req: any): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            content: string;
            conversationId: string;
            senderId: string;
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
    getMessages(conversationId: string, req: any): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
    })[]>;
    sendMessage(conversationId: string, req: any, content: string): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        conversationId: string;
        senderId: string;
    }>;
}
