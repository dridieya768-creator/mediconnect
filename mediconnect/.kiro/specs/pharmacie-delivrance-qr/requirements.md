# Document de Requirements

## Introduction

Ce sprint implémente le flux complet de **délivrance en pharmacie via QR-ORD** dans MediConnect.
Le patient présente son QR-ORD au pharmacien, qui scanne le code, vérifie la validité de l'ordonnance, authentifie chaque boîte de médicament via son QR-MED-CIP, calcule la part CNAM et la part patient, génère un ticket de délivrance PDF, puis marque l'ordonnance comme `FULLY_USED` et met à jour le dossier patient.

Le flux s'appuie sur l'infrastructure existante : entité `Prescription` (NestJS/TypeORM/PostgreSQL), service `QrCodesService` (JWT signé avec `QR_SIGNING_KEY`), service `PdfService`, et le composant Angular `ScannerPharmacieComponent` déjà en place.

---

## Glossaire

- **Système** : l'application MediConnect (backend NestJS + frontend Angular 19).
- **Pharmacien** : utilisateur authentifié avec le rôle `PHARMACIEN`.
- **Patient** : titulaire de l'ordonnance.
- **QR-ORD** : QR code de type `ORDONNANCE` encodant un JWT signé avec `QR_SIGNING_KEY`, référençant une `Prescription`.
- **QR-MED-CIP** : QR code apposé sur une boîte de médicament, encodant le code CIP13 et un hash d'authenticité.
- **Prescription** : entité base de données avec statuts `ACTIVE`, `PARTIALLY_USED`, `FULLY_USED`, `EXPIRED`, `REVOKED`.
- **DelivranceService** : service backend NestJS orchestrant le flux de délivrance.
- **TicketPdfService** : service backend générant le PDF de ticket de délivrance.
- **ScannerPharmacieComponent** : composant Angular standalone gérant l'interface de scan.
- **DelivranceWorkflowComponent** : composant Angular standalone orchestrant les étapes du workflow de délivrance.
- **CNAM** : Caisse Nationale d'Assurance Maladie — organisme de remboursement.
- **Taux_CNAM** : pourcentage de remboursement par la CNAM (ex. 70 %).
- **Part_Patient** : montant restant à la charge du patient après remboursement CNAM.
- **Ticket_Delivrance** : document PDF récapitulatif de la délivrance remis au patient.
- **DossierHistorique** : entité enregistrant les événements dans le dossier médical du patient.

---

## Requirements

### Requirement 1 : Scan et récupération de l'ordonnance via QR-ORD

**User Story :** En tant que pharmacien, je veux scanner le QR-ORD présenté par le patient pour récupérer l'ordonnance complète via MediConnect, afin de démarrer le processus de délivrance.

#### Critères d'acceptation

1. WHEN le Pharmacien soumet un code QR-ORD, THE DelivranceService SHALL vérifier la signature JWT du QR-ORD avec la clé `QR_SIGNING_KEY` et retourner les données de la `Prescription` associée.
2. IF la signature JWT du QR-ORD est invalide ou absente, THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Signature QR invalide"`.
3. IF le QR-ORD ne correspond à aucune `Prescription` en base, THEN THE DelivranceService SHALL retourner une erreur `404 Not Found` avec le message `"Ordonnance introuvable"`.
4. WHEN la `Prescription` est récupérée avec succès, THE ScannerPharmacieComponent SHALL afficher le nom du patient, le nom du médecin prescripteur, la date d'émission, la date d'expiration et la liste complète des médicaments avec leurs posologies.

---

### Requirement 2 : Vérification de validité de l'ordonnance

**User Story :** En tant que pharmacien, je veux vérifier la validité, la non-expiration et le non-usage précédent de l'ordonnance, afin de ne délivrer que des ordonnances légitimes et encore actives.

#### Critères d'acceptation

