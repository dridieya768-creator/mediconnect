# Plan d'implémentation : Prise de rendez-vous depuis la recherche de médecins

## Vue d'ensemble

Implémentation du flux complet de prise de rendez-vous depuis la page "Trouver un Médecin". Le backend NestJS est étendu avec deux nouveaux endpoints (`GET /medecins/:id/availability` et `GET /medecins/:id/slots`). Le frontend Angular 17 reçoit un panneau de réservation composé de trois nouveaux composants standalone et deux nouveaux services.

## Tâches

- [ ] 1. Ajouter les DTOs et endpoints backend dans `MedecinsController`
  - [x] 1.1 Créer `GetSlotsQueryDto` dans `backend/src/modules/medecins/dto/get-slots-query.dto.ts`
    - Champs `startDate: string` et `endDate: string` avec `@IsDateString()` et `@IsNotEmpty()`
    - _Exigences : 6.3_

  - [x] 1.2 Implémenter `getMedecinAvailabilityById` dans `MedecinsService`
    - Rechercher le profil par `userId` (paramètre `:id`)
    - Retourner `{ workDays, defaultDuration, acceptsTeleconsultation, disponTeleconsult }`
    - Lever `NotFoundException` si le médecin n'existe pas
    - _Exigences : 6.1, 6.2_

  - [x] 1.3 Implémenter `getOccupiedSlots` dans `MedecinsService`
    - Vérifier l'existence du médecin (lever 404 si absent)
    - Requêter `appointmentRepository` avec `doctorId`, statuts `CONFIRMED`/`REQUESTED`, plage `[startDate, endDate]`
    - Retourner `[{ appointmentDate, durationMinutes }]`
    - _Exigences : 6.3, 6.4_

  - [ ] 1.4 Ajouter les routes `GET :id/availability` et `GET :id/slots` dans `MedecinsController`
    - `@Get(':id/availability')` → appelle `getMedecinAvailabilityById(id)`
    - `@Get(':id/slots')` → appelle `getOccupiedSlots(id, query)` avec `@Query() query: GetSlotsQueryDto`
    - Les deux routes doivent être placées **avant** `@Get(':id')` pour éviter les conflits de routage
    - _Exigences : 6.1, 6.2, 6.3, 6.4_

  - [ ]* 1.5 Écrire les tests de propriétés P10 et P11 pour les nouveaux endpoints
    - **Propriété 10 : Structure complète de la réponse GET /availability**
    - **Valide : Exigences 6.1**
    - **Propriété 11 : Slots occupés = rendez-vous CONFIRMED/REQUESTED dans la plage**
    - **Valide : Exigences 6.3, 6.4**

  - [ ]* 1.6 Écrire les tests de propriétés P12 et P13 pour la cohérence des données
    - **Propriété 12 : Round-trip création → lecture des slots**
    - **Valide : Exigences 7.2**
    - **Propriété 13 : Idempotence — double réservation rejetée**
    - **Valide : Exigences 7.3**

- [x] 2. Point de contrôle backend — Vérifier que les endpoints répondent correctement
  - S'assurer que tous les tests passent, interroger l'utilisateur si des questions se posent.

- [ ] 3. Créer les modèles et services Angular
  - [x] 3.1 Créer les interfaces TypeScript dans `frontend/src/app/core/models/medecin-availability.model.ts`
    - `WorkDay`, `AvailabilityConfig`, `OccupiedSlot`, `BookingState`
    - _Exigences : 2.2, 4.3_

  - [x] 3.2 Créer `MedecinAvailabilityService` dans `frontend/src/app/core/services/medecin-availability.service.ts`
    - Méthode `getAvailability(medecinId: string): Observable<AvailabilityConfig>`
      → `GET /api/v1/medecins/:id/availability`
    - Méthode `getOccupiedSlots(medecinId: string, startDate: string, endDate: string): Observable<OccupiedSlot[]>`
      → `GET /api/v1/medecins/:id/slots?startDate=...&endDate=...`
    - _Exigences : 1.4, 2.2, 2.3_

  - [x] 3.3 Créer `BookingStateService` dans `frontend/src/app/core/services/booking-state.service.ts`
    - Utiliser des `signal()` Angular 17 pour gérer l'état : `selectedSlot`, `consultationType`, `durationMinutes`, `reason`, `currentWeekStart`, `isLoading`, `error`
    - Méthodes `selectSlot(date: Date)`, `clearSlot()`, `reset()`
    - _Exigences : 3.1, 3.2, 3.3, 4.3_

  - [ ]* 3.4 Écrire les tests de propriétés P4 et P6 pour les services d'état
    - **Propriété 4 : Sélection unique d'un créneau**
    - **Valide : Exigences 3.2, 3.3**
    - **Propriété 6 : Durée pré-remplie avec defaultDuration**
    - **Valide : Exigences 4.3**

