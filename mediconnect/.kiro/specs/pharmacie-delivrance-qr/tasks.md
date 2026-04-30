# Plan d'implémentation : pharmacie-delivrance-qr

## Vue d'ensemble

Implémentation du flux complet de délivrance en pharmacie via QR-ORD dans MediConnect.
Le backend NestJS expose trois endpoints dans `PharmacieModule`. Le frontend Angular 19 orchestre un workflow en 5 étapes via `DelivranceWorkflowComponent`. La délivrance est atomique : mise à jour prescription + historique dossier + génération ticket PDF dans une seule transaction PostgreSQL.

## Tâches

- [x] 1. DTOs et interfaces backend
  - [x] 1.1 Créer `backend/src/modules/pharmacie/dto/scan-qr-ord.dto.ts` avec `ScanQrOrdDto` (`qrCode: string`)
    - Décorateurs class-validator : `@IsString()`, `@IsNotEmpty()`
    - _Requirements: 1.1_
  - [x] 1.2 Créer `backend/src/modules/pharmacie/dto/scan-med-cip.dto.ts` avec `ScanMedCipDto` (`qrMedCip`, `prescriptionId`)
    - Décorateurs class-validator sur les deux champs
    - _Requirements: 3.1_
  - [x] 1.3 Créer `backend/src/modules/pharmacie/dto/confirmer-delivrance.dto.ts` avec `ConfirmerDelivranceDto`
    - Tableau `medicamentsDelivres` : `cip`, `quantiteDelivree`, `prixUnitaire`, `tauxCnam`
    - Décorateurs `@IsArray()`, `@ValidateNested()`, `@Type()`
    - _Requirements: 4.1, 6.1_

- [x] 2. TicketPdfService
  - [x] 2.1 Créer `backend/src/modules/pharmacie/ticket-pdf.service.ts`
    - Méthode `generateTicket(data: TicketData): Promise<string>` utilisant pdfkit (même pattern que `PdfService`)
    - Contenu PDF : id délivrance, date/heure, patient, pharmacien, tableau médicaments (nom, dosage, posologie, durée, qté délivrée), récapitulatif financier (part CNAM, part patient, total), code QR-ORD de référence
    - Sauvegarde dans `uploads/tickets/ticket-{delivranceId}.pdf` (créer le répertoire si absent avec `fs.mkdirSync`)
    - Retourne l'URL relative `/uploads/tickets/ticket-{delivranceId}.pdf`
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  - [ ]* 2.2 Écrire les tests unitaires pour `TicketPdfService`
    - Vérifier que le fichier est créé au bon chemin
    - Vérifier que l'URL retournée est non-nulle et correctement formatée
    - _Requirements: 5.2, 5.3_

