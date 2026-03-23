// ═══════════════════════════════════════════════════════════════
// STUBS - Modules à implémenter (structure prête)
// ═══════════════════════════════════════════════════════════════

// ─── users.module.ts ──────────────────────────────────────────
// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { User } from './entities/user.entity';
// @Module({ imports: [TypeOrmModule.forFeature([User])], ... })
// export class UsersModule {}

// ─── patients.module.ts ───────────────────────────────────────
// Entités: Patient (NSS, allergies, antécédents, groupe sanguin)
// Service: CRUD patient + partage dossier + accès urgence
// Controller: GET /patients/:id, PATCH /patients/:id/share

// ─── appointments.module.ts ───────────────────────────────────
// Entités: Appointment (patient_id, medecin_id, date, status, type)
// Types: PHYSIQUE, DOMICILE, TELECONSULTATION
// Status: DEMANDE, VALIDE, CONFIRME, ANNULE, TERMINE
// Service: createAppointment, validateAppointment, cancelAppointment

// ─── pharmacy.module.ts ───────────────────────────────────────
// Entités: Dispensation, StockMovement, Medication
// Service: scanOrdonnance, deliverMedications, updateStock
// Controller: POST /pharmacy/scan, POST /pharmacy/deliver

// ─── laboratory.module.ts ─────────────────────────────────────
// Entités: LabRequest, LabSample (tube), LabResult
// Service: receiveRequest, recordResults, validateBiological, sendResults

// ─── radiology.module.ts ──────────────────────────────────────
// Entités: ImagingRequest, ImagingStudy (DICOM), ImagingReport
// Service: receiveRequest, storeImages, writeReport, signReport

// ─── notifications.module.ts ──────────────────────────────────
// Service: sendEmail (NodeMailer), sendSMS, sendPush
// Triggers: nouveau RDV, résultats prêts, rappels

export const MODULES_TODO = [
  'UsersModule',
  'PatientsModule',
  'AppointmentsModule',
  'PharmacyModule',
  'LaboratoryModule',
  'RadiologyModule',
  'NotificationsModule',
];
