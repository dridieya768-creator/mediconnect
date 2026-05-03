# Plan d'implémentation : Gestion des Profils Familiaux (famille-profils)

## Vue d'ensemble

Implémentation du module de gestion des profils familiaux : migration SQL, module NestJS complet (entity, DTOs, service, contrôleur), modification du module appointments, puis composants Angular (modèle, service, page, routing, navbar, formulaire de RDV).

## Tâches

- [x] 1. Migration SQL — table `family_members` et modification `appointments`
  - Créer le fichier `backend/migrations/add-family-members.sql`
  - Déclarer le type ENUM `relation_type` ('ENFANT', 'CONJOINT', 'PARENT', 'AUTRE')
  - Créer la table `family_members` avec toutes ses colonnes (id UUID, patient_id FK, prenom, nom, date_naissance, relation, sexe, nss, allergies JSONB, groupe_sanguin, created_at, updated_at, deleted_at)
  - Créer l'index partiel `idx_family_members_patient_id` sur `patient_id WHERE deleted_at IS NULL`
  - Ajouter les colonnes `beneficiary_id` (UUID FK nullable → family_members), `beneficiary_nom`, `beneficiary_prenom` sur la table `appointments`
  - _Requirements: 1.1, 2.1_

- [x] 2. Entity TypeORM `FamilyMember` et enum `Relation`
  - Créer `backend/src/modules/family-members/entities/family-member.entity.ts`
  - Déclarer l'enum `Relation` (ENFANT, CONJOINT, PARENT, AUTRE)
  - Implémenter l'entity avec tous les décorateurs TypeORM (@Entity, @PrimaryGeneratedColumn, @Column, @ManyToOne, @JoinColumn, @CreateDateColumn, @UpdateDateColumn, @DeleteDateColumn, @Index)
  - _Requirements: 1.1, 1.2_

  - [ ]* 2.1 Écrire le test de propriété — round-trip création (Property 1)
    - **Property 1 : Round-trip création d'un membre familial**
    - **Validates: Requirements 1.2**

- [x] 3. DTOs `CreateFamilyMemberDto` et `UpdateFamilyMemberDto`
  - Créer `backend/src/modules/family-members/dto/create-family-member.dto.ts`
  - Implémenter `CreateFamilyMemberDto` avec les décorateurs class-validator (@IsString, @MaxLength, @IsDateString, @IsEnum, @IsIn, @IsOptional, @IsArray)
  - Créer `backend/src/modules/family-members/dto/update-family-member.dto.ts` via `PartialType(CreateFamilyMemberDto)`
  - _Requirements: 1.2, 1.3, 1.4_

  - [ ]* 3.1 Écrire le test de propriété — rejet des DTOs invalides (Property 2)
    - **Property 2 : Rejet des DTOs invalides**
    - **Validates: Requirements 1.3**