- [x] 3. DelivranceService — logique métier
  - [x] 3.1 Créer `backend/src/modules/pharmacie/delivrance.service.ts`
    - Injecter : `DataSource` (TypeORM), `QrCodesService`, `TicketPdfService`, `DossierHistoriqueService`, `Repository<Prescription>`
    - Implémenter `scanQrOrd(dto, pharmacienId)` :
      - Appeler `QrCodesService.scanQr()` → lever `BadRequestException("Signature QR invalide")` si JWT invalide
      - Charger la `Prescription` par `entityId` → lever `NotFoundException("Ordonnance introuvable")` si absente
      - Vérifier expiration (`expiresAt < now`) → mettre à jour statut `EXPIRED` + lever `BadRequestException("Ordonnance expirée")`
      - Vérifier statut : `FULLY_USED` → 400, `EXPIRED` → 400, `REVOKED` → 400 (messages exacts du design)
      - Retourner `PrescriptionDetailDto` avec patient et médecin chargés
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 3.2 Écrire le test property-based pour Property 1 (Signature JWT valide requise)
    - **Property 1 : Signature JWT valide requise pour accéder à une ordonnance**
    - **Validates: Requirements 1.1, 1.2**
    - `fc.property(fc.string(), fc.string(), ...)` — tout JWT malformé doit lever `BadRequestException`
  - [ ]* 3.3 Écrire le test property-based pour Property 3 (Seules ACTIVE/PARTIALLY_USED délivrables)
    - **Property 3 : Seules les ordonnances ACTIVE ou PARTIALLY_USED sont délivrables**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - `fc.property(fc.constantFrom('FULLY_USED', 'EXPIRED', 'REVOKED'), ...)` — tout statut invalide doit lever `BadRequestException`
  - [x] 3.4 Implémenter `scanMedCip(dto, sessionId)` dans `DelivranceService` :
    - Charger la prescription par `prescriptionId`
    - Extraire le CIP13 du `qrMedCip` (le contenu est le CIP directement ou un JSON `{ cip, hash }`)
    - Vérifier que le CIP est présent dans `prescription.medications[].cip` → sinon `BadRequestException("Médicament non prescrit : CIP {valeur}")`
    - Vérifier que `quantityDelivered + quantiteSession + 1 <= quantity` → sinon `BadRequestException("Quantité dépassée pour {nom}")`
    - Retourner `{ cip, nom, quantiteSession }`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ]* 3.5 Écrire le test property-based pour Property 5 (CIP inconnu rejeté)
    - **Property 5 : CIP inconnu rejeté**
    - **Validates: Requirements 3.1, 3.2**
    - `fc.property(fc.string({ minLength: 13, maxLength: 13 }), ...)` — tout CIP absent de la prescription doit lever `BadRequestException`
  - [ ]* 3.6 Écrire le test property-based pour Property 6 (Quantité ne dépasse pas le prescrit)
    - **Property 6 : Quantité scannée ne dépasse pas la quantité prescrite**
    - **Validates: Requirements 3.4, 6.1**
    - `fc.property(fc.nat({ max: 100 }), fc.nat({ max: 100 }), ...)` — `quantiteSession > quantity - quantityDelivered` doit lever `BadRequestException`
  - [x] 3.7 Implémenter `calculerFinancier(medications)` dans `DelivranceService` :
    - Pour chaque ligne : `montantTotal = prixUnitaire × quantiteDelivree`, `partCnam = montantTotal × tauxCnam`, `partPatient = montantTotal - partCnam`
    - Calculer `totalCnam`, `totalPatient`, `totalGeneral`
    - Retourner `FinancierDto`
    - _Requirements: 4.1, 4.2, 4.5_
  - [ ]* 3.8 Écrire le test property-based pour Property 7 (Calcul financier cohérent)
    - **Property 7 : Calcul financier cohérent**
    - **Validates: Requirements 4.1, 4.2, 4.5**
    - `fc.property(fc.array(fc.record({ quantite, prixUnitaire, tauxCnam }), { minLength: 1 }), ...)` — vérifier `partCnam + partPatient === montantTotal`, `totalCnam + totalPatient === totalGeneral`, tous montants ≥ 0
  - [x] 3.9 Implémenter `confirmerDelivrance(dto, pharmacienId)` dans `DelivranceService` :
    - Ouvrir une transaction `DataSource.transaction()`
    - Mettre à jour `medications[].quantityDelivered` pour chaque médicament délivré
    - Calculer le nouveau statut : `FULLY_USED` si tous `quantityDelivered >= quantity`, sinon `PARTIALLY_USED`
    - Persister la prescription dans la transaction
    - Appeler `TicketPdfService.generateTicket()` avec les données de délivrance
    - Créer l'entrée `DossierHistorique` dans la transaction (via `entityManager.save()`) avec `roleAuteur = 'PHARMACIEN'`, `champsModifies.delivrance_pharmacie`
    - En cas d'erreur : rollback automatique + lever `InternalServerErrorException("Erreur lors de l'enregistrement de la délivrance")`
    - Retourner `DelivranceResultDto` avec `delivranceId`, `ticketUrl`, `financier`, `status`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6, 7.1, 7.2, 7.3_
  - [ ]* 3.10 Écrire le test property-based pour Property 8 (Atomicité)
    - **Property 8 : Mise à jour atomique de la prescription**
    - **Validates: Requirements 6.4, 6.6, 7.2, 7.3**
    - Simuler une erreur lors de la création `DossierHistorique` et vérifier que la prescription n'est pas modifiée en base
  - [ ]* 3.11 Écrire le test property-based pour Property 9 (Statut post-délivrance cohérent)
    - **Property 9 : Statut post-délivrance cohérent avec les quantités**
    - **Validates: Requirements 6.2, 6.3**
    - `fc.property(fc.array(fc.record({ quantity, quantityDelivered }), { minLength: 1 }), ...)` — vérifier `computeStatus(meds)` retourne `FULLY_USED` ssi tous `quantityDelivered >= quantity`

