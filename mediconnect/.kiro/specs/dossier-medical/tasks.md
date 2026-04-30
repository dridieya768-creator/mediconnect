# Plan d'implémentation : Dossier Médical

## Vue d'ensemble

Implémentation du module **Dossier Médical** en NestJS + TypeORM + PostgreSQL : deux nouvelles entités (`DossierHistorique`, `DossierAccesMedecin`), trois services (`DossierHistoriqueService`, `DossierAccesService`, `DossierMedicalService`), un intercepteur (`DossierHistoriqueInterceptor`), un contrôleur (`DossierMedicalController`), et le câblage dans `AppModule`. Le frontend existant (`patient-dossier.component`) continue d'utiliser `PATCH /api/v1/patients/:id` sans modification.

---

## Tâches

- [x] 1. Créer les entités TypeORM et l'enum `NiveauAcces`
  - Créer `backend/src/modules/dossier-medical/entities/dossier-acces-medecin.entity.ts`
    - Déclarer l'enum `NiveauAcces { LECTURE, LECTURE_ECRITURE, ACCES_COMPLET }`
    - Déclarer l'entité `DossierAccesMedecin` avec `@Unique(['patientId', 'medecinId'])`, `@Index(['patientId'])`, `@Index(['medecinId'])`
    - Colonnes : `id` (uuid), `patientId`, `medecinId`, `niveauAcces` (enum, default LECTURE), `accordeParId`, `dateExpiration` (timestamptz nullable), `actif` (boolean, default true), `createdAt`, `updatedAt`
    - Relations `@ManyToOne` vers `Patient` et `User`
  - Créer `backend/src/modules/dossier-medical/entities/dossier-historique.entity.ts`
    - Déclarer l'entité `DossierHistorique` avec `@Index(['patientId', 'createdAt'])`
    - Colonnes : `id` (uuid), `patientId`, `modifieParId`, `roleAuteur` (varchar 50), `champsModifies` (jsonb), `snapshotAvant` (jsonb), `commentaire` (text nullable), `createdAt`
    - Relations `@ManyToOne` vers `Patient` et `User`
  - _Requirements: 1.3, 4.1, 5.1, 6.1, 8.4_

- [x] 2. Créer les DTOs de validation
  - [x] 2.1 Créer `backend/src/modules/dossier-medical/dto/create-acces.dto.ts`
    - `medecinId: string` avec `@IsUUID()`
    - `niveauAcces: NiveauAcces` avec `@IsEnum(NiveauAcces)`
    - `dateExpiration?: string` avec `@IsOptional() @IsDateString()`
    - _Requirements: 4.1, 4.3, 10.4_
  - [x] 2.2 Créer `backend/src/modules/dossier-medical/dto/update-acces.dto.ts`
    - Tous les champs optionnels : `niveauAcces?`, `dateExpiration?`, `actif?` avec `@IsOptional() @IsBoolean()`
    - _Requirements: 5.1, 5.2, 5.3, 10.4_
  - [x] 2.3 Créer `backend/src/modules/dossier-medical/dto/historique-query.dto.ts`
    - `page?: number` avec `@IsOptional() @Type(() => Number) @IsInt() @Min(1)`, défaut 1
    - `limit?: number` avec `@IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)`, défaut 20
    - `champ?: string` avec `@IsOptional() @IsString()`
    - `modifieParId?: string` avec `@IsOptional() @IsUUID()`
    - _Requirements: 2.5, 2.6, 2.7, 2.8_
  - [x] 2.4 Créer `backend/src/modules/dossier-medical/dto/update-dossier.dto.ts`
    - Tous les champs de `CHAMPS_SURVEILLES` optionnels : `allergies?`, `maladiesChroniques?`, `medicamentsActuels?`, `groupeSanguin?`, `dateNaissance?`, `sexe?`, `ville?`, `telephone?`, `nss?`, `nom?`, `prenom?`
    - _Requirements: 9.1_

