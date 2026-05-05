"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelivranceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const qr_codes_service_1 = require("../qr-codes/qr-codes.service");
const ticket_pdf_service_1 = require("./ticket-pdf.service");
const prescription_entity_1 = require("../prescriptions/entities/prescription.entity");
const dossier_historique_entity_1 = require("../dossier-medical/entities/dossier-historique.entity");
const user_entity_1 = require("../users/entities/user.entity");
let DelivranceService = class DelivranceService {
    constructor(dataSource, qrCodesService, ticketPdfService, prescriptionRepo) {
        this.dataSource = dataSource;
        this.qrCodesService = qrCodesService;
        this.ticketPdfService = ticketPdfService;
        this.prescriptionRepo = prescriptionRepo;
    }
    async scanQrOrd(dto, pharmacienId) {
        let result;
        try {
            result = await this.qrCodesService.scanQr(dto.qrCode, pharmacienId);
        }
        catch {
            throw new common_1.BadRequestException('Signature QR invalide');
        }
        if (!result.valid) {
            throw new common_1.BadRequestException('Signature QR invalide');
        }
        const entityId = result.data.prescription_id ?? result.data.entityId ?? result.data.entity_id;
        const prescription = await this.prescriptionRepo.findOne({
            where: { id: entityId },
            relations: ['patient', 'patient.user', 'doctor'],
        });
        if (!prescription) {
            throw new common_1.NotFoundException('Ordonnance introuvable');
        }
        if (prescription.expiresAt < new Date()) {
            await this.prescriptionRepo.update(prescription.id, {
                status: prescription_entity_1.PrescriptionStatus.EXPIRED,
            });
            throw new common_1.BadRequestException('Ordonnance expirée');
        }
        switch (prescription.status) {
            case prescription_entity_1.PrescriptionStatus.FULLY_USED:
                throw new common_1.BadRequestException('Ordonnance déjà entièrement délivrée');
            case prescription_entity_1.PrescriptionStatus.EXPIRED:
                throw new common_1.BadRequestException('Ordonnance expirée');
            case prescription_entity_1.PrescriptionStatus.REVOKED:
                throw new common_1.BadRequestException('Ordonnance révoquée');
        }
        return this.mapToPrescriptionDetailDto(prescription);
    }
    async scanMedCip(dto, sessionCounts) {
        const prescription = await this.prescriptionRepo.findOne({
            where: { id: dto.prescriptionId },
        });
        if (!prescription) {
            throw new common_1.NotFoundException('Ordonnance introuvable');
        }
        let cip;
        try {
            const parsed = JSON.parse(dto.qrMedCip);
            cip = parsed.cip;
        }
        catch {
            cip = dto.qrMedCip;
        }
        let med = prescription.medications.find((m) => m.cip === cip);
        if (!med) {
            const isTempKey = /^MED_\d+$/.test(cip);
            let medWithoutCip;
            if (isTempKey) {
                const idx = parseInt(cip.replace('MED_', ''), 10);
                medWithoutCip = prescription.medications[idx];
            }
            else {
                medWithoutCip = prescription.medications.find((m) => !m.cip || m.cip.trim() === '' || /^MED_\d+$/.test(m.cip));
            }
            if (medWithoutCip) {
                medWithoutCip.cip = cip;
                await this.prescriptionRepo.save(prescription);
                med = medWithoutCip;
            }
        }
        if (!med) {
            throw new common_1.BadRequestException(`Médicament non prescrit : CIP ${cip}`);
        }
        const quantiteSession = (sessionCounts[cip] ?? 0) + 1;
        const alreadyDelivered = med.quantityDelivered ?? 0;
        if (alreadyDelivered + quantiteSession > med.quantity) {
            throw new common_1.BadRequestException(`Quantité dépassée pour ${med.name}`);
        }
        return { cip, nom: med.name, quantiteSession };
    }
    calculerFinancier(medicaments) {
        const lignes = medicaments.map((med) => {
            const montantTotal = med.prixUnitaire * med.quantiteDelivree;
            const partCnam = montantTotal * med.tauxCnam;
            const partPatient = montantTotal - partCnam;
            return {
                cip: med.cip,
                nom: med.cip,
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
    async confirmerDelivrance(dto, pharmacienId) {
        const prescription = await this.prescriptionRepo.findOne({
            where: { id: dto.prescriptionId },
            relations: ['patient', 'patient.user', 'doctor'],
        });
        if (!prescription) {
            throw new common_1.NotFoundException('Ordonnance introuvable');
        }
        const delivranceId = (0, uuid_1.v4)();
        const delivreAt = new Date();
        try {
            const result = await this.dataSource.transaction(async (em) => {
                for (const medDelivre of dto.medicamentsDelivres) {
                    const med = prescription.medications.find((m) => m.cip === medDelivre.cip);
                    if (med) {
                        med.quantityDelivered = (med.quantityDelivered ?? 0) + medDelivre.quantiteDelivree;
                    }
                }
                const allFull = prescription.medications.every((m) => (m.quantityDelivered ?? 0) >= m.quantity);
                prescription.status = allFull
                    ? prescription_entity_1.PrescriptionStatus.FULLY_USED
                    : prescription_entity_1.PrescriptionStatus.PARTIALLY_USED;
                await em.save(prescription_entity_1.Prescription, prescription);
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
                const patientNom = prescription.patient?.user?.lastName ?? '';
                const patientPrenom = prescription.patient?.user?.firstName ?? '';
                const patientNss = prescription.patient?.nss ?? '';
                const pharmacienUser = await em.findOne(user_entity_1.User, { where: { id: pharmacienId } });
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
                await em.save(dossier_historique_entity_1.DossierHistorique, {
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
                    snapshotAvant: { prescriptionStatus: prescription_entity_1.PrescriptionStatus.ACTIVE },
                    commentaire: `Délivrance pharmacie — ${prescription.qrCode}`,
                });
                const financierDto = {
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
                const medicamentsDelivresResult = dto.medicamentsDelivres.map((m) => {
                    const ligne = financierLignes.find((l) => l.cip === m.cip);
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
                };
            });
            return result;
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException ||
                error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException("Erreur lors de l'enregistrement de la délivrance");
        }
    }
    mapToPrescriptionDetailDto(prescription) {
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
                rpps: null,
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
};
exports.DelivranceService = DelivranceService;
exports.DelivranceService = DelivranceService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, typeorm_1.InjectRepository)(prescription_entity_1.Prescription)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        qr_codes_service_1.QrCodesService,
        ticket_pdf_service_1.TicketPdfService,
        typeorm_2.Repository])
], DelivranceService);
//# sourceMappingURL=delivrance.service.js.map