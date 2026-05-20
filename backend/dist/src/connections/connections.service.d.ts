import { PrismaService } from '../prisma/prisma.service';
export declare class ConnectionsService {
    private prisma;
    constructor(prisma: PrismaService);
    sendRequest(senderId: string, receiverId: string, message?: string, isCoffee?: boolean): Promise<{
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
    acceptRequest(requestId: string, receiverId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    declineRequest(requestId: string, receiverId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getPendingRequests(userId: string): Promise<({
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
    getSentRequests(userId: string): Promise<({
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
    getFriends(userId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        role: import("@prisma/client").$Enums.UserRole;
    }[]>;
    removeConnection(userId: string, friendId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
