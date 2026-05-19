import { IncubatorService } from './incubator.service';
export declare class IncubatorController {
    private readonly incubatorService;
    constructor(incubatorService: IncubatorService);
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
    createPost(req: any, body: {
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
    deletePost(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        content: string;
        category: string;
        authorId: string;
    }>;
    addComment(postId: string, req: any, content: string): Promise<{
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
    toggleLike(postId: string, req: any): Promise<{
        liked: boolean;
    }>;
}
