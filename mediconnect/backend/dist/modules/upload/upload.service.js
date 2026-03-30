"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
let UploadService = class UploadService {
    async uploadFile(file, folder) {
        try {
            const uploadDir = path.join(process.cwd(), 'uploads', folder);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileExtension = path.extname(file.originalname);
            const fileName = `${(0, uuid_1.v4)()}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            const url = `/uploads/${folder}/${fileName}`;
            return { url };
        }
        catch (error) {
            console.error('Upload error:', error);
            throw new common_1.BadRequestException('Erreur lors du téléchargement du fichier');
        }
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)()
], UploadService);
//# sourceMappingURL=upload.service.js.map