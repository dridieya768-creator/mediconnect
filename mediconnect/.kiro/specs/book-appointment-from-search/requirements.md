# Document de Requirements

## Introduction

Cette fonctionnalité permet à un patient authentifié de prendre rendez-vous avec un médecin directement depuis la page "Trouver un Médecin". Depuis la liste des médecins, le patient clique sur "Prendre RDV", consulte un calendrier hebdomadaire avec les créneaux disponibles, sélectionne un créneau, renseigne les informations de consultation (type, durée, motif), puis confirme le rendez-vous. Le backend NestJS existant (modules `medecins`, `appointments`, disponibilités) est réutilisé.

---

## Glossaire

- **Patient** : Utilisateur authentifié avec le rôle `PATIENT` souhaitant prendre un rendez-vous.
- **Médecin** : Utilisateur avec un rôle médecin (`MEDECIN_GENERALISTE`, `MEDECIN_SPECIALISTE`, etc.) disposant d'un profil et de disponibilités configurées.
- **Créneau** : Plage horaire définie par une date, une heure de début et une durée, pouvant être disponible ou occupé.
- **Calendrier_Hebdomadaire** : Vue affichant les 7 jours à partir de la date courante avec les créneaux horaires du médecin.
- **Formulaire_Confirmation** : Section permettant au patient de saisir le type de consultation, la durée et le motif avant de confirmer.
- **Disponibilite** : Configuration du médecin définissant ses jours de travail (`workDays`), la durée par défaut des créneaux (`defaultDuration`) et l'acceptation de la téléconsultation (`acceptsTeleconsultation`).
- **Appointment_Service** : Service backend NestJS gérant la création et la gestion des rendez-vous (`POST /appointments`).
- **Medecins_Service** : Service backend NestJS exposant les disponibilités d'un médecin (`GET /medecins/:id/availability`).
- **Recap** : Résumé affiché avant confirmation, incluant le nom du médecin, la date, l'heure, le type et la durée.

---

## Requirements

### Requirement 1 : Accès au formulaire de prise de rendez-vous

**User Story :** En tant que patient, je veux pouvoir cliquer sur "Prendre RDV" depuis la liste des médecins, afin d'accéder directement au formulaire de prise de rendez-vous pour le médecin sélectionné.

#### Critères d'acceptation

1. THE Calendrier_Hebdomadaire SHALL afficher le nom, la spécialité et la photo du Médecin sélectionné en en-tête.
2. WHEN le Patient clique sur le bouton "Prendre RDV" d'une carte médecin, THE Système SHALL afficher le Calendrier_Hebdomadaire pour ce Médecin sans quitter la page "Trouver un Médecin".
3. IF le Patient n'est pas authentifié, THEN THE Système SHALL rediriger le Patient vers la page de connexion avant d'afficher le Calendrier_Hebdomadaire.
4. WHEN le Calendrier_Hebdomadaire s'ouvre, THE Système SHALL charger les disponibilités du Médecin via le Medecins_Service pour la semaine courante.

---

### Requirement 2 : Affichage du calendrier hebdomadaire et des créneaux

**User Story :** En tant que patient, je veux voir les créneaux disponibles du médecin sur une vue hebdomadaire, afin de choisir facilement un horaire qui me convient.

#### Critères d'acceptation

1. THE Calendrier_Hebdomadaire SHALL afficher 7 jours consécutifs à partir de la date du jour.
2. WHEN les disponibilités du Médecin sont chargées, THE Calendrier_Hebdomadaire SHALL générer les créneaux horaires selon les `workDays` et le `defaultDuration` configurés dans la Disponibilite du Médecin.
3. WHEN un Créneau correspond à un rendez-vous existant avec le statut `CONFIRMED` ou `REQUESTED`, THE Calendrier_Hebdomadaire SHALL afficher ce Créneau comme indisponible (grisé, non cliquable).
4. WHEN un Créneau est disponible, THE Calendrier_Hebdomadaire SHALL l'afficher comme sélectionnable.
5. THE Calendrier_Hebdomadaire SHALL permettre au Patient de naviguer vers la semaine suivante ou la semaine précédente, sans remonter avant la date du jour.
6. IF le Médecin n'a aucune Disponibilite configurée, THEN THE Calendrier_Hebdomadaire SHALL afficher un message indiquant qu'aucun créneau n'est disponible.

---

### Requirement 3 : Sélection d'un créneau

**User Story :** En tant que patient, je veux sélectionner un créneau disponible, afin de définir la date et l'heure de mon rendez-vous.

#### Critères d'acceptation

1. WHEN le Patient clique sur un Créneau disponible, THE Calendrier_Hebdomadaire SHALL mettre en surbrillance le Créneau sélectionné et afficher le Formulaire_Confirmation.
2. WHEN le Patient sélectionne un nouveau Créneau, THE Calendrier_Hebdomadaire SHALL désélectionner le Créneau précédent et mettre à jour le Formulaire_Confirmation avec le nouveau Créneau.
3. THE Système SHALL autoriser la sélection d'un seul Créneau à la fois.

