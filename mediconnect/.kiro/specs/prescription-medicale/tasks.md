# Plan d'implémentation : Prescription Médicale (Sprint 3)

## Vue d'ensemble

Implémentation complète du cycle ordonnance : enrichissement de l'entité et des DTOs, services backend (interactions, PDF, prescriptions), contrôleur avec 7 endpoints, tests property-based (fast-check), puis composants Angular (médecin, patient, pharmacien) et intégration dans le routing.

Stack : NestJS + TypeORM/PostgreSQL (backend) · Angular 17 standalone components (frontend) · fast-check (tests de propriétés) · pdfmake (génération PDF).

---

## Tâches

- [x] 1. Enrichissement de l'entité `Prescription` et des DTOs backend
  - [x] 1.1 Ajouter les champs manquants à l'entité `Prescription`
    - Dans `backend/src/modules/prescriptions/entities/prescription.entity.ts`, ajouter les colonnes `emailSentAt` (`nullable: true`) et `notes` (`type: 'text', nullable: true`) conformément au design
    - Vérifier que `MedicationEntry` (type inline) inclut bien `quantityDelivered?: number`
    - _Requirements: 3.5, 1.2_

  - [x] 1.2 Créer `CreateMedicationDto` et `CreatePrescriptionDto`
    - Créer `backend/src/modules/prescriptions/dto/create-medication.dto.ts` avec les décorateurs `class-validator` (`@IsString`, `@IsInt`, `@Min`, `@IsBoolean`, `@IsNotEmpty`)
    - Créer `backend/src/modules/prescriptions/dto/create-prescription.dto.ts` avec `@IsUUID`, `@IsArray`, `@ValidateNested({ each: true })`, `@ArrayMinSize(1)`, `@Type(() => CreateMedicationDto)`, `@IsOptional`
    - _Requirements: 1.1, 1.2, 1.6, 6.1, 6.2, 6.4_

  - [x] 1.3 Créer `ScanPharmacyDto`
    - Créer `backend/src/modules/prescriptions/dto/scan-pharmacy.dto.ts` avec `@IsString @IsNotEmpty() qrCode` et `@IsObject() dispensedQuantities: Record<string, number>`
    - _Requirements: 5.1, 5.2_

- [x] 2. `InteractionCheckerService` (liste statique JSON)
  - [x] 2.1 Créer le fichier de données `drug-interactions.json`
    - Créer `backend/src/modules/prescriptions/data/drug-interactions.json` avec au moins 5 paires d'interactions couvrant les trois niveaux de sévérité (`mineure`, `moderee`, `severe`)
    - _Requirements: 1.3_

  - [x] 2.2 Implémenter `InteractionCheckerService`
    - Créer `backend/src/modules/prescriptions/interaction-checker.service.ts`
    - Injecter le JSON via `require()` ou `fs.readFileSync`
    - Méthode `checkInteractions(medications: CreateMedicationDto[]): DrugInteraction[]` : itération O(n²) sur les paires CIP
    - Exporter l'interface `DrugInteraction` depuis ce fichier
    - _Requirements: 1.3_

  - [ ]* 2.3 Écrire le test de propriété — Property 2 : sévérité valide
    - Fichier : `backend/src/modules/prescriptions/tests/interaction-checker.spec.ts`
    - **Property 2 : Interactions médicamenteuses avec sévérité valide**
    - **Validates: Requirements 1.3**
    - Arbitraire `medicationArb` générant des `CreateMedicationDto` avec CIP aléatoires
    - `fc.assert(fc.property(fc.array(medicationArb, { minLength: 2 }), ...))`

- [-] 3. `PdfService` (pdfmake)
  - [x] 3.1 Installer la dépendance pdfmake
    - Ajouter `pdfmake` et `@types/pdfmake` aux dépendances du backend (`package.json`)
    - _Requirements: 2.1, 2.5_

  - [ ] 3.2 Implémenter `PdfService`
    - Créer `backend/src/modules/prescriptions/pdf.service.ts`
    - Méthode `generatePrescriptionPdf(prescription, doctor, patient, qrImageBase64): Promise<Buffer>`
    - Document A4 incluant : en-tête médecin (nom, RPPS, spécialité), informations patient (nom, date de naissance, NSS), tableau des médicaments, dates d'émission/expiration, image QR-ORD en base64
    - Retourner le buffer via `pdfmake.createPdf(docDef).getBuffer(callback)`
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 3.3 Écrire le test de propriété — Property 4 : PDF non-vide avec signature `%PDF`
    - Fichier : `backend/src/modules/prescriptions/tests/pdf.service.spec.ts`
    - **Property 4 : PDF généré non-vide et persisté**
    - **Validates: Requirements 2.1, 2.3**
    - Vérifier que le Buffer retourné est non-vide et que `buffer.slice(0,4).toString()` vaut `'%PDF'`