- [x] 3. Implémenter `DossierHistoriqueService`
  - [x] 3.1 Créer `backend/src/modules/dossier-medical/dossier-historique.service.ts`
    - Déclarer `CHAMPS_SURVEILLES = ['allergies', 'maladiesChroniques', 'medicamentsActuels', 'groupeSanguin', 'dateNaissance', 'sexe', 'ville', 'telephone', 'nss', 'nom', 'prenom']`
    - Implémenter `computeDiff(avant, apres)` : itérer sur `CHAMPS_SURVEILLES`, comparer via `JSON.stringify`, retourner `{ champ: { avant, apres } }` uniquement pour les champs modifiés
    - Implémenter `createHistorique(patientId, modifieParId, roleAuteur, snapshotAvant, snapshotApres, commentaire?)` : supprimer `password`, `mfaSecret`, `refreshToken` des snapshots avant persistance, appeler `computeDiff`, ne persister que si diff non vide
    - Implémenter `getHistorique(patientId, query)` : requête TypeORM paginée triée par `createdAt DESC`, filtre `champ` via `jsonb ? :champ`, filtre `modifieParId` si fourni, retourner `{ data, total, page }`
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 2.4, 2.5, 2.6, 2.7, 2.8, 10.2_
  - [ ]* 3.2 Écrire le test de propriété — Property 1 : Diff vide pour snapshots identiques
    - Créer `backend/src/modules/dossier-medical/__tests__/dossier-historique.service.spec.ts`
    - Utiliser `fast-check` : générer des snapshots aléatoires, copier `avant` dans `apres`, vérifier que `computeDiff` retourne `{}`
    - **Property 1 : Diff vide pour snapshots identiques**
    - **Validates: Requirements 1.4**
  - [ ]* 3.3 Écrire le test de propriété — Property 2 : Diff contient uniquement les champs modifiés de CHAMPS_SURVEILLES
    - Dans le même fichier de test
    - Générer des paires `(avant, apres)` avec modifications aléatoires sur des champs hors `CHAMPS_SURVEILLES` : vérifier que le diff est vide
    - Générer des paires avec modifications sur des champs de `CHAMPS_SURVEILLES` : vérifier que seuls ces champs apparaissent dans le diff
    - **Property 2 : Diff contient uniquement les champs modifiés de CHAMPS_SURVEILLES**
    - **Validates: Requirements 1.5, 1.6**
  - [ ]* 3.4 Écrire le test de propriété — Property 3 : Entrée créée si et seulement si diff non vide
    - Mocker `historiqueRepo.save`, vérifier que `save` est appelé ssi `computeDiff` retourne un objet non vide
    - **Property 3 : Entrée d'historique créée si et seulement si le diff est non vide**
    - **Validates: Requirements 1.3, 1.4**
  - [ ]* 3.5 Écrire le test de propriété — Property 5 : Snapshots sans données sensibles
    - Générer des snapshots contenant `password`, `mfaSecret`, `refreshToken`, vérifier que ces clés sont absentes du `snapshotAvant` persisté
    - **Property 5 : Snapshots sans données sensibles**
    - **Validates: Requirements 10.2**

