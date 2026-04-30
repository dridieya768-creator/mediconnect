# Document de Requirements — Dossier Médical

## Introduction

Le module **Dossier Médical** enrichit la plateforme MediConnect avec deux fonctionnalités :

1. Un **historique versionné** de toutes les modifications apportées au dossier patient, capturé automatiquement via un intercepteur NestJS sur le endpoint PATCH existant.
2. Un système d'**accès partagé multi-médecins** avec permissions fines (LECTURE, LECTURE_ECRITURE, ACCES_COMPLET), géré via un nouveau contrôleur dédié.

Le module s'appuie sur les entités existantes `Patient`, `User` et `Appointment` sans les modifier structurellement. Deux nouvelles entités sont introduites : `DossierHistorique` et `DossierAccesMedecin`.

---

## Glossaire

- **DossierMedical_System** : L'ensemble du module backend NestJS gérant l'historique et les accès au dossier médical.
- **HistoriqueInterceptor** : L'intercepteur NestJS appliqué sur le PATCH `/api/v1/patients/:id` qui capture les snapshots avant/après modification.
- **DossierHistoriqueService** : Le service responsable du calcul du diff et de la persistance des entrées d'historique.
- **DossierAccesService** : Le service responsable de la gestion des permissions d'accès médecin au dossier patient.
- **DossierMedicalService** : Le service orchestrant la lecture du dossier complet selon le niveau d'accès du demandeur.
- **DossierMedicalController** : Le contrôleur NestJS exposant les routes `/dossier-medical`.
- **Patient_Proprietaire** : L'utilisateur authentifié dont le `userId` correspond au `patient.userId`.
- **Medecin_Autorise** : Un médecin possédant une entrée `DossierAccesMedecin` active et non expirée pour le patient concerné.
- **NiveauAcces** : Enum à trois valeurs : `LECTURE` (1), `LECTURE_ECRITURE` (2), `ACCES_COMPLET` (3).
- **Diff** : Objet JSON contenant uniquement les champs modifiés, avec les valeurs `avant` et `apres`.
- **Snapshot** : Copie complète de l'état de l'entité `Patient` à un instant donné.
- **CHAMPS_SURVEILLES** : Liste fixe des champs du dossier patient tracés pour l'historique : `allergies`, `maladiesChroniques`, `medicamentsActuels`, `groupeSanguin`, `dateNaissance`, `sexe`, `ville`, `telephone`, `nss`, `nom`, `prenom`.

---

## Requirements

### Requirement 1 : Capture automatique de l'historique des modifications

**User Story :** En tant que patient ou médecin autorisé, je veux que toute modification du dossier médical soit automatiquement enregistrée, afin de disposer d'une traçabilité complète des changements.

#### Critères d'acceptation

1. WHEN une requête `PATCH /api/v1/patients/:id` est reçue, THE HistoriqueInterceptor SHALL capturer un snapshot complet de l'entité `Patient` avant l'exécution du handler.
2. WHEN le handler `PATCH /api/v1/patients/:id` retourne une réponse avec `success: true`, THE HistoriqueInterceptor SHALL capturer un snapshot complet de l'entité `Patient` après la modification.
3. WHEN les snapshots avant et après diffèrent sur au moins un champ de `CHAMPS_SURVEILLES`, THE DossierHistoriqueService SHALL persister une entrée dans la table `dossier_historique` contenant le `patientId`, le `modifieParId`, le `roleAuteur`, le `champsModifies` (diff), et le `snapshotAvant`.
4. WHEN les snapshots avant et après sont identiques sur tous les champs de `CHAMPS_SURVEILLES`, THE HistoriqueInterceptor SHALL ne pas créer d'entrée dans `dossier_historique`.
5. THE DossierHistoriqueService SHALL calculer le diff en comparant uniquement les champs listés dans `CHAMPS_SURVEILLES`.
6. WHEN le diff est calculé, THE DossierHistoriqueService SHALL inclure dans le diff uniquement les champs dont la valeur sérialisée JSON a changé.
7. THE HistoriqueInterceptor SHALL ne pas modifier la réponse retournée au frontend par le `PatientsController` existant.

---

### Requirement 2 : Consultation de l'historique des modifications

**User Story :** En tant que patient propriétaire ou médecin avec accès complet, je veux consulter l'historique des modifications de mon dossier, afin de suivre l'évolution de mes informations médicales.

#### Critères d'acceptation

