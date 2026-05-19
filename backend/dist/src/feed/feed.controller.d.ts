import { FeedService } from './feed.service';
export declare class FeedController {
    private readonly feedService;
    constructor(feedService: FeedService);
    getFeed(): Promise<({
        comments: ({
            author: {
                id: string;
                firstName: string;
                lastName: string;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            content: string;
            authorId: string;
            createdAt: Date;
            postId: string;
        })[];
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        likes: {
            userId: string;
        }[];
    } & {
        id: string;
        content: string;
        imageUrl: string | null;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createPost(req: any, body: {
        content: string;
        imageUrl?: string;
    }): Promise<{
        comments: {
            id: string;
            content: string;
            authorId: string;
            createdAt: Date;
            postId: string;
        }[];
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            role: import("@prisma/client").$Enums.UserRole;
        };
        likes: {
            id: string;
            postId: string;
            userId: string;
        }[];
    } & {
        id: string;
        content: string;
        imageUrl: string | null;
        authorId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleLike(req: any, id: string): Promise<{
        liked: boolean;
    }>;
    addComment(req: any, id: string, body: {
        content: string;
    }): Promise<{
        author: {
            id: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        content: string;
        authorId: string;
        createdAt: Date;
        postId: string;
    }>;
}