1. WHEN le DelivranceService récupère une `Prescription`, THE DelivranceService SHALL vérifier que le statut est `ACTIVE` ou `PARTIALLY_USED` avant d'autoriser la délivrance.
2. IF le statut de la `Prescription` est `FULLY_USED`, THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Ordonnance déjà entièrement délivrée"`.
3. IF le statut de la `Prescription` est `EXPIRED`, THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Ordonnance expirée"`.
4. IF le statut de la `Prescription` est `REVOKED`, THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Ordonnance révoquée"`.
5. WHEN la date courante est postérieure à `Prescription.expiresAt`, THE DelivranceService SHALL mettre à jour le statut de la `Prescription` à `EXPIRED` et retourner une erreur `400 Bad Request` avec le message `"Ordonnance expirée"`.
6. WHEN la `Prescription` est valide, THE ScannerPharmacieComponent SHALL afficher un indicateur visuel vert `"Ordonnance valide"` et activer les étapes suivantes du workflow.

---

### Requirement 3 : Authentification anti-contrefaçon des boîtes (QR-MED-CIP)

**User Story :** En tant que pharmacien, je veux scanner chaque boîte de médicament via son QR-MED-CIP pour authentifier son origine et prévenir la contrefaçon.

#### Critères d'acceptation

1. WHEN le Pharmacien scanne un QR-MED-CIP, THE DelivranceService SHALL extraire le code CIP13 et vérifier que ce CIP est présent dans la liste `Prescription.medications`.
2. IF le CIP extrait du QR-MED-CIP ne correspond à aucun médicament de la `Prescription`, THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Médicament non prescrit : CIP [valeur]"`.
3. WHEN le CIP est validé, THE DelivranceService SHALL incrémenter le compteur de boîtes scannées pour ce médicament dans la session de délivrance courante.
4. IF le nombre de boîtes scannées pour un CIP dépasse la quantité prescrite (`Prescription.medications[].quantity`), THEN THE DelivranceService SHALL retourner une erreur `400 Bad Request` avec le message `"Quantité dépassée pour [nom médicament]"`.
5. THE DelivranceWorkflowComponent SHALL afficher en temps réel le nombre de boîtes scannées versus la quantité prescrite pour chaque médicament.

---

### Requirement 4 : Calcul automatique de la part CNAM et de la part patient

**User Story :** En tant que pharmacien, je veux que le système calcule automatiquement la part CNAM et la part patient pour chaque médicament délivré, afin d'informer le patient de son reste à charge.

#### Critères d'acceptation

1. WHEN le Pharmacien confirme les quantités à délivrer, THE DelivranceService SHALL calculer pour chaque médicament : `montant_total = prix_unitaire × quantité_délivrée`, `part_cnam = montant_total × taux_cnam`, `part_patient = montant_total - part_cnam`.
2. THE DelivranceService SHALL calculer le total général : `total_cnam = somme(part_cnam)`, `total_patient = somme(part_patient)`.
3. WHERE le champ `isSubstitutable` d'un médicament est `true`, THE DelivranceService SHALL appliquer le taux CNAM du médicament générique substitué si un générique est sélectionné.
4. WHEN le calcul est effectué, THE DelivranceWorkflowComponent SHALL afficher un récapitulatif financier avec le montant total, la part CNAM et la part patient avant confirmation de la délivrance.
5. THE DelivranceService SHALL retourner les données financières calculées dans la réponse de l'endpoint de délivrance.

---

### Requirement 5 : Génération du ticket de délivrance PDF

**User Story :** En tant que pharmacien, je veux générer un ticket de délivrance PDF avec les posologies et instructions pour chaque médicament délivré, afin de le remettre au patient.

#### Critères d'acceptation

1. WHEN la délivrance est confirmée, THE TicketPdfService SHALL générer un document PDF contenant : l'identifiant de la délivrance, la date et l'heure de délivrance, le nom du patient, le nom du pharmacien, la liste des médicaments délivrés avec nom, dosage, posologie, durée et quantité délivrée, le récapitulatif financier (part CNAM, part patient, total), et le code QR-ORD de référence.
2. THE TicketPdfService SHALL sauvegarder le PDF généré dans le répertoire `uploads/tickets/` avec le nom de fichier `ticket-{delivranceId}.pdf`.
3. WHEN le PDF est généré, THE DelivranceService SHALL retourner l'URL du ticket PDF dans la réponse de l'endpoint de délivrance.
4. WHEN le PDF est disponible, THE DelivranceWorkflowComponent SHALL afficher un bouton de téléchargement du ticket PDF.
5. THE TicketPdfService SHALL générer un PDF lisible (format A4, police minimum 10pt, sections clairement délimitées).

