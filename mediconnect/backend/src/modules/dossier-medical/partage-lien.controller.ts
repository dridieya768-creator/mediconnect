import { Controller, Post, Get, Body, Query, Req, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PartageLienService } from './partage-lien.service';
import { IsBoolean, IsInt, IsObject, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';

class PermissionsDto {
  @IsBoolean() allergies: boolean;
  @IsBoolean() maladiesChroniques: boolean;
  @IsBoolean() medicamentsActuels: boolean;
  @IsBoolean() documents: boolean;
  @IsBoolean() observations: boolean;
}

class GenererLienDto {
  @IsObject()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;

  @IsInt() @Min(1) @Max(168)
  dureeHeures: number;
}

@Controller('dossier-medical/partage')
export class PartageLienController {
  constructor(
    private readonly partageLienService: PartageLienService,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  // ── Patient génère un lien (authentifié) ─────────────────────────────────
  @Post('generer')
  @UseGuards(JwtAuthGuard)
  async genererLien(@Body() dto: GenererLienDto, @Req() req: any) {
    const userId = req.user?.sub ?? req.user?.id;

    const patient = await this.patientRepo.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!patient) {
      throw new InternalServerErrorException('Profil patient introuvable pour cet utilisateur');
    }

    const patientNom = patient.user
      ? `${patient.user.firstName ?? ''} ${patient.user.lastName ?? ''}`.trim()
      : 'Patient';

    // Si medecinEmail fourni → générer + envoyer email
    if ((dto as any).medecinEmail) {
      return this.partageLienService.genererEtEnvoyerLien(
        patient.id,
        patientNom,
        (dto as any).medecinEmail,
        dto.permissions,
        dto.dureeHeures,
      );
    }

    return this.partageLienService.genererLien(
      patient.id,
      dto.permissions,
      dto.dureeHeures,
    );
  }

  // ── Médecin tiers accède via le lien (public, pas de JWT requis) ──────────
  @Get('acceder')
  async accederVieLien(@Query('token') token: string) {
    if (!token) {
      return { error: 'Token manquant' };
    }
    return this.partageLienService.accederVieLien(token);
  }
}
