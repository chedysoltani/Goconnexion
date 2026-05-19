import { PrismaService } from '../prisma/prisma.service';
export declare class IncubatorService {
    private prisma;
    constructor(prisma: PrismaService);
    createPost(userId: string, data: {
        title: string;
        content: string;
        category: string;
    }): Promise<{
        author: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        authorId: string;
    }>;
    findAll(category?: string): Promise<({
        comments: ({
            author: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            postId: string;
        })[];
        author: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
            avatarUrl: string | null;
        };
        likes: {
            id: string;
            userId: string;
            postId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        authorId: string;
    })[]>;
    findOne(id: string): Promise<{
        comments: ({
            author: {
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
            postId: string;
        })[];
        author: {
            firstName: string;
            lastName: string;
            role: import("@prisma/client").$Enums.UserRole;
            id: string;
            avatarUrl: string | null;
        };
        likes: {
            id: string;
            userId: string;
            postId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        authorId: string;
    }>;
    deletePost(id: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        authorId: string;
    }>;
    addComment(userId: string, postId: string, content: string): Promise<{
        author: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        authorId: string;
        postId: string;
    }>;
    toggleLike(userId: string, postId: string): Promise<{
        liked: boolean;
    }>;
}
