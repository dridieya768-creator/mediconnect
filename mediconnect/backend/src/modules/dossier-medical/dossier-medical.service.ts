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

  
    if (patient.userId === demandeurId || demandeurRole === 'ADMIN') {
      return patient;
    }
    // med fi rdv ma pat acces lecture automatique 
    if (demandeurRole?.includes('MEDECIN')) {
      const rdv = await this.patientRepo.manager.query(
        `SELECT id FROM appointments
         WHERE doctor_id = $1
           AND patient_id = $2
           AND status IN ('CONFIRMED','REQUESTED')
         LIMIT 1`,
        [demandeurId, patient.userId ?? patientId]
      );
      if (rdv?.length > 0) return patient;
    }

    
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
