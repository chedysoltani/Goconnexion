import { ConnectionsService } from './connections.service';
export declare class ConnectionsController {
    private readonly connectionsService;
    constructor(connectionsService: ConnectionsService);
    sendRequest(req: any, body: {
        receiverId: string;
        message?: string;
        isCoffee?: boolean;
    }): Promise<{
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        receiver: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.RequestStatus;
        message: string | null;
        senderId: string;
        receiverId: string;
        isCoffee: boolean;
    }>;
    acceptRequest(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    declineRequest(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingRequests(req: any): Promise<({
        sender: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.RequestStatus;
        message: string | null;
        senderId: string;
        receiverId: string;
        isCoffee: boolean;
    })[]>;
    getSentRequests(req: any): Promise<({
        receiver: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.RequestStatus;
        message: string | null;
        senderId: string;
        receiverId: string;
        isCoffee: boolean;
    })[]>;
    getFriends(req: any): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    removeConnection(req: any, friendId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