---

### Requirement 6 : Délivrance et mise à jour du statut de l'ordonnance

**User Story :** En tant que pharmacien, je veux délivrer les médicaments et marquer l'ordonnance comme `FULLY_USED` (ou `PARTIALLY_USED` si délivrance partielle), afin de garantir la traçabilité et empêcher une double délivrance.

#### Critères d'acceptation

1. WHEN le Pharmacien confirme la délivrance, THE DelivranceService SHALL mettre à jour `Prescription.medications[].quantityDelivered` en ajoutant les quantités délivrées lors de cette session.
2. WHEN toutes les quantités prescrites ont été délivrées (`quantityDelivered >= quantity` pour tous les médicaments), THE DelivranceService SHALL mettre à jour le statut de la `Prescription` à `FULLY_USED`.
3. WHEN au moins un médicament n'a pas été entièrement délivré, THE DelivranceService SHALL mettre à jour le statut de la `Prescription` à `PARTIALLY_USED`.
4. THE DelivranceService SHALL persister la mise à jour du statut et des quantités dans la base de données PostgreSQL de manière atomique (transaction).
5. WHEN la délivrance est enregistrée, THE ScannerPharmacieComponent SHALL afficher un message de confirmation `"Délivrance enregistrée avec succès"` et désactiver le formulaire de délivrance.
6. IF une erreur survient lors de la persistance, THEN THE DelivranceService SHALL annuler la transaction et retourner une erreur `500 Internal Server Error` avec le message `"Erreur lors de l'enregistrement de la délivrance"`.

---

### Requirement 7 : Mise à jour de l'historique du dossier patient

**User Story :** En tant que pharmacien, je veux que l'historique de délivrance soit automatiquement mis à jour dans le dossier patient après chaque délivrance, afin d'assurer la traçabilité médicale complète.

#### Critères d'acceptation

1. WHEN la délivrance est confirmée et persistée, THE DelivranceService SHALL créer une entrée dans `DossierHistorique` avec : le type d'événement `DELIVRANCE_PHARMACIE`, l'identifiant de la `Prescription`, la liste des médicaments délivrés avec leurs quantités, la date et l'heure de délivrance, et l'identifiant du pharmacien.
2. THE DelivranceService SHALL créer l'entrée `DossierHistorique` dans la même transaction que la mise à jour de la `Prescription`.
3. IF la création de l'entrée `DossierHistorique` échoue, THEN THE DelivranceService SHALL annuler l'ensemble de la transaction et retourner une erreur `500 Internal Server Error`.
4. WHEN l'entrée est créée, THE Système SHALL rendre l'événement de délivrance visible dans la vue dossier médical du patient avec la date, le pharmacien et les médicaments délivrés.

---

### Requirement 8 : Interface pharmacien — workflow de délivrance

**User Story :** En tant que pharmacien, je veux une interface claire et guidée pour effectuer la délivrance étape par étape, afin de minimiser les erreurs et accélérer le processus.

#### Critères d'acceptation

1. THE DelivranceWorkflowComponent SHALL présenter le workflow en étapes séquentielles : (1) Scan QR-ORD, (2) Vérification ordonnance, (3) Scan boîtes QR-MED-CIP, (4) Récapitulatif financier, (5) Confirmation et génération ticket.
2. WHEN une étape est complétée avec succès, THE DelivranceWorkflowComponent SHALL activer l'étape suivante et marquer l'étape courante comme terminée visuellement.
3. IF une erreur survient à une étape, THE DelivranceWorkflowComponent SHALL afficher le message d'erreur dans l'étape concernée et permettre au pharmacien de corriger sans recommencer depuis le début.
4. WHEN le Pharmacien est à l'étape de scan des boîtes, THE DelivranceWorkflowComponent SHALL permettre de saisir manuellement un code CIP en alternative au scan physique.
5. THE DelivranceWorkflowComponent SHALL être accessible via la route `/pharmacie/delivrance` dans le module pharmacie Angular.