- [x] 4. `FamilyMembersService`
  - Créer `backend/src/modules/family-members/family-members.service.ts`
  - Implémenter `resolvePatientId(userId)` : requête sur `patients` par `userId`, lève 404 si introuvable
  - Implémenter `assertOwnership(id, patientId)` : charge le membre, lève 404 si inexistant, 403 si patientId ne correspond pas
  - Implémenter `findAllByPatient(patientId)` : `find({ where: { patientId }, withDeleted: false })`
  - Implémenter `create(patientId, dto)` : crée et sauvegarde l'entité
  - Implémenter `update(id, patientId, dto)` : appelle `assertOwnership` puis `save` avec les champs du DTO
  - Implémenter `remove(id, patientId)` : appelle `assertOwnership` puis `softDelete`
  - _Requirements: 1.2, 1.4, 1.5, 1.6_

  - [ ]* 4.1 Écrire le test de propriété — mise à jour partielle (Property 3)
    - **Property 3 : Round-trip mise à jour partielle**
    - **Validates: Requirements 1.4**

  - [ ]* 4.2 Écrire le test de propriété — soft-delete exclut des listings (Property 4)
    - **Property 4 : Soft-delete exclut des listings**
    - **Validates: Requirements 1.5, 3.2**

  - [ ]* 4.3 Écrire le test de propriété — isolation par patient (Property 5)
    - **Property 5 : Isolation par patient (contrôle d'accès)**
    - **Validates: Requirements 1.6**

  - [ ]* 4.4 Écrire le test de propriété — listing ne retourne que les membres actifs (Property 8)
    - **Property 8 : Listing ne retourne que les membres actifs**
    - **Validates: Requirements 3.2**

- [x] 5. `FamilyMembersController`
  - Créer `backend/src/modules/family-members/family-members.controller.ts`
  - Appliquer `@ApiTags`, `@ApiBearerAuth`, `@UseGuards(JwtAuthGuard)`, `@Controller('family-members')`
  - Implémenter `GET /` → `findAll` (résout patientId depuis `req.user.id`)
  - Implémenter `POST /` → `create`
  - Implémenter `PATCH /:id` → `update` (avec `ParseUUIDPipe`)
  - Implémenter `DELETE /:id` → `remove` (avec `ParseUUIDPipe`)
  - _Requirements: 1.2, 1.4, 1.5, 1.6_

- [x] 6. `FamilyMembersModule` et enregistrement dans `AppModule`
  - Créer `backend/src/modules/family-members/family-members.module.ts`
  - Déclarer `TypeOrmModule.forFeature([FamilyMember])`, `FamilyMembersService`, `FamilyMembersController`
  - Importer `PatientsModule` (ou `TypeOrmModule.forFeature([Patient])`) pour `resolvePatientId`
  - Ajouter `FamilyMembersModule` dans les imports de `backend/src/app.module.ts`
  - _Requirements: 1.1_

- [ ] 7. Checkpoint — vérifier la compilation backend
  - S'assurer que le backend compile sans erreur TypeScript
  - Vérifier que tous les imports sont résolus
  - Demander à l'utilisateur si des questions se posent.

- [ ] 8. Modification entity `Appointment` — champs bénéficiaire
  - Modifier `backend/src/modules/appointments/entities/appointment.entity.ts`
  - Ajouter `beneficiaryId: string | null` avec `@Column({ name: 'beneficiary_id', type: 'uuid', nullable: true })`
  - Ajouter la relation `@ManyToOne(() => FamilyMember, { nullable: true, eager: false })` avec `@JoinColumn`
  - Ajouter `beneficiaryNom: string | null` et `beneficiaryPrenom: string | null` avec `@Column` nullable
  - _Requirements: 2.1, 3.1_

- [x] 9. Modification `CreateAppointmentDto` et `AppointmentsService` — validation `beneficiaryId`
  - Modifier `backend/src/modules/appointments/dto/create-appointment.dto.ts` : ajouter `beneficiaryId?`, `beneficiaryNom?`, `beneficiaryPrenom?` avec décorateurs `@IsOptional`, `@IsUUID`, `@IsString`, `@MaxLength`
  - Modifier `backend/src/modules/appointments/appointments.service.ts` : dans la méthode `create`, si `beneficiaryId` est fourni, vérifier qu'il appartient au patient connecté (requête sur `family_members`), copier `prenom` et `nom` dans `beneficiaryNom` / `beneficiaryPrenom`
  - _Requirements: 2.2, 2.3, 2.4_

  - [ ]* 9.1 Écrire le test de propriété — round-trip bénéficiaire sur un RDV (Property 6)
    - **Property 6 : Round-trip bénéficiaire sur un RDV**
    - **Validates: Requirements 2.3, 2.4**

  - [ ]* 9.2 Écrire le test de propriété — dénormalisation préserve les données après suppression (Property 7)
    - **Property 7 : Dénormalisation préserve les données après suppression**
    - **Validates: Requirements 3.1**

- [x] 10. Modèle TypeScript Angular `FamilyMember`
  - Créer `frontend/src/app/core/models/family-member.model.ts`
  - Déclarer le type `Relation = 'ENFANT' | 'CONJOINT' | 'PARENT' | 'AUTRE'`
  - Déclarer l'interface `FamilyMember` avec tous les champs (id, patientId, prenom, nom, dateNaissance, relation, sexe, nss?, allergies?, groupeSanguin?, createdAt, updatedAt)
  - Déclarer l'interface `CreateFamilyMemberPayload`
  - _Requirements: 1.2_

- [x] 11. Service Angular `FamilyMembersService`
  - Créer `frontend/src/app/core/services/family-members.service.ts`
  - Implémenter `getAll()` → `GET /api/v1/family-members`
  - Implémenter `create(payload)` → `POST /api/v1/family-members`
  - Implémenter `update(id, payload)` → `PATCH /api/v1/family-members/:id`
  - Implémenter `remove(id)` → `DELETE /api/v1/family-members/:id`
  - _Requirements: 1.2, 1.4, 1.5_

- [x] 12. Page `FamilleComponent` (`/patient/famille`) avec liste et modal
  - Créer `frontend/src/app/modules/patient/pages/famille/famille.component.ts` (standalone, Angular 17 signals)
  - Implémenter les signals : `members`, `showModal`, `editingMember`, `isLoading`
  - Implémenter `load()`, `openAdd()`, `openEdit(m)`, `onSaved()`, `onDelete(id)`
  - Créer le template `famille.component.html` : liste des membres avec boutons édition/suppression, bouton "+ Ajouter", modal inline avec formulaire réactif (prenom, nom, dateNaissance, relation, sexe, nss?, groupeSanguin?)
  - Créer `famille.component.scss` avec les styles de la page
  - _Requirements: 1.2, 1.4, 1.5, 4.1, 4.2_

- [x] 13. Ajout de la route `/patient/famille` dans `patient.routes.ts`
  - Modifier `frontend/src/app/modules/patient/patient.routes.ts`
  - Ajouter la route `{ path: 'famille', loadComponent: () => import('./pages/famille/famille.component').then(m => m.FamilleComponent) }`
  - _Requirements: 4.1_

- [x] 14. Ajout du lien "Ma famille" dans la navbar patient
  - Modifier `frontend/src/app/modules/patient/layout/patient-layout.component.ts`
  - Ajouter un lien de navigation vers `/patient/famille` dans le menu latéral ou la barre de navigation
  - _Requirements: 4.1_

- [x] 15. Modification `AppointmentFormComponent` — sélecteur de bénéficiaire
  - Modifier `frontend/src/app/modules/patient/pages/search/appointment-form/appointment-form.component.ts`
  - Injecter `FamilyMembersService` et ajouter le signal `familyMembers`
  - Charger les membres familiaux dans `ngOnInit`
  - Ajouter le champ `beneficiaryId: [null]` dans le `FormGroup`
  - Ajouter dans le template le `<select>` "Pour qui est ce rendez-vous ?" avec l'option "Moi-même" et les membres familiaux
  - Lors de la soumission, inclure `beneficiaryId`, `beneficiaryNom` et `beneficiaryPrenom` dans le payload envoyé à `AppointmentsService`
  - _Requirements: 2.2, 2.3_

- [ ] 16. Checkpoint final — vérifier compilation et cohérence
  - S'assurer que le frontend compile sans erreur TypeScript
  - Vérifier que tous les imports Angular sont résolus
  - S'assurer que les tests passent, demander à l'utilisateur si des questions se posent.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Les tests de propriétés utilisent **fast-check** (minimum 100 itérations par propriété)
- Le `patientId` est toujours résolu côté serveur depuis `req.user.id`, jamais depuis le body
- La dénormalisation (`beneficiaryNom`, `beneficiaryPrenom`) est intentionnelle pour préserver l'historique des RDV
- Les checkpoints permettent de valider la compilation incrémentalement avant de passer au frontend
