import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string }> {
    try {
      
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      
      fs.writeFileSync(filePath, file.buffer);

    
      const url = `/uploads/${folder}/${fileName}`;
      return { url };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Erreur lors du téléchargement du fichier');
    }
  }
}