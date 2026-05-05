import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { QrCodesService } from '../qr-codes/qr-codes.service';
import { TicketPdfService } from './ticket-pdf.service';
import { Prescription, PrescriptionStatus } from '../prescriptions/entities/prescription.entity';
import { DossierHistorique } from '../dossier-medical/entities/dossier-historique.entity';
import { User } from '../users/entities/user.entity';
import { ScanQrOrdDto } from './dto/scan-qr-ord.dto';
import { ScanMedCipDto } from './dto/scan-med-cip.dto';
import { ConfirmerDelivranceDto, MedicamentDelivreDto } from './dto/confirmer-delivrance.dto';

// ─── DTOs de réponse ──────────────────────────────────────────────────────────

export interface PrescriptionDetailDto {
  id: string;
  qrCode: string;
  status: PrescriptionStatus;
  issuedAt: Date;
  expiresAt: Date;
  patient: {
    id: string;
    nom: string;
    prenom: string;
    nss: string;
  };
  medecin: {
    id: string;
    nom: string;
    prenom: string;
    rpps: string | null;
  };
  medications: {
    cip: string;
    name: string;
    dosage: string;
    posology: string;
    durationDays: number;
    quantity: number;
    quantityDelivered: number;
    isSubstitutable: boolean;
  }[];
  notes?: string;
}

export interface FinancierLigneDto {
  cip: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  partCnam: number;
  partPatient: number;
}

export interface FinancierDto {
  lignes: FinancierLigneDto[];
  totalCnam: number;
  totalPatient: number;
  totalGeneral: number;
}

export interface MedicamentDelivreeResultDto {
  cip: string;
  nom: string;
  quantiteDelivree: number;
  prixUnitaire: number;
  partCnam: number;
  partPatient: number;
}