1. WHEN une requête `GET /dossier-medical/:patientId/historique` est reçue d'un `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner la liste paginée des entrées `DossierHistorique` pour ce patient.
2. WHEN une requête `GET /dossier-medical/:patientId/historique` est reçue d'un `Medecin_Autorise` avec `NiveauAcces` `ACCES_COMPLET`, THE DossierMedicalController SHALL retourner la liste paginée des entrées `DossierHistorique` pour ce patient.
3. WHEN une requête `GET /dossier-medical/:patientId/historique` est reçue d'un médecin avec `NiveauAcces` `LECTURE` ou `LECTURE_ECRITURE`, THE DossierMedicalController SHALL retourner une erreur HTTP 403.
4. THE DossierHistoriqueService SHALL retourner les entrées d'historique triées par `createdAt` décroissant.
5. WHEN le paramètre `page` est fourni, THE DossierHistoriqueService SHALL retourner la page correspondante avec au maximum `limit` entrées (défaut : 20, maximum : 100).
6. WHEN le paramètre `champ` est fourni, THE DossierHistoriqueService SHALL filtrer les entrées dont `champsModifies` contient la clé correspondante.
7. WHEN le paramètre `modifieParId` est fourni, THE DossierHistoriqueService SHALL filtrer les entrées dont le `modifieParId` correspond à l'UUID fourni.
8. THE DossierMedicalController SHALL retourner dans la réponse le `total` d'entrées correspondant aux filtres appliqués ainsi que la `page` courante.

---

### Requirement 3 : Consultation du dossier médical complet

**User Story :** En tant que patient ou médecin autorisé, je veux consulter le dossier médical complet d'un patient, afin d'accéder aux informations nécessaires à la prise en charge.

#### Critères d'acceptation

1. WHEN une requête `GET /dossier-medical/:patientId` est reçue d'un `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner le dossier complet du patient.
2. WHEN une requête `GET /dossier-medical/:patientId` est reçue d'un `Medecin_Autorise` avec un `NiveauAcces` actif et non expiré, THE DossierMedicalController SHALL retourner le dossier complet du patient.
3. WHEN une requête `GET /dossier-medical/:patientId` est reçue d'un utilisateur sans accès, THE DossierMedicalController SHALL retourner une erreur HTTP 403 avec le message `Accès non autorisé`.
4. WHEN le `patientId` fourni ne correspond à aucun patient en base, THE DossierMedicalController SHALL retourner une erreur HTTP 404 avec le message `Patient introuvable`.
5. WHEN l'utilisateur authentifié a le rôle `ADMIN_SYSTEM`, THE DossierMedicalService SHALL autoriser l'accès en lecture au dossier sans vérification d'entrée `DossierAccesMedecin`.

---

### Requirement 4 : Accord d'accès médecin au dossier

**User Story :** En tant que patient, je veux accorder à un médecin un accès à mon dossier médical avec un niveau de permission défini, afin de contrôler qui peut consulter ou modifier mes informations.

#### Critères d'acceptation

1. WHEN une requête `POST /dossier-medical/:patientId/acces` est reçue d'un `Patient_Proprietaire` avec un `medecinId` et un `niveauAcces` valides, THE DossierAccesService SHALL créer une entrée `DossierAccesMedecin` avec `actif = true`.
2. WHEN une requête `POST /dossier-medical/:patientId/acces` est reçue pour un couple `(patientId, medecinId)` déjà existant en base, THE DossierAccesService SHALL retourner une erreur HTTP 409 avec le message `Un accès existe déjà pour ce médecin`.
3. WHEN le champ `dateExpiration` est fourni dans le DTO, THE DossierAccesService SHALL persister la date d'expiration dans l'entrée `DossierAccesMedecin`.
4. WHEN une requête `POST /dossier-medical/:patientId/acces` est reçue d'un utilisateur qui n'est pas le `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner une erreur HTTP 403.
5. THE DossierAccesService SHALL enregistrer dans `accordeParId` l'identifiant de l'utilisateur ayant accordé l'accès.

---

### Requirement 5 : Modification d'un accès médecin existant

**User Story :** En tant que patient, je veux modifier le niveau d'accès ou la date d'expiration d'un accès médecin existant, afin d'ajuster les permissions accordées.

#### Critères d'acceptation

1. WHEN une requête `PATCH /dossier-medical/:patientId/acces/:accesId` est reçue d'un `Patient_Proprietaire` avec des champs valides, THE DossierAccesService SHALL mettre à jour les champs fournis de l'entrée `DossierAccesMedecin` correspondante.
2. WHEN le champ `niveauAcces` est fourni dans le DTO de mise à jour, THE DossierAccesService SHALL remplacer le niveau d'accès existant par la nouvelle valeur.
3. WHEN le champ `actif` est fourni avec la valeur `false`, THE DossierAccesService SHALL désactiver l'accès sans supprimer l'entrée en base.
4. WHEN l'`accesId` fourni ne correspond à aucune entrée pour ce `patientId`, THE DossierAccesService SHALL retourner une erreur HTTP 404.
5. WHEN une requête `PATCH /dossier-medical/:patientId/acces/:accesId` est reçue d'un utilisateur qui n'est pas le `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner une erreur HTTP 403.

---

### Requirement 6 : Révocation d'un accès médecin

**User Story :** En tant que patient, je veux révoquer l'accès d'un médecin à mon dossier, afin de reprendre le contrôle de mes informations médicales.

