import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DossierAccesMedecin, NiveauAcces } from './entities/dossier-acces-medecin.entity';
import { CreateAccesDto } from './dto/create-acces.dto';
import { UpdateAccesDto } from './dto/update-acces.dto';

const HIERARCHIE: Record<NiveauAcces, number> = {
  [NiveauAcces.LECTURE]:          1,
  [NiveauAcces.LECTURE_ECRITURE]: 2,
  [NiveauAcces.ACCES_COMPLET]:    3,
};

@Injectable()
export class DossierAccesService {
  constructor(
    @InjectRepository(DossierAccesMedecin)
    private readonly accesRepo: Repository<DossierAccesMedecin>,
  ) {}

  async accorderAcces(
    patientId: string,
    accordeParId: string,
    dto: CreateAccesDto,
  ): Promise<DossierAccesMedecin> {
    const existing = await this.accesRepo.findOne({
      where: { patientId, medecinId: dto.medecinId },
    });
    if (existing) throw new ConflictException('Un accès existe déjà pour ce médecin');

    const acces = this.accesRepo.create({
      patientId,
      medecinId: dto.medecinId,
      niveauAcces: dto.niveauAcces,
      accordeParId,
      dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : null,
      actif: true,
      permissions: dto.permissions ?? null,
    });
    return this.accesRepo.save(acces);
  }

  async modifierAcces(
    accesId: string,
    patientId: string,
    dto: UpdateAccesDto,
  ): Promise<DossierAccesMedecin> {
    const acces = await this.accesRepo.findOne({ where: { id: accesId, patientId } });
    if (!acces) throw new NotFoundException('Accès introuvable');

    if (dto.niveauAcces !== undefined) acces.niveauAcces = dto.niveauAcces;
    if (dto.dateExpiration !== undefined) acces.dateExpiration = dto.dateExpiration ? new Date(dto.dateExpiration) : null;
    if (dto.actif !== undefined) acces.actif = dto.actif;
    if ((dto as any).permissions !== undefined) acces.permissions = (dto as any).permissions;

    return this.accesRepo.save(acces);
  }

  async revoquerAcces(accesId: string, patientId: string): Promise<void> {
    const acces = await this.accesRepo.findOne({ where: { id: accesId, patientId } });
    if (!acces) throw new NotFoundException('Accès introuvable');
    acces.actif = false;
    await this.accesRepo.save(acces);
  }

  async getPermissionsMedecin(patientId: string, medecinId: string): Promise<any> {
    const acces = await this.accesRepo.findOne({
      where: { patientId, medecinId, actif: true },
    });
    if (!acces) {
      // Pas d'accès — tout est refusé
      return { permissions: { allergies: false, documents: false, observations: false }, niveauAcces: null };
    }
    return {
      permissions: acces.permissions ?? { allergies: true, documents: true, observations: true },
      niveauAcces: acces.niveauAcces,
    };
  }

  async listerAcces(patientId: string): Promise<any[]> {
    try {
      const list = await this.accesRepo.find({
        where: { patientId },
        relations: ['medecin'],
      });
      return list.map(a => ({
        id:           a.id,
        patientId:    a.patientId,
        medecinId:    a.medecinId,
        medecinNom:   a.medecin ? `${(a.medecin as any).firstName ?? ''} ${(a.medecin as any).lastName ?? ''}`.trim() : null,
        niveauAcces:  a.niveauAcces,
        permissions:  (a as any).permissions ?? null,
        actif:        a.actif,
        dateExpiration: a.dateExpiration,
        createdAt:    a.createdAt,
      }));
    } catch (err: any) {
      console.warn('[listerAcces] error:', err?.message);
      // Fallback sans relations si la colonne permissions n'existe pas encore
      const list = await this.accesRepo.find({ where: { patientId } });
      return list.map(a => ({
        id:          a.id,
        patientId:   a.patientId,
        medecinId:   a.medecinId,
        medecinNom:  null,
        niveauAcces: a.niveauAcces,
        permissions: null,
        actif:       a.actif,
        dateExpiration: a.dateExpiration,
        createdAt:   a.createdAt,
      }));
    }
  }

  async verifierAcces(
    patientId: string,
    medecinId: string,
    niveauRequis: NiveauAcces,
  ): Promise<DossierAccesMedecin> {
    const acces = await this.accesRepo.findOne({
      where: { patientId, medecinId },
    });

    if (!acces || !acces.actif) {
      throw new ForbiddenException('Accès non autorisé');
    }

    if (acces.dateExpiration && acces.dateExpiration < new Date()) {
      throw new ForbiddenException('Accès expiré');
    }

    if (HIERARCHIE[acces.niveauAcces] < HIERARCHIE[niveauRequis]) {
      throw new ForbiddenException('Niveau d\'accès insuffisant');
    }

    return acces;
  }
}