- [ ] 4. Créer `WeeklyCalendarComponent`
  - [x] 4.1 Créer `frontend/src/app/modules/patient/pages/search/weekly-calendar/weekly-calendar.component.ts`
    - Composant standalone Angular 17
    - Input : `medecinId: string`, `availability: AvailabilityConfig`, `occupiedSlots: OccupiedSlot[]`
    - Output : `slotSelected: EventEmitter<Date>`
    - Afficher 7 jours consécutifs à partir de `currentWeekStart` (depuis `BookingStateService`)
    - Générer les créneaux théoriques selon `workDays` et `defaultDuration`
    - Griser les créneaux chevauchant un `OccupiedSlot`
    - Boutons "Semaine précédente" / "Semaine suivante" (pas de navigation avant la date du jour)
    - Afficher un message si `workDays` est vide ou null
    - _Exigences : 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 4.2 Écrire les tests de propriétés P1, P2 et P3 pour la logique du calendrier
    - **Propriété 1 : Calendrier affiche exactement 7 jours consécutifs**
    - **Valide : Exigences 2.1**
    - **Propriété 2 : Créneaux générés respectent les workDays et defaultDuration**
    - **Valide : Exigences 2.2**
    - **Propriété 3 : Absence de chevauchement — créneaux occupés exclus**
    - **Valide : Exigences 2.3, 5.4, 7.1**

- [ ] 5. Créer `AppointmentFormComponent`
  - [x] 5.1 Créer `frontend/src/app/modules/patient/pages/search/appointment-form/appointment-form.component.ts`
    - Composant standalone Angular 17 avec Reactive Forms
    - Input : `medecin: any` (nom, spécialité, photo)
    - Output : `confirmed: EventEmitter<void>`, `cancelled: EventEmitter<void>`
    - Champ "Type de consultation" : options `Présentiel` / `Téléconsultation` ; désactiver `Téléconsultation` si `acceptsTeleconsultation = false`
    - Champ "Durée" : options 15/30/45/60 min, pré-rempli avec `defaultDuration`
    - Champ "Motif" : textarea optionnel, `maxlength="500"`
    - Section récapitulatif : nom médecin, date/heure du créneau, type, durée
    - Bouton "Confirmer le rendez-vous" désactivé si aucun créneau sélectionné ou requête en cours
    - Indicateur de chargement pendant la requête
    - _Exigences : 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.6_

  - [ ]* 5.2 Écrire les tests de propriétés P5, P7 et P8 pour le formulaire
    - **Propriété 5 : Téléconsultation désactivée si non acceptée**
    - **Valide : Exigences 4.2**
    - **Propriété 7 : Motif limité à 500 caractères**
    - **Valide : Exigences 4.4**
    - **Propriété 8 : Récapitulatif contient toutes les informations requises**
    - **Valide : Exigences 4.5**

- [ ] 6. Créer `BookAppointmentPanelComponent` et câbler la confirmation
  - [x] 6.1 Créer `frontend/src/app/modules/patient/pages/search/book-appointment-panel/book-appointment-panel.component.ts`
    - Composant standalone Angular 17
    - Input : `medecin: any | null` (null = panneau fermé)
    - Output : `closed: EventEmitter<void>`, `booked: EventEmitter<void>`
    - Au changement de `medecin` : appeler `MedecinAvailabilityService.getAvailability()` puis `getOccupiedSlots()` pour la semaine courante
    - Intégrer `WeeklyCalendarComponent` et `AppointmentFormComponent`
    - En-tête avec nom, spécialité et photo du médecin
    - _Exigences : 1.1, 1.2, 1.4_

  - [x] 6.2 Implémenter la logique de confirmation dans `BookAppointmentPanelComponent`
    - À la soumission du formulaire : appeler `AppointmentService.create()` avec les données de `BookingStateService`
    - En cas de succès : émettre `booked`, appeler `BookingStateService.reset()`, fermer le panneau
    - En cas d'erreur 400 (créneau occupé) : afficher un message d'erreur, recharger les slots
    - En cas d'erreur réseau : afficher un message d'erreur, conserver les données du formulaire
    - _Exigences : 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 6.3 Écrire le test de propriété P9 pour la création de rendez-vous
    - **Propriété 9 : Statut initial REQUESTED à la création**
    - **Valide : Exigences 5.1**

- [ ] 7. Intégrer `BookAppointmentPanelComponent` dans `PatientSearchMedecinComponent`
  - [x] 7.1 Modifier `patient-search-medecin.component.ts` pour intégrer le panneau
    - Ajouter un signal `bookingDoctor = signal<any>(null)`
    - Modifier la méthode `takeAppointment(doc)` : au lieu de naviguer, affecter `bookingDoctor.set(doc)`
    - Ajouter `BookAppointmentPanelComponent` aux imports du composant
    - Ajouter `<app-book-appointment-panel>` dans le template avec `[medecin]="bookingDoctor()"` et `(closed)="bookingDoctor.set(null)"` et `(booked)="onBooked()"`
    - _Exigences : 1.2, 1.3_

  - [x] 7.2 Implémenter la redirection vers login si non authentifié
    - Dans `BookAppointmentPanelComponent` ou `PatientSearchMedecinComponent`, vérifier l'authentification avant d'ouvrir le panneau
    - Si non authentifié, rediriger vers `/login` avec `returnUrl` pointant vers la page de recherche
    - _Exigences : 1.3_

- [x] 8. Point de contrôle final — Vérifier l'intégration complète
  - S'assurer que tous les tests passent et que le flux complet fonctionne de bout en bout, interroger l'utilisateur si des questions se posent.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Chaque tâche référence les exigences spécifiques pour la traçabilité
- Les tests de propriétés utilisent **fast-check** (bibliothèque recommandée dans le design)
- Les nouvelles routes `:id/availability` et `:id/slots` doivent être déclarées avant `:id` dans le contrôleur pour éviter les conflits de routage NestJS
- Les composants Angular sont tous en mode **standalone** (Angular 17)