#### Critères d'acceptation

1. WHEN une requête `DELETE /dossier-medical/:patientId/acces/:accesId` est reçue d'un `Patient_Proprietaire`, THE DossierAccesService SHALL mettre `actif = false` sur l'entrée `DossierAccesMedecin` correspondante (soft delete).
2. WHEN un accès est révoqué, THE DossierAccesService SHALL conserver l'entrée en base avec `actif = false` pour des raisons d'audit.
3. WHEN une requête `DELETE /dossier-medical/:patientId/acces/:accesId` est reçue d'un utilisateur qui n'est pas le `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner une erreur HTTP 403.
4. WHEN l'`accesId` fourni ne correspond à aucune entrée pour ce `patientId`, THE DossierAccesService SHALL retourner une erreur HTTP 404.

---

### Requirement 7 : Liste des accès médecins d'un patient

**User Story :** En tant que patient, je veux consulter la liste des médecins ayant accès à mon dossier, afin de gérer mes autorisations.

#### Critères d'acceptation

1. WHEN une requête `GET /dossier-medical/:patientId/acces` est reçue d'un `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner la liste de toutes les entrées `DossierAccesMedecin` pour ce patient, actives et inactives.
2. WHEN une requête `GET /dossier-medical/:patientId/acces` est reçue d'un utilisateur qui n'est pas le `Patient_Proprietaire`, THE DossierMedicalController SHALL retourner une erreur HTTP 403.

---

### Requirement 8 : Vérification et hiérarchie des niveaux d'accès

**User Story :** En tant que système, je veux appliquer une hiérarchie stricte entre les niveaux d'accès, afin de garantir que les permissions sont correctement respectées.

#### Critères d'acceptation

1. THE DossierAccesService SHALL considérer qu'un `NiveauAcces` `ACCES_COMPLET` satisfait toute opération requérant `LECTURE_ECRITURE` ou `LECTURE`.
2. THE DossierAccesService SHALL considérer qu'un `NiveauAcces` `LECTURE_ECRITURE` satisfait toute opération requérant `LECTURE`, mais pas `ACCES_COMPLET`.
3. WHEN un `Medecin_Autorise` tente une opération requérant un niveau supérieur à son `NiveauAcces`, THE DossierAccesService SHALL lever une erreur HTTP 403 avec le message `Niveau d'accès insuffisant`.
4. WHEN un accès `DossierAccesMedecin` a une `dateExpiration` antérieure à la date courante, THE DossierAccesService SHALL lever une erreur HTTP 403 avec le message `Accès expiré`, même si `actif = true`.
5. WHEN un accès `DossierAccesMedecin` a `actif = false`, THE DossierAccesService SHALL lever une erreur HTTP 403 avec le message `Accès non autorisé`.

---

### Requirement 9 : Modification du dossier par un médecin autorisé

**User Story :** En tant que médecin autorisé, je veux modifier le dossier médical d'un patient, afin de mettre à jour ses informations lors d'une consultation.

#### Critères d'acceptation

1. WHEN une requête `PATCH /dossier-medical/:patientId` est reçue d'un `Medecin_Autorise` avec `NiveauAcces` `LECTURE_ECRITURE` ou `ACCES_COMPLET`, THE DossierMedicalService SHALL mettre à jour les champs fournis de l'entité `Patient`.
2. WHEN une requête `PATCH /dossier-medical/:patientId` est reçue d'un `Medecin_Autorise` avec `NiveauAcces` `LECTURE`, THE DossierMedicalController SHALL retourner une erreur HTTP 403 avec le message `Niveau d'accès insuffisant`.
3. WHEN une requête `PATCH /dossier-medical/:patientId` est reçue d'un utilisateur sans accès, THE DossierMedicalController SHALL retourner une erreur HTTP 403 avec le message `Accès non autorisé`.
4. WHEN la modification du dossier par un médecin est effectuée via `PATCH /dossier-medical/:patientId`, THE DossierHistoriqueService SHALL créer une entrée d'historique si au moins un champ de `CHAMPS_SURVEILLES` a été modifié.

---

### Requirement 10 : Sécurité et protection des données

**User Story :** En tant qu'administrateur système, je veux que toutes les routes du module soient protégées et que les données sensibles ne soient pas exposées, afin de garantir la confidentialité des dossiers médicaux.

#### Critères d'acceptation

1. THE DossierMedicalController SHALL appliquer le guard `JwtAuthGuard` sur toutes ses routes.
2. THE DossierHistoriqueService SHALL exclure les champs `password`, `mfaSecret` et `refreshToken` des snapshots persistés dans `dossier_historique`.
3. THE DossierMedical_System SHALL ne pas exposer de route de suppression des entrées `dossier_historique` (historique en append-only).
4. WHEN une valeur d'UUID invalide est fournie dans les paramètres de route ou le body, THE DossierMedicalController SHALL retourner une erreur HTTP 400 via la validation `class-validator`.
