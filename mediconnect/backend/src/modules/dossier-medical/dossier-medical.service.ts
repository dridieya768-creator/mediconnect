import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { DossierHistoriqueService } from './dossier-historique.service';
import { DossierAccesService } from './dossier-acces.service';
import { NiveauAcces } from './entities/dossier-acces-medecin.entity';
import { UpdateDossierDto } from './dto/update-dossier.dto';

@Injectable()
export class DossierMedicalService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    private readonly historiqueService: DossierHistoriqueService,
    private readonly accesService: DossierAccesService,
  ) {}

  async getPatientDirect(patientId: string): Promise<Patient | null> {
    return this.patientRepo.findOne({ where: { id: patientId } });
  }

  async getDossier(
    patientId: string,
    demandeurId: string,
    demandeurRole: string,
  ): Promise<Patient> {
    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient introuvable');

    // Propriétaire ou admin
    if (patient.userId === demandeurId || demandeurRole === 'ADMIN') {
      return patient;
    }

    // Médecin avec accès explicite
    await this.accesService.verifierAcces(patientId, demandeurId, NiveauAcces.LECTURE);
    return patient;
  }

  async updateDossierParMedecin(
    patientId: string,
    medecinId: string,
    updateData: UpdateDossierDto,
  ): Promise<Patient> {
    await this.accesService.verifierAcces(patientId, medecinId, NiveauAcces.LECTURE_ECRITURE);

    const patient = await this.patientRepo.findOne({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient introuvable');

    const snapshotAvant = { ...patient } as Record<string, any>;
    Object.assign(patient, updateData);
    const updated = await this.patientRepo.save(patient);

    await this.historiqueService.createHistorique(
      patientId,
      medecinId,
      'MEDECIN',
      snapshotAvant,
      { ...updated } as Record<string, any>,
    );

    return updated;
  }
}