- [x] 4. Implémenter `DossierAccesService`
  - [x] 4.1 Créer `backend/src/modules/dossier-medical/dossier-acces.service.ts`
    - Implémenter `accorderAcces(patientId, accordeParId, dto)` : vérifier unicité via `findOne({ where: { patientId, medecinId } })`, lever `ConflictException('Un accès existe déjà pour ce médecin')` si doublon, créer avec `actif = true` et `accordeParId`
    - Implémenter `modifierAcces(accesId, patientId, dto)` : `findOne({ where: { id: accesId, patientId } })`, lever `NotFoundException` si absent, appliquer `Object.assign` avec les champs fournis, sauvegarder
    - Implémenter `revoquerAcces(accesId, patientId)` : trouver l'entrée (404 si absente), mettre `actif = false`, sauvegarder (soft delete)
    - Implémenter `listerAcces(patientId)` : `find({ where: { patientId } })` sans filtre sur `actif`
    - Implémenter `verifierAcces(patientId, medecinId, niveauRequis)` : trouver l'accès actif, vérifier expiration (`dateExpiration < new Date()` → 403 `Accès expiré`), vérifier `actif = false` → 403 `Accès non autorisé`, vérifier hiérarchie `{ LECTURE: 1, LECTURE_ECRITURE: 2, ACCES_COMPLET: 3 }` → 403 `Niveau d'accès insuffisant`
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.4, 7.1, 8.1, 8.2, 8.3, 8.4, 8.5_
  - [ ]* 4.2 Écrire le test de propriété — Property 6 : Hiérarchie transitive des niveaux d'accès
    - Créer `backend/src/modules/dossier-medical/__tests__/dossier-acces.service.spec.ts`
    - Utiliser `fast-check` avec `fc.constantFrom(...Object.values(NiveauAcces))` pour `n` et `r`
    - Vérifier que l'accès est autorisé ssi `hierarchie[n] >= hierarchie[r]`
    - **Property 6 : Hiérarchie transitive des niveaux d'accès**
    - **Validates: Requirements 8.1, 8.2, 8.3**
  - [ ]* 4.3 Écrire le test de propriété — Property 8 : Soft delete préserve l'entrée en base
    - Mocker `accesRepo`, vérifier qu'après `revoquerAcces` l'entrée existe toujours avec `actif = false`
    - **Property 8 : Soft delete préserve l'entrée en base**
    - **Validates: Requirements 5.3, 6.1, 6.2**
  - [ ]* 4.4 Écrire le test de propriété — Property 9 : Round-trip création d'accès
    - Générer des `CreateAccesDto` valides aléatoires, vérifier que l'entrée créée reflète exactement `medecinId`, `niveauAcces`, `dateExpiration`, `actif = true`, `accordeParId`
    - **Property 9 : Round-trip création d'accès**
    - **Validates: Requirements 4.1, 4.3, 4.5**

- [x] 5. Implémenter `DossierMedicalService`
  - [x] 5.1 Créer `backend/src/modules/dossier-medical/dossier-medical.service.ts`
    - Injecter `PatientRepository`, `DossierHistoriqueService`, `DossierAccesService`
    - Implémenter `getDossier(patientId, demandeurId, demandeurRole)` :
      - `findOne({ where: { id: patientId } })` → 404 `Patient introuvable` si absent
      - Si `patient.userId === demandeurId` ou `demandeurRole === 'ADMIN_SYSTEM'` → accès autorisé
      - Sinon appeler `verifierAcces(patientId, demandeurId, NiveauAcces.LECTURE)` → 403 si refusé
      - Retourner le patient complet
    - Implémenter `updateDossierParMedecin(patientId, medecinId, updateData)` :
      - Appeler `verifierAcces(patientId, medecinId, NiveauAcces.LECTURE_ECRITURE)`
      - Capturer `snapshotAvant`, appliquer `patientRepo.save({ ...patient, ...updateData })`
      - Appeler `createHistorique` si diff non vide
      - Retourner le patient mis à jour
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 9.1, 9.2, 9.3, 9.4_
  - [ ]* 5.2 Écrire le test de propriété — Property 7 : Contrôle d'accès — non-propriétaire rejeté
    - Créer `backend/src/modules/dossier-medical/__tests__/dossier-medical.service.spec.ts`
    - Générer des paires `(demandeurId, patientUserId)` distinctes sans entrée `DossierAccesMedecin`, vérifier que `getDossier` lève `ForbiddenException`
    - **Property 7 : Contrôle d'accès — non-propriétaire rejeté**
    - **Validates: Requirements 2.3, 3.3, 4.4, 5.5, 6.3, 7.2**

- [x] 6. Checkpoint — Vérifier que les services compilent et que les tests de propriétés passent
  - S'assurer que tous les tests passent, poser des questions à l'utilisateur si nécessaire.

- [x] 7. Implémenter `DossierHistoriqueInterceptor`
  - Créer `backend/src/modules/dossier-medical/interceptors/dossier-historique.interceptor.ts`
  - Implémenter `NestInterceptor` : injecter `DossierHistoriqueService` et `@InjectRepository(Patient) patientRepo`
  - Dans `intercept()` : extraire `patientId = request.params.id`, `userId = request.user?.sub ?? request.user?.id`, `role = request.user?.role`
  - Capturer `snapshotAvant = await patientRepo.findOne({ where: { id: patientId } })` avant `next.handle()`
  - Dans le `tap` RxJS : si `response?.success && snapshotAvant`, capturer `snapshotApres`, appeler `historiqueService.createHistorique(...)` si diff non vide
  - Ne pas modifier la réponse retournée (retourner l'observable sans transformation)
  - Appliquer `@UseInterceptors(DossierHistoriqueInterceptor)` sur la méthode `updateProfile` du `PatientsController` existant
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_
  - [ ]* 7.1 Écrire le test de propriété — Property 4 : Transparence de l'intercepteur sur la réponse
    - Créer `backend/src/modules/dossier-medical/__tests__/dossier-historique.interceptor.spec.ts`
    - Mocker `next.handle()` avec des réponses aléatoires, vérifier que la réponse observable émise est identique à celle du handler
    - **Property 4 : Transparence de l'intercepteur sur la réponse**
    - **Validates: Requirements 1.7**

- [x] 8. Implémenter `DossierMedicalController`
  - Créer `backend/src/modules/dossier-medical/dossier-medical.controller.ts`
  - Appliquer `@UseGuards(JwtAuthGuard)` et `@Controller('dossier-medical')` au niveau de la classe
  - Extraire `demandeurId` via `@Req() req` : `req.user?.sub ?? req.user?.id`
  - Implémenter les routes suivantes :
    - `GET /:patientId` → `dossierMedicalService.getDossier(patientId, demandeurId, role)`
    - `PATCH /:patientId` → vérifier `verifierAcces(LECTURE_ECRITURE)`, appeler `updateDossierParMedecin`; retourner 403 si `NiveauAcces.LECTURE`
    - `GET /:patientId/historique` → vérifier propriétaire ou `ACCES_COMPLET` (403 sinon), appeler `getHistorique(patientId, query)`
    - `GET /:patientId/acces` → vérifier propriétaire (403 sinon), appeler `listerAcces(patientId)`
    - `POST /:patientId/acces` → vérifier propriétaire (403 sinon), appeler `accorderAcces(patientId, demandeurId, dto)`
    - `PATCH /:patientId/acces/:accesId` → vérifier propriétaire (403 sinon), appeler `modifierAcces(accesId, patientId, dto)`
    - `DELETE /:patientId/acces/:accesId` → vérifier propriétaire (403 sinon), appeler `revoquerAcces(accesId, patientId)`
  - Valider les paramètres UUID via `ParseUUIDPipe` sur `patientId` et `accesId` (400 si invalide)
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.4, 5.5, 6.3, 7.1, 7.2, 9.1, 9.2, 9.3, 10.1, 10.3, 10.4_
  - [ ]* 8.1 Écrire le test de propriété — Property 10 : Résultats d'historique triés et bornés
    - Créer `backend/src/modules/dossier-medical/__tests__/dossier-medical.controller.spec.ts`
    - Générer des listes d'entrées d'historique aléatoires, vérifier tri `createdAt DESC`, `data.length <= limit`, présence de `total` et `page`
    - **Property 10 : Résultats d'historique triés et bornés**
    - **Validates: Requirements 2.4, 2.5, 2.8**
  - [ ]* 8.2 Écrire le test de propriété — Property 11 : Filtrage de l'historique par champ et par auteur
    - Générer des entrées avec `champsModifies` aléatoires, vérifier que le filtre `champ=X` ne retourne que des entrées ayant la clé `X`, et `modifieParId=Y` ne retourne que des entrées avec `modifieParId = Y`
    - **Property 11 : Filtrage de l'historique par champ et par auteur**
    - **Validates: Requirements 2.6, 2.7**

- [x] 9. Créer `DossierMedicalModule` et l'enregistrer dans `AppModule`
  - Créer `backend/src/modules/dossier-medical/dossier-medical.module.ts`
  - `TypeOrmModule.forFeature([DossierHistorique, DossierAccesMedecin, Patient])`
  - Déclarer dans `controllers` : `DossierMedicalController`
  - Déclarer dans `providers` : `DossierMedicalService`, `DossierHistoriqueService`, `DossierAccesService`, `DossierHistoriqueInterceptor`
  - Exporter `DossierHistoriqueService` et `DossierAccesService` (utilisés par l'intercepteur dans `PatientsModule`)
  - Ajouter `DossierMedicalModule` dans les imports de `backend/src/app.module.ts`
  - _Requirements: 10.1_

- [x] 10. Checkpoint final — S'assurer que tous les tests passent
  - Vérifier la compilation TypeScript sans erreurs (`tsc --noEmit`)
  - S'assurer que tous les tests de propriétés passent, poser des questions à l'utilisateur si nécessaire.

---

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Les tests de propriétés utilisent `fast-check` : installer si absent avec `npm install --save-dev fast-check` dans `backend/`
- L'intercepteur est appliqué sur `PatientsController.updateProfile()` existant via `@UseInterceptors(DossierHistoriqueInterceptor)`, sans modifier la logique du handler
- `synchronize: false` dans TypeORM : une migration SQL est nécessaire pour créer les tables `dossier_historique` et `dossier_acces_medecin` et l'enum PostgreSQL `niveau_acces_enum`
- La vérification de propriété (patient propriétaire) se fait en comparant `patient.userId === demandeurId` côté service, jamais côté client
- L'historique est en **append-only** : aucune route `DELETE /dossier-historique` ne doit être exposée (Requirement 10.3)
