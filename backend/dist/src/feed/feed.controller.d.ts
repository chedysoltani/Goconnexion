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
            createdAt: Date;
            content: string;
            authorId: string;
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
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        imageUrl: string | null;
    })[]>;
    createPost(req: any, body: {
        content: string;
        imageUrl?: string;
    }): Promise<{
        comments: {
            id: string;
            createdAt: Date;
            content: string;
            authorId: string;
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
            userId: string;
            postId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        content: string;
        authorId: string;
        imageUrl: string | null;
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
        createdAt: Date;
        content: string;
        authorId: string;
        postId: string;
    }>;
}
