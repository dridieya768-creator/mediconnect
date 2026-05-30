import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, UseGuards,
  ParseUUIDPipe, ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DossierMedicalService } from './dossier-medical.service';
import { DossierHistoriqueService } from './dossier-historique.service';
import { DossierAccesService } from './dossier-acces.service';
import { NiveauAcces } from './entities/dossier-acces-medecin.entity';
import { CreateAccesDto } from './dto/create-acces.dto';
import { UpdateAccesDto } from './dto/update-acces.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';

@ApiTags('dossier-medical')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dossier-medical')
export class DossierMedicalController {
  constructor(
    private readonly dossierService: DossierMedicalService,
    private readonly historiqueService: DossierHistoriqueService,
    private readonly accesService: DossierAccesService,
  ) {}

  private getDemandeurId(req: any): string {
    return req.user?.sub ?? req.user?.id;
  }

  private getDemandeurRole(req: any): string {
    return req.user?.role ?? '';
  }

  

  @Get(':patientId')
  @ApiOperation({ summary: 'Consulter le dossier médical d\'un patient' })
  getDossier(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Req() req: any,
  ) {
    return this.dossierService.getDossier(patientId, this.getDemandeurId(req), this.getDemandeurRole(req));
  }

  @Patch(':patientId')
  @ApiOperation({ summary: 'Modifier le dossier médical (médecin autorisé)' })
  updateDossier(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() body: UpdateDossierDto,
    @Req() req: any,
  ) {
    return this.dossierService.updateDossierParMedecin(patientId, this.getDemandeurId(req), body);
  }

  

  @Get(':patientId/historique')
  @ApiOperation({ summary: 'Historique des modifications du dossier' })
  async getHistorique(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Query() query: HistoriqueQueryDto,
    @Req() req: any,
  ) {
    const demandeurId = this.getDemandeurId(req);
    const role = this.getDemandeurRole(req);

    
    const patient = await this.dossierService.getDossier(patientId, demandeurId, role);
    const isProprietaire = (patient as any).userId === demandeurId;

    if (!isProprietaire) {
      await this.accesService.verifierAcces(patientId, demandeurId, NiveauAcces.ACCES_COMPLET);
    }

    return this.historiqueService.getHistorique(patientId, query);
  }

  

  @Get(':patientId/acces/my-permissions')
  @ApiOperation({ summary: 'Récupérer les permissions du médecin connecté pour ce patient' })
  async getMyPermissions(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Req() req: any,
  ) {
    const medecinId = this.getDemandeurId(req);
    return this.accesService.getPermissionsMedecin(patientId, medecinId);
  }

  @Get(':patientId/acces')
  @ApiOperation({ summary: 'Lister les accès médecins au dossier' })
  async listerAcces(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Req() req: any,
  ) {
    await this.verifierProprietaire(patientId, req);
    return this.accesService.listerAcces(patientId);
  }

  @Post(':patientId/acces')
  @ApiOperation({ summary: 'Accorder l\'accès à un médecin' })
  async accorderAcces(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Body() dto: CreateAccesDto,
    @Req() req: any,
  ) {
    await this.verifierProprietaire(patientId, req);
    return this.accesService.accorderAcces(patientId, this.getDemandeurId(req), dto);
  }

  @Patch(':patientId/acces/:accesId')
  @ApiOperation({ summary: 'Modifier un accès médecin' })
  async modifierAcces(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('accesId', ParseUUIDPipe) accesId: string,
    @Body() dto: UpdateAccesDto,
    @Req() req: any,
  ) {
    await this.verifierProprietaire(patientId, req);
    return this.accesService.modifierAcces(accesId, patientId, dto);
  }

  @Delete(':patientId/acces/:accesId')
  @ApiOperation({ summary: 'Révoquer l\'accès d\'un médecin' })
  async revoquerAcces(
    @Param('patientId', ParseUUIDPipe) patientId: string,
    @Param('accesId', ParseUUIDPipe) accesId: string,
    @Req() req: any,
  ) {
    await this.verifierProprietaire(patientId, req);
    return this.accesService.revoquerAcces(accesId, patientId);
  }

  

  private async verifierProprietaire(patientId: string, req: any): Promise<void> {
    const demandeurId = this.getDemandeurId(req);
    // Chercher directement le patient sans passer par getDossier (évite verifierAcces)
    const patient = await this.dossierService.getPatientDirect(patientId);
    if (!patient || (patient as any).userId !== demandeurId) {
      throw new ForbiddenException('Accès réservé au patient propriétaire');
    }
  }
}