export interface DelivranceResultDto {
  delivranceId: string;
  prescriptionId: string;
  status: PrescriptionStatus;
  medicamentsDelivres: MedicamentDelivreeResultDto[];
  financier: FinancierDto;
  ticketUrl: string;
  delivreAt: Date;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class DelivranceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly qrCodesService: QrCodesService,
    private readonly ticketPdfService: TicketPdfService,
    @InjectRepository(Prescription)
    private readonly prescriptionRepo: Repository<Prescription>,
  ) {}

  // ── 3.1 — Scan QR-ORD ──────────────────────────────────────────────────────

  async scanQrOrd(
    dto: ScanQrOrdDto,
    pharmacienId: string,
  ): Promise<PrescriptionDetailDto> {
    // 1. Vérifier la signature JWT via QrCodesService
    let result: { valid: boolean; data: any };
    try {
      result = await this.qrCodesService.scanQr(dto.qrCode, pharmacienId);
    } catch {
      throw new BadRequestException('Signature QR invalide');
    }

    if (!result.valid) {
      throw new BadRequestException('Signature QR invalide');
    }

    // 2. Charger la prescription avec ses relations
    const entityId: string =
      result.data.prescription_id ?? result.data.entityId ?? result.data.entity_id;

    const prescription = await this.prescriptionRepo.findOne({
      where: { id: entityId },
      relations: ['patient', 'patient.user', 'doctor'],
    });

    if (!prescription) {
      throw new NotFoundException('Ordonnance introuvable');
    }

    // 3. Vérifier l'expiration (avant le statut, pour mettre à jour si nécessaire)
    if (prescription.expiresAt < new Date()) {
      await this.prescriptionRepo.update(prescription.id, {
        status: PrescriptionStatus.EXPIRED,
      });
      throw new BadRequestException('Ordonnance expirée');
    }

    // 4. Vérifier le statut
    switch (prescription.status) {
      case PrescriptionStatus.FULLY_USED:
        throw new BadRequestException('Ordonnance déjà entièrement délivrée');
      case PrescriptionStatus.EXPIRED:
        throw new BadRequestException('Ordonnance expirée');
      case PrescriptionStatus.REVOKED:
        throw new BadRequestException('Ordonnance révoquée');
    }

    // 5. Mapper vers PrescriptionDetailDto
    return this.mapToPrescriptionDetailDto(prescription);
  }

  // ── 3.4 — Scan QR-MED-CIP ──────────────────────────────────────────────────

  async scanMedCip(
    dto: ScanMedCipDto,
    sessionCounts: Record<string, number>,
  ): Promise<{ cip: string; nom: string; quantiteSession: number }> {
    // 1. Charger la prescription
    const prescription = await this.prescriptionRepo.findOne({
      where: { id: dto.prescriptionId },
    });

    if (!prescription) {
      throw new NotFoundException('Ordonnance introuvable');
    }

    // 2. Extraire le CIP (JSON { cip, hash } ou valeur directe)
    let cip: string;
    try {
      const parsed = JSON.parse(dto.qrMedCip);
      cip = parsed.cip;
    } catch {
      cip = dto.qrMedCip;
    }

    // 3. Trouver le médicament dans la prescription
    // Si le CIP en base est vide, matcher par nom (ordonnances créées manuellement)
    let med = prescription.medications.find((m) => m.cip === cip);
    if (!med) {
      // Fallback : chercher un médicament sans CIP ou avec clé temporaire MED_X
      const isTempKey = /^MED_\d+$/.test(cip);
      let medWithoutCip: typeof prescription.medications[0] | undefined;

      if (isTempKey) {
        // Extraire l'index depuis MED_0, MED_1, etc.
        const idx = parseInt(cip.replace('MED_', ''), 10);
        medWithoutCip = prescription.medications[idx];
      } else {
        medWithoutCip = prescription.medications.find(
          (m) => !m.cip || m.cip.trim() === '' || /^MED_\d+$/.test(m.cip),
        );
      }

      if (medWithoutCip) {
        // Assigner le CIP scanné à ce médicament
        medWithoutCip.cip = cip;
        await this.prescriptionRepo.save(prescription);
        med = medWithoutCip;
      }
    }
    if (!med) {
      throw new BadRequestException(`Médicament non prescrit : CIP ${cip}`);
    }

    // 4. Calculer la quantité de session
    const quantiteSession = (sessionCounts[cip] ?? 0) + 1;

    // 5. Vérifier le dépassement
    const alreadyDelivered = med.quantityDelivered ?? 0;
    if (alreadyDelivered + quantiteSession > med.quantity) {
      throw new BadRequestException(`Quantité dépassée pour ${med.name}`);
    }

    return { cip, nom: med.name, quantiteSession };
  }

  // ── 3.7 — Calcul financier ─────────────────────────────────────────────────

  calculerFinancier(medicaments: MedicamentDelivreDto[]): FinancierDto {
    const lignes: FinancierLigneDto[] = medicaments.map((med) => {
      const montantTotal = med.prixUnitaire * med.quantiteDelivree;
      const partCnam = montantTotal * med.tauxCnam;
      const partPatient = montantTotal - partCnam;

      // Trouver le nom du médicament (on utilise le CIP comme fallback)
      return {
        cip: med.cip,
        nom: med.cip, // sera enrichi dans confirmerDelivrance si besoin
        quantite: med.quantiteDelivree,
        prixUnitaire: med.prixUnitaire,
        montantTotal,
        partCnam,
        partPatient,
      };
    });

    const totalCnam = lignes.reduce((sum, l) => sum + l.partCnam, 0);
    const totalPatient = lignes.reduce((sum, l) => sum + l.partPatient, 0);
    const totalGeneral = lignes.reduce((sum, l) => sum + l.montantTotal, 0);

    return { lignes, totalCnam, totalPatient, totalGeneral };
  }

  // ── 3.9 — Confirmer la délivrance ─────────────────────────────────────────

  async confirmerDelivrance(
    dto: ConfirmerDelivranceDto,
    pharmacienId: string,
  ): Promise<DelivranceResultDto> {
    // Charger la prescription avec ses relations avant la transaction
    const prescription = await this.prescriptionRepo.findOne({
      where: { id: dto.prescriptionId },
      relations: ['patient', 'patient.user', 'doctor'],
    });

    if (!prescription) {
      throw new NotFoundException('Ordonnance introuvable');
    }

    const delivranceId = uuidv4();
    const delivreAt = new Date();

    try {
      const result = await this.dataSource.transaction(async (em) => {
        // 1. Mettre à jour quantityDelivered pour chaque médicament délivré
        for (const medDelivre of dto.medicamentsDelivres) {
          const med = prescription.medications.find((m) => m.cip === medDelivre.cip);
          if (med) {
            med.quantityDelivered = (med.quantityDelivered ?? 0) + medDelivre.quantiteDelivree;
          }
        }

        // 2. Calculer le nouveau statut
        const allFull = prescription.medications.every(
          (m) => (m.quantityDelivered ?? 0) >= m.quantity,
        );
        prescription.status = allFull
          ? PrescriptionStatus.FULLY_USED
          : PrescriptionStatus.PARTIALLY_USED;

        // 3. Persister la prescription
        await em.save(Prescription, prescription);

        // 4. Générer le ticket PDF (hors transaction car I/O fichier)
        // Construire les données financières enrichies avec les noms
        const financierLignes = dto.medicamentsDelivres.map((medDelivre) => {
          const med = prescription.medications.find((m) => m.cip === medDelivre.cip);
          const nom = med?.name ?? medDelivre.cip;
          const montantTotal = medDelivre.prixUnitaire * medDelivre.quantiteDelivree;
          const partCnam = montantTotal * medDelivre.tauxCnam;
          const partPatient = montantTotal - partCnam;
          return {
            cip: medDelivre.cip,
            nom,
            quantite: medDelivre.quantiteDelivree,
            prixUnitaire: medDelivre.prixUnitaire,
            montantTotal,
            partCnam,
            partPatient,
            dosage: med?.dosage,
            posologie: med?.posology,
            duree: med?.durationDays ? `${med.durationDays} jours` : undefined,
          };
        });

        const totalCnam = financierLignes.reduce((s, l) => s + l.partCnam, 0);
        const totalPatient = financierLignes.reduce((s, l) => s + l.partPatient, 0);
        const totalGeneral = financierLignes.reduce((s, l) => s + l.montantTotal, 0);

        const patientNom    = prescription.patient?.user?.lastName  ?? '';
        const patientPrenom = prescription.patient?.user?.firstName ?? '';
        const patientNss    = prescription.patient?.nss ?? '';
        const pharmacienUser = await em.findOne(User, { where: { id: pharmacienId } });
        const pharmacienNom = pharmacienUser?.lastName ?? '';
        const pharmacienPrenom = pharmacienUser?.firstName ?? '';

        const ticketUrl = await this.ticketPdfService.generateTicket({
          delivranceId,
          delivreAt,
          patient: { nom: patientNom, prenom: patientPrenom, nss: patientNss },
          pharmacien: { nom: pharmacienNom, prenom: pharmacienPrenom },
          qrOrdCode: prescription.qrCode,
          medicaments: financierLignes.map((l) => ({
            cip: l.cip,
            nom: l.nom,
            dosage: l.dosage,
            posologie: l.posologie,
            duree: l.duree,
            quantiteDelivree: l.quantite,
            prixUnitaire: l.prixUnitaire,
            partCnam: l.partCnam,
            partPatient: l.partPatient,
          })),
          financier: { totalCnam, totalPatient, totalGeneral },
        });

        // 5. Créer l'entrée DossierHistorique dans la transaction
        await em.save(DossierHistorique, {
          patientId: prescription.patientId,
          modifieParId: pharmacienId,
          roleAuteur: 'PHARMACIEN',
          champsModifies: {
            delivrance_pharmacie: {
              avant: null,
              apres: {
                prescriptionId: prescription.id,
                delivranceId,
                medicaments: dto.medicamentsDelivres.map((m) => ({
                  cip: m.cip,
                  nom: prescription.medications.find((med) => med.cip === m.cip)?.name ?? m.cip,
                  quantiteDelivree: m.quantiteDelivree,
                })),
                pharmacienId,
                delivreAt: delivreAt.toISOString(),
              },
            },
          },
          snapshotAvant: { prescriptionStatus: PrescriptionStatus.ACTIVE },
          commentaire: `Délivrance pharmacie — ${prescription.qrCode}`,
        });

        // Construire le résultat
        const financierDto: FinancierDto = {
          lignes: financierLignes.map((l) => ({
            cip: l.cip,
            nom: l.nom,
            quantite: l.quantite,
            prixUnitaire: l.prixUnitaire,
            montantTotal: l.montantTotal,
            partCnam: l.partCnam,
            partPatient: l.partPatient,
          })),
          totalCnam,
          totalPatient,
          totalGeneral,
        };

        const medicamentsDelivresResult: MedicamentDelivreeResultDto[] =
          dto.medicamentsDelivres.map((m) => {
            const ligne = financierLignes.find((l) => l.cip === m.cip)!;
            return {
              cip: m.cip,
              nom: ligne.nom,
              quantiteDelivree: m.quantiteDelivree,
              prixUnitaire: m.prixUnitaire,
              partCnam: ligne.partCnam,
              partPatient: ligne.partPatient,
            };
          });

        return {
          delivranceId,
          prescriptionId: prescription.id,
          status: prescription.status,
          medicamentsDelivres: medicamentsDelivresResult,
          financier: financierDto,
          ticketUrl,
          delivreAt,
        } as DelivranceResultDto;
      });

      return result;
    } catch (error) {
      // Ne pas re-wrapper les exceptions NestJS déjà levées
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de l'enregistrement de la délivrance",
      );
    }
  }

  // ── Helpers privés ─────────────────────────────────────────────────────────

  private mapToPrescriptionDetailDto(prescription: Prescription): PrescriptionDetailDto {
    const patient = prescription.patient;
    const doctor = prescription.doctor;

    return {
      id: prescription.id,
      qrCode: prescription.qrCode,
      status: prescription.status,
      issuedAt: prescription.issuedAt,
      expiresAt: prescription.expiresAt,
      patient: {
        id: patient?.id ?? prescription.patientId,
        nom: patient?.user?.lastName ?? '',
        prenom: patient?.user?.firstName ?? '',
        nss: patient?.nss ?? '',
      },
      medecin: {
        id: doctor?.id ?? prescription.doctorId,
        nom: doctor?.lastName ?? '',
        prenom: doctor?.firstName ?? '',
        rpps: null, // RPPS est dans MedecinProfile, pas dans User
      },
      medications: (prescription.medications ?? []).map((m) => ({
        cip: m.cip,
        name: m.name,
        dosage: m.dosage,
        posology: m.posology,
        durationDays: m.durationDays,
        quantity: m.quantity,
        quantityDelivered: m.quantityDelivered ?? 0,
        isSubstitutable: m.isSubstitutable,
      })),
      notes: prescription.notes ?? undefined,
    };
  }
}
