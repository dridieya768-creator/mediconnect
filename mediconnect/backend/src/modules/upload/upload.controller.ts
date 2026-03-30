import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('photo')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Seuls les fichiers JPG, JPEG et PNG sont acceptés'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }
    return this.uploadService.uploadFile(file, 'photos');
  }
}