/// <reference types="multer" />
export declare class UploadService {
    uploadFile(file: Express.Multer.File, folder: string): Promise<{
        url: string;
    }>;
}
