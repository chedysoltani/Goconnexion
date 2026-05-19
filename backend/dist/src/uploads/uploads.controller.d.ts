import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadFile(file: any, req: any): Promise<{
        message: string;
        file: {
            path: string;
            id: string;
            createdAt: Date;
            name: string;
            userId: string;
            mimeType: string;
            size: number;
            messageId: string | null;
        };
    }>;
}
