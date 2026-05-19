import { ConnectionsService } from './connections.service';
export declare class ConnectionsController {
    private readonly connectionsService;
    constructor(connectionsService: ConnectionsService);
    sendRequest(req: any, body: {
        receiverId: string;
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
        senderId: string;
        receiverId: string;
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
        senderId: string;
        receiverId: string;
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
        senderId: string;
        receiverId: string;
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
