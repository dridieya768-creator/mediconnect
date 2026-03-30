/// <reference types="multer" />
import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadPhoto(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