- [ ] 4. `PrescriptionsService` — méthodes complètes
  - [ ] 4.1 Refactoriser `create()` pour intégrer `PdfService` et `EmailService`
    - Remplacer le `dto: any` par `CreatePrescriptionDto`
    - Après `generateOrdonnanceQr`, appeler `qrCodesService.generateQrImage(qrCode)` pour obtenir le base64
    - Appeler `pdfService.generatePrescriptionPdf(...)` → stocker le buffer sur disque (dossier `uploads/prescriptions/`) et persister `pdfUrl`
    - Appeler `emailService.sendPrescriptionEmail(...)` en fire-and-forget ; si succès, mettre à jour `emailSentAt`
    - Calculer `expiresAt = issuedAt + 90 jours` (utiliser `date-fns` ou calcul natif)
    - _Requirements: 1.1, 1.7, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 4.2 Écrire le test de propriété — Property 1 : statut ACTIVE et expiration 90j
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 1 : Prescription créée avec statut ACTIVE et expiration à 90 jours**
    - **Validates: Requirements 1.1**
    - Arbitraire `validCreatePrescriptionDtoArb` ; vérifier `result.status === 'ACTIVE'` et `differenceInDays(result.expiresAt, result.issuedAt) === 90`

  - [ ]* 4.3 Écrire le test de propriété — Property 3 : format QR-ORD
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 3 : Format du QR-ORD**
    - **Validates: Requirements 1.7**
    - Vérifier que `result.qrCode` correspond au pattern `/^QR-ORD-[A-Z0-9]+-[A-Z0-9]+$/`

  - [ ] 4.4 Implémenter `findByPatient()` avec tri et isolation
    - S'assurer que la requête utilise `order: { createdAt: 'DESC' }` et filtre strictement sur `patientId`
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ]* 4.5 Écrire le test de propriété — Property 7 : tri décroissant
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 7 : Liste des ordonnances triée par date décroissante**
    - **Validates: Requirements 4.1, 4.2**
    - Vérifier `prescriptions[i].createdAt >= prescriptions[i+1].createdAt` pour tout `i`

  - [ ]* 4.6 Écrire le test de propriété — Property 8 : isolation des données patient
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 8 : Isolation des données patient**
    - **Validates: Requirements 4.5**
    - Vérifier que toutes les prescriptions retournées ont `patientId === paramètre fourni`

  - [ ] 4.7 Implémenter `scanAtPharmacy()` avec validation JWT via `QrCodesService.scanQr()`
    - Appeler `qrCodesService.scanQr(qrCode, pharmacistId)` avant de chercher la prescription (valide la signature JWT)
    - Conserver la logique de mise à jour `quantityDelivered` et de transition de statut existante
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 4.8 Écrire le test de propriété — Property 9 : transition de statut après dispensation
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 9 : Transition de statut après dispensation**
    - **Validates: Requirements 5.2, 5.3, 5.4**
    - Arbitraires `activePrescriptionArb` et `dispensedQuantitiesArb` ; vérifier la règle FULLY_USED / PARTIALLY_USED

  - [ ]* 4.9 Écrire le test de propriété — Property 10 : rejet JWT invalide
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 10 : Rejet des JWT invalides ou expirés**
    - **Validates: Requirements 5.9**
    - Vérifier que `scanAtPharmacy` lève `BadRequestException` pour tout QR-ORD avec JWT invalide

  - [ ] 4.10 Implémenter `revoke()` (nouvelle méthode)
    - Méthode `revoke(id: string): Promise<Prescription>` : vérifier existence, passer `status = REVOKED`, appeler `qrCodesService.revokeQr(prescription.qrCode)`
    - _Requirements: 5.7_

  - [ ]* 4.11 Écrire le test de propriété — Property 11 : round-trip sérialisation
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 11 : Round-trip sérialisation des prescriptions**
    - **Validates: Requirements 6.3**
    - Créer puis récupérer via `findOne` ; vérifier l'équivalence de `medications`, `patientId`, `doctorId`, `status`

  - [ ] 4.12 Ajouter `sendPrescriptionEmail()` à `EmailService`
    - Dans `backend/src/common/services/email.service.ts`, ajouter la méthode `sendPrescriptionEmail(toEmail, toName, doctorName, issuedAt, pdfBuffer): Promise<boolean>`
    - Email avec pièce jointe PDF (`attachments: [{ filename: 'ordonnance.pdf', content: pdfBuffer }]`), nom du médecin, date d'émission, lien espace patient
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 4.13 Écrire le test de propriété — Property 5 : email avec bonnes métadonnées
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 5 : Email envoyé avec les bonnes métadonnées**
    - **Validates: Requirements 3.1, 3.2**
    - Vérifier que `EmailService` est appelé avec `toEmail === patient.email` et que le contenu inclut `doctorName` et `issuedAt`

  - [ ]* 4.14 Écrire le test de propriété — Property 6 : `emailSentAt` enregistré
    - Fichier : `backend/src/modules/prescriptions/tests/prescriptions.service.spec.ts`
    - **Property 6 : `emailSentAt` enregistré après envoi réussi**
    - **Validates: Requirements 3.5**
    - Vérifier que `emailSentAt` est une date non-nulle postérieure à `issuedAt`

- [ ] 5. `PrescriptionsController` — 7 endpoints
  - [ ] 5.1 Remplacer les `dto: any` par les DTOs typés et ajouter les guards de rôles
    - Importer `CreatePrescriptionDto`, `ScanPharmacyDto`
    - Décorer `POST /prescriptions` avec `@Roles('DOCTOR')` et `@UseGuards(RolesGuard)`
    - Décorer `GET /prescriptions/patient/:patientId` avec `@Roles('DOCTOR', 'PATIENT')`
    - Décorer `POST /prescriptions/scan-pharmacy` avec `@Roles('PHARMACIST')`
    - Décorer `PATCH /prescriptions/:id/revoke` avec `@Roles('DOCTOR')`
    - _Requirements: 1.1, 4.5, 4.6, 5.1_

  - [ ] 5.2 Ajouter l'endpoint `GET /prescriptions/:id/pdf`
    - Retourner le buffer PDF avec `@Res()`, headers `Content-Type: application/pdf` et `Content-Disposition: attachment; filename="ordonnance-{id}.pdf"`
    - Vérifier les droits d'accès (DOCTOR ou PATIENT propriétaire)
    - _Requirements: 4.3, 4.4_

  - [ ] 5.3 Ajouter l'endpoint `PATCH /prescriptions/:id/revoke`
    - Appeler `prescriptionsService.revoke(id)`
    - _Requirements: 5.7_

  - [ ] 5.4 Enregistrer `InteractionCheckerService` et `PdfService` dans `PrescriptionsModule`
    - Mettre à jour `prescriptions.module.ts` : ajouter `InteractionCheckerService` et `PdfService` dans `providers`, importer `EmailModule` (ou `CommonModule`) pour `EmailService`
    - _Requirements: 1.3, 2.1_

- [ ] 6. Checkpoint backend — vérifier que tous les tests passent
  - S'assurer que `npm run test --prefix backend` passe sans erreur.
  - Vérifier que le module compile sans erreur TypeScript.
  - Demander à l'utilisateur si des ajustements sont nécessaires avant de passer au frontend.

- [ ] 7. `PrescriptionService` Angular + modèles
  - [ ] 7.1 Créer les modèles Angular
    - Créer `frontend/src/app/core/models/prescription.model.ts` avec les interfaces `Prescription`, `MedicationEntry`, `DrugInteraction`, `CreatePrescriptionDto`, `ScanPharmacyDto` et le type `PrescriptionStatus`
    - _Requirements: 6.1, 6.3_

  - [ ] 7.2 Créer `PrescriptionService` Angular
    - Créer `frontend/src/app/core/services/prescription.service.ts` (injectable `{ providedIn: 'root' }`)
    - Méthodes : `createPrescription`, `getPatientPrescriptions`, `getPrescription`, `downloadPdf` (retourne `Observable<Blob>`), `scanPharmacy`, `checkInteractions`
    - Utiliser `HttpClient` ; `downloadPdf` avec `{ responseType: 'blob' }`
    - _Requirements: 4.3, 5.1_

- [ ] 8. `OrdonnanceFormComponent` (médecin)
  - [ ] 8.1 Créer le composant standalone
    - Créer `frontend/src/app/modules/medecin/pages/prescriptions/ordonnance-form.component.ts`
    - Formulaire réactif (`ReactiveFormsModule`) avec `FormArray` pour les médicaments
    - Champs par médicament : CIP, nom, dosage, posologie, durée (jours), quantité, substituable
    - Champs globaux : `patientId` (sélecteur ou input UUID), `notes` (optionnel)
    - _Requirements: 1.2_

  - [ ] 8.2 Intégrer la vérification des interactions
    - À chaque `valueChanges` du `FormArray`, appeler `PrescriptionService.checkInteractions()`
    - Afficher les alertes : badge orange non-bloquant pour `moderee`, bannière rouge bloquante avec confirmation pour `severe`
    - Désactiver le bouton "Soumettre" si interaction `severe` non confirmée
    - _Requirements: 1.3, 1.4, 1.5_

  - [ ] 8.3 Soumettre le formulaire
    - Sur submit valide, appeler `PrescriptionService.createPrescription(dto)` et afficher un message de succès ou d'erreur
    - _Requirements: 1.1, 1.6_