- [x] 4. Checkpoint — Tests backend
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. DelivranceController et intégration PharmacieModule
  - [x] 5.1 Créer `backend/src/modules/pharmacie/delivrance.controller.ts`
    - Route de base : `/pharmacie`
    - `POST /scan-qr-ord` → `DelivranceService.scanQrOrd()`, guards `JwtAuthGuard` + `RolesGuard(['PHARMACIEN'])`
    - `POST /scan-med-cip` → `DelivranceService.scanMedCip()`, mêmes guards
    - `POST /confirmer-delivrance` → `DelivranceService.confirmerDelivrance()`, mêmes guards
    - Extraire `pharmacienId` via `@CurrentUser()` decorator existant
    - _Requirements: 1.1, 3.1, 6.1_
  - [x] 5.2 Mettre à jour `backend/src/modules/pharmacie/pharmacie.module.ts`
    - Importer : `TypeOrmModule.forFeature([Prescription, DossierHistorique])`, `QrCodesModule`, `DossierMedicalModule`
    - Déclarer controllers : `DelivranceController`
    - Déclarer providers : `DelivranceService`, `TicketPdfService`
    - _Requirements: 1.1, 5.1, 6.4, 7.1_
  - [ ]* 5.3 Écrire les tests unitaires pour `DelivranceController`
    - Tester que les guards sont appliqués
    - Tester la délégation correcte vers `DelivranceService`
    - _Requirements: 1.1, 3.1, 6.1_

- [x] 6. Frontend — DelivranceWorkflowComponent
  - [x] 6.1 Créer `frontend/src/app/modules/pharmacie/pages/delivrance/delivrance-workflow.component.ts`
    - Composant standalone Angular 19 avec `signal<Step>('scan-qr')` pour l'étape courante
    - État : `prescription`, `boitesScannees: Map<string, number>`, `financier`, `ticketUrl`, `error`
    - Étape 1 (`scan-qr`) : champ de saisie QR-ORD + bouton → `POST /api/v1/pharmacie/scan-qr-ord`
    - Étape 2 (`verification`) : affichage des détails ordonnance (patient, médecin, dates, médicaments), indicateur visuel vert si valide
    - Étape 3 (`scan-boites`) : pour chaque médicament, champ de saisie CIP manuel + compteur boîtes scannées/prescrites → `POST /api/v1/pharmacie/scan-med-cip`
    - Étape 4 (`recapitulatif`) : tableau financier (montant total, part CNAM, part patient par ligne + totaux)
    - Étape 5 (`confirmation`) : bouton confirmer → `POST /api/v1/pharmacie/confirmer-delivrance`, affichage message succès + bouton téléchargement ticket PDF
    - Gestion d'erreur par étape : afficher le message sans recommencer depuis le début
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 6.2 Mettre à jour `frontend/src/app/modules/pharmacie/pharmacie.routes.ts`
    - Ajouter la route `delivrance` → `DelivranceWorkflowComponent` (lazy-loaded)
    - _Requirements: 8.5_

- [x] 7. Checkpoint final — Intégration complète
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Chaque tâche référence les requirements pour la traçabilité
- Les tests property-based utilisent **fast-check** (minimum 100 itérations par propriété)
- Chaque test property-based doit inclure le commentaire : `// Feature: pharmacie-delivrance-qr, Property {N}: {texte}`
- La transaction atomique (tâche 3.9) utilise `DataSource.transaction()` de TypeORM — ne pas utiliser `DossierHistoriqueService.createHistorique()` directement (il ne supporte pas les entity managers transactionnels) ; créer l'entrée via `entityManager.save(DossierHistorique, ...)`
- Le répertoire `uploads/tickets/` doit être créé si absent (`fs.mkdirSync(..., { recursive: true })`)