---

### Requirement 4 : Saisie des informations de consultation

**User Story :** En tant que patient, je veux renseigner le type de consultation, la durée et le motif, afin de fournir au médecin les informations nécessaires à la préparation du rendez-vous.

#### Critères d'acceptation

1. THE Formulaire_Confirmation SHALL proposer un champ "Type de consultation" avec les options `Présentiel` (PHYSICAL) et `Téléconsultation` (TELECONSULTATION).
2. WHERE la Disponibilite du Médecin a `acceptsTeleconsultation` à `false`, THE Formulaire_Confirmation SHALL désactiver l'option `Téléconsultation`.
3. THE Formulaire_Confirmation SHALL proposer un champ "Durée" pré-rempli avec le `defaultDuration` du Médecin, avec les options 15, 30, 45 et 60 minutes.
4. THE Formulaire_Confirmation SHALL proposer un champ "Motif de consultation" de type zone de texte libre, optionnel, limité à 500 caractères.
5. THE Formulaire_Confirmation SHALL afficher un Recap contenant : le nom complet du Médecin, la date et l'heure du Créneau sélectionné, le type de consultation choisi et la durée choisie.
6. WHILE le Patient n'a pas sélectionné de Créneau, THE Formulaire_Confirmation SHALL désactiver le bouton "Confirmer le rendez-vous".

---

### Requirement 5 : Confirmation du rendez-vous

**User Story :** En tant que patient, je veux confirmer mon rendez-vous en un clic, afin que la demande soit envoyée au médecin et enregistrée dans le système.

#### Critères d'acceptation

1. WHEN le Patient clique sur "Confirmer le rendez-vous", THE Appointment_Service SHALL créer un rendez-vous avec le statut `REQUESTED` via `POST /appointments`.
2. WHEN le rendez-vous est créé avec succès, THE Système SHALL afficher un message de confirmation au Patient indiquant que la demande a été envoyée au Médecin.
3. WHEN le rendez-vous est créé avec succès, THE Système SHALL fermer le Calendrier_Hebdomadaire et le Formulaire_Confirmation.
4. IF le Créneau sélectionné est devenu indisponible entre la sélection et la confirmation, THEN THE Appointment_Service SHALL retourner une erreur et THE Système SHALL afficher un message d'erreur invitant le Patient à choisir un autre créneau.
5. IF une erreur réseau survient lors de la confirmation, THEN THE Système SHALL afficher un message d'erreur et conserver les données saisies dans le Formulaire_Confirmation.
6. WHILE la requête de confirmation est en cours, THE Système SHALL désactiver le bouton "Confirmer le rendez-vous" et afficher un indicateur de chargement.

---

### Requirement 6 : Exposition de l'endpoint de disponibilités par médecin

**User Story :** En tant que développeur frontend, je veux accéder aux disponibilités d'un médecin spécifique via son identifiant, afin d'afficher les créneaux corrects dans le Calendrier_Hebdomadaire.

#### Critères d'acceptation

1. THE Medecins_Service SHALL exposer un endpoint `GET /medecins/:id/availability` retournant les `workDays`, `defaultDuration`, `acceptsTeleconsultation` et `disponTeleconsult` du Médecin identifié par `:id`.
2. IF le Médecin identifié par `:id` n'existe pas, THEN THE Medecins_Service SHALL retourner une erreur HTTP 404.
3. THE Medecins_Service SHALL exposer un endpoint `GET /medecins/:id/slots` retournant les créneaux occupés (date et heure) du Médecin pour une plage de dates donnée en paramètre de requête (`startDate`, `endDate`).
4. WHEN les créneaux occupés sont calculés, THE Medecins_Service SHALL inclure tous les rendez-vous avec le statut `CONFIRMED` ou `REQUESTED` dans la plage de dates demandée.

---

### Requirement 7 : Propriétés de correction et de cohérence des données

**User Story :** En tant que développeur, je veux m'assurer que les données de disponibilité et de rendez-vous sont cohérentes, afin d'éviter les doubles réservations et les incohérences d'affichage.

#### Critères d'acceptation

1. FOR ALL créneaux retournés par `GET /medecins/:id/slots`, THE Appointment_Service SHALL rejeter toute tentative de création d'un rendez-vous sur un Créneau déjà occupé (propriété d'invariant : absence de chevauchement).
2. WHEN un rendez-vous est créé via `POST /appointments`, puis que les créneaux occupés sont récupérés via `GET /medecins/:id/slots`, THE Medecins_Service SHALL inclure ce nouveau rendez-vous dans les créneaux occupés (propriété round-trip : création → lecture).
3. WHEN `POST /appointments` est appelé deux fois avec les mêmes `doctorId`, `appointmentDate` et `durationMinutes`, THE Appointment_Service SHALL rejeter le second appel avec une erreur HTTP 400 (propriété d'idempotence : un créneau ne peut être réservé qu'une seule fois).
