import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<{ url: string }> {
    try {
      // Créer le dossier s'il n'existe pas
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Générer un nom de fichier unique
      const fileExtension = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Sauvegarder le fichier
      fs.writeFileSync(filePath, file.buffer);

      // Retourner l'URL
      const url = `/uploads/${folder}/${fileName}`;
      return { url };
    } catch (error) {
      console.error('Upload error:', error);
      throw new BadRequestException('Erreur lors du téléchargement du fichier');
    }
  }
}