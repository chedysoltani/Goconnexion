import { MessagingService } from './messaging.service';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    startConversation(req: any, targetUserId: string): Promise<{
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
    getConversations(req: any): Promise<({
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
    getMessages(conversationId: string, req: any): Promise<({
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
    sendMessage(conversationId: string, req: any, content: string): Promise<{
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