- [ ] 9. `PatientPrescriptionsComponent` — enrichissement
  - [ ] 9.1 Remplacer le placeholder par la liste réelle
    - Dans `frontend/src/app/modules/patient/pages/prescriptions/patient-prescriptions.component.ts`, injecter `PrescriptionService` et `AuthService`
    - Au `ngOnInit`, appeler `getPatientPrescriptions(currentUser.id)` et stocker le résultat
    - _Requirements: 4.1, 4.2, 4.5_

  - [ ] 9.2 Afficher la liste avec badges de statut et bouton PDF
    - Afficher pour chaque ordonnance : nom médecin, dates, statut (badge coloré selon `PrescriptionStatus`), liste des médicaments
    - Bouton "Télécharger PDF" : actif si `pdfUrl` défini, désactivé avec tooltip "PDF non disponible" sinon
    - Sur clic "Télécharger", appeler `downloadPdf(id)` et déclencher le téléchargement via `URL.createObjectURL(blob)`
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 10. `ScannerPharmacieComponent` (pharmacien)
  - [x] 10.1 Créer le composant standalone
    - Créer `frontend/src/app/modules/pharmacie/pages/scanner/scanner-pharmacie.component.ts`
    - Champ de saisie du QR-ORD (input texte + bouton "Rechercher")
    - Sur soumission, appeler `PrescriptionService.getPrescription()` via `scanPharmacy` pour afficher les détails
    - _Requirements: 5.1_

  - [x] 10.2 Afficher les détails et formulaire de dispensation
    - Afficher : nom patient, nom médecin, liste des médicaments avec `quantity` et `quantityDelivered`
    - Formulaire de dispensation : input numérique par médicament pour les quantités délivrées
    - Bouton "Valider la dispensation" → appeler `PrescriptionService.scanPharmacy(qrCode, dispensed)`
    - Afficher le statut mis à jour après dispensation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 11. Routing et intégration dans les modules
  - [x] 11.1 Ajouter la route ordonnances dans `medecin.routes.ts`
    - Ajouter `{ path: 'prescriptions', loadComponent: () => import('./pages/prescriptions/ordonnance-form.component').then(m => m.OrdonnanceFormComponent) }`
    - _Requirements: 1.1_

  - [x] 11.2 Ajouter la route ordonnances dans `patient.routes.ts`
    - Ajouter `{ path: 'prescriptions', loadComponent: () => import('./pages/prescriptions/patient-prescriptions.component').then(m => m.PatientPrescriptionsComponent) }`
    - _Requirements: 4.1_

  - [x] 11.3 Ajouter la route scanner dans `pharmacie.routes.ts`
    - Ajouter `{ path: 'scanner', loadComponent: () => import('./pages/scanner/scanner-pharmacie.component').then(m => m.ScannerPharmacieComponent) }`
    - _Requirements: 5.1_

  - [x] 11.4 Ajouter les liens de navigation dans les sidebars
    - Dans la sidebar médecin, ajouter un lien "Ordonnances" pointant vers `/medecin/prescriptions`
    - Dans la sidebar patient, ajouter un lien "Mes Ordonnances" pointant vers `/patient/prescriptions`
    - Dans la sidebar pharmacien, ajouter un lien "Scanner QR-ORD" pointant vers `/pharmacie/scanner`
    - _Requirements: 1.1, 4.1, 5.1_

- [ ] 12. Checkpoint final — vérifier l'intégration complète
  - S'assurer que `npm run build --prefix frontend` passe sans erreur.
  - Vérifier que tous les tests backend passent (`npm run test --prefix backend`).
  - Demander à l'utilisateur si des ajustements sont nécessaires.

---

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Chaque tâche référence les requirements pour la traçabilité
- Les tests de propriétés utilisent **fast-check** avec `numRuns: 100` minimum
- Chaque test de propriété est annoté `// Feature: prescription-medicale, Property N: <texte>`
- Les checkpoints garantissent une validation incrémentale avant de passer à la couche suivante
