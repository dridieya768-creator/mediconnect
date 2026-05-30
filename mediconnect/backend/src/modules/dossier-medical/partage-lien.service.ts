import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { EmailService } from '../../common/services/email.service';

export interface LienPartagePayload {
  type: 'PARTAGE_DOSSIER';
  patientId: string;
  permissions: {
    allergies: boolean;
    maladiesChroniques: boolean;
    medicamentsActuels: boolean;
    documents: boolean;
    observations: boolean;
  };
  expiresAt: string; 
}

@Injectable()
export class PartageLienService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    private readonly emailService: EmailService,
  ) {}

  

  async genererEtEnvoyerLien(
    patientId: string,
    patientNom: string,
    medecinEmail: string,
    permissions: LienPartagePayload['permissions'],
    dureeHeures: number,
  ): Promise<{ token: string; lien: string; expiresAt: string; emailEnvoye: boolean }> {
    const result = this.genererLien(patientId, permissions, dureeHeures);

    const emailEnvoye = await this.emailService.sendPartageEmail(
      medecinEmail,
      patientNom,
      result.lien,
      result.expiresAt,
    );

    return { ...result, emailEnvoye };
  }

  

  genererLien(
    patientId: string,
    permissions: LienPartagePayload['permissions'],
    dureeHeures: number,
  ): { token: string; lien: string; expiresAt: string } {
    const expiresAt = new Date(Date.now() + dureeHeures * 60 * 60 * 1000).toISOString();

    const payload: LienPartagePayload = {
      type: 'PARTAGE_DOSSIER',
      patientId,
      permissions,
      expiresAt,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: `${dureeHeures}h`,
      secret: process.env.JWT_SECRET,
    });

    const lien = `${process.env.FRONTEND_URL ?? process.env.APP_URL ?? 'http://localhost:4200'}/partage-dossier?token=${token}`;

    return { token, lien, expiresAt };
  }



  async accederVieLien(token: string): Promise<{
    patient: Partial<Patient>;
    permissions: LienPartagePayload['permissions'];
    expiresAt: string;
  }> {
    let payload: LienPartagePayload;

    try {
      payload = this.jwtService.verify<LienPartagePayload>(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    if (payload.type !== 'PARTAGE_DOSSIER') {
      throw new BadRequestException('Type de lien invalide');
    }

    if (new Date(payload.expiresAt) < new Date()) {
      throw new BadRequestException('Ce lien de partage a expiré');
    }

    const patient = await this.patientRepo.findOne({
      where: { id: payload.patientId },
      relations: ['user'],
    });

    if (!patient) throw new NotFoundException('Patient introuvable');

    
    const dossierFiltre: any = {
      id:            patient.id,
      nom:           patient.user?.lastName  ?? '',
      prenom:        patient.user?.firstName ?? '',
      dateNaissance: patient.dateNaissance,
      sexe:          patient.sexe,
      groupeSanguin: patient.groupeSanguin,
    };

    if (payload.permissions.allergies) {
      (dossierFiltre as any).allergies = patient.allergies;
    }
    if (payload.permissions.maladiesChroniques) {
      (dossierFiltre as any).maladiesChroniques = patient.maladiesChroniques;
    }
    if (payload.permissions.medicamentsActuels) {
      (dossierFiltre as any).medicamentsActuels = patient.medicamentsActuels;
    }
    if (payload.permissions.documents) {
      (dossierFiltre as any).documents = patient.documents;
    }

    return {
      patient: dossierFiltre,
      permissions: payload.permissions,
      expiresAt: payload.expiresAt,
    };
  }
}
