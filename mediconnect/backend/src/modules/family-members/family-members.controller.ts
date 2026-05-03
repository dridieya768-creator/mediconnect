import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FamilyMembersService } from './family-members.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@ApiTags('family-members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('family-members')
export class FamilyMembersController {
  constructor(private readonly familyMembersService: FamilyMembersService) {}

  // GET /api/v1/family-members
  @Get()
  @ApiOperation({ summary: 'Lister les membres familiaux du patient connecté' })
  async findAll(@Req() req: any) {
    const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
    return this.familyMembersService.findAllByPatient(patientId);
  }

  // POST /api/v1/family-members
  @Post()
  @ApiOperation({ summary: 'Ajouter un membre familial' })
  async create(@Body() dto: CreateFamilyMemberDto, @Req() req: any) {
    const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
    return this.familyMembersService.create(patientId, dto);
  }

  // PATCH /api/v1/family-members/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un membre familial' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFamilyMemberDto,
    @Req() req: any,
  ) {
    const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
    return this.familyMembersService.update(id, patientId, dto);
  }

  // DELETE /api/v1/family-members/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un membre familial (soft delete)' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
    return this.familyMembersService.remove(id, patientId);
  }

  // POST /api/v1/family-members/:id/documents
  @Post(':id/documents')
  @ApiOperation({ summary: 'Uploader les documents justificatifs (مضمون ولادة)' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'docMembre',  maxCount: 1 },
        { name: 'docPatient', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: './uploads/family-docs',
          filename: (_req, file, cb) => {
            const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
            cb(null, `${unique}${extname(file.originalname)}`);
          },
        }),
        fileFilter: (_req, file, cb) => {
          if (file.mimetype === 'application/pdf') {
            cb(null, true);
          } else {
            cb(new BadRequestException('Seuls les fichiers PDF sont acceptés'), false);
          }
        },
        limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
      },
    ),
  )
  async uploadDocuments(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: { docMembre?: Express.Multer.File[]; docPatient?: Express.Multer.File[] },
    @Req() req: any,
  ) {
    const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
    const docMembrePath  = files?.docMembre?.[0]?.path;
    const docPatientPath = files?.docPatient?.[0]?.path;

    if (!docMembrePath && !docPatientPath) {
      throw new BadRequestException('Aucun fichier reçu');
    }

    return this.familyMembersService.uploadDocuments(id, patientId, docMembrePath, docPatientPath);
  }
}
