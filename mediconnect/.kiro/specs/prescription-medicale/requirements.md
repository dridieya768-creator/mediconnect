# Requirements Document — Prescription Médicale (Sprint 3)

## Introduction

Ce document couvre la feature **prescription-medicale** du projet e-Santé MediConnect (PFE 2026).
Elle permet au médecin de saisir une ordonnance avec vérification des interactions médicamenteuses,
de générer un PDF signé avec QR-ORD, d'envoyer l'ordonnance au patient par email sécurisé,
au patient de consulter et télécharger ses ordonnances, et au pharmacien de scanner le QR-ORD
pour récupérer et dispenser l'ordonnance.

Stack : NestJS (backend) + Angular 17 (frontend).
Acteurs déjà authentifiés via le module Auth existant.

---

## Glossaire

- **Prescription_Service** : service NestJS gérant la création, la signature et la récupération des ordonnances.
- **PDF_Service** : service NestJS générant le document PDF de l'ordonnance.
- **QR_Service** : service NestJS existant (`QrCodesService`) générant et vérifiant les QR-ORD JWT.
- **Email_Service** : service NestJS existant (`EmailService`) envoyant les emails via SMTP.
- **Interaction_Checker** : composant vérifiant les interactions médicamenteuses entre les médicaments d'une ordonnance.
- **Ordonnance_Form** : composant Angular du médecin pour saisir une ordonnance.
- **Ordonnance_List** : composant Angular du patient listant ses ordonnances.
- **Scanner_Pharmacie** : composant Angular du pharmacien pour scanner un QR-ORD.
- **QR-ORD** : code QR encodant un JWT signé identifiant une ordonnance de façon unique.
- **CIP** : Code Identifiant de Présentation, identifiant unique d'un médicament.
- **RPPS** : Répertoire Partagé des Professionnels de Santé, identifiant unique du médecin.
- **Médecin** : utilisateur authentifié avec le rôle `DOCTOR`.
- **Patient** : utilisateur authentifié avec le rôle `PATIENT`.
- **Pharmacien** : utilisateur authentifié avec le rôle `PHARMACIST`.

---

## Requirements

### Requirement 1 : Saisie d'une ordonnance par le médecin

**User Story :** En tant que médecin, je veux saisir une prescription médicale pour un patient,
afin de formaliser le traitement prescrit lors d'une consultation.

#### Acceptance Criteria

1. WHEN le Médecin soumet le formulaire d'ordonnance avec au moins un médicament valide,
   THE Prescription_Service SHALL créer une entité `Prescription` avec le statut `ACTIVE`,
   une date d'émission et une date d'expiration à 90 jours.

2. THE Ordonnance_Form SHALL permettre au Médecin de saisir pour chaque médicament :
   le CIP, le nom, le dosage, la posologie, la durée en jours, la quantité
   et l'indicateur de substituabilité.

3. WHEN le Médecin ajoute au moins deux médicaments à l'ordonnance,
   THE Interaction_Checker SHALL analyser les paires de médicaments
   et retourner la liste des interactions détectées avec leur niveau de sévérité
   (`mineure`, `modérée`, `sévère`) avant la soumission.

4. IF l'Interaction_Checker détecte une interaction de niveau `sévère`,
   THEN THE Ordonnance_Form SHALL afficher un avertissement bloquant
   et exiger une confirmation explicite du Médecin avant de permettre la soumission.

5. IF l'Interaction_Checker détecte une interaction de niveau `modérée`,
   THEN THE Ordonnance_Form SHALL afficher un avertissement non bloquant
   visible avant la soumission.

6. IF le formulaire est soumis sans médicament,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 400
   avec le message `"Au moins un médicament est requis"`.

7. WHEN la Prescription est créée avec succès,
   THE QR_Service SHALL générer un QR-ORD unique au format `QR-ORD-{UUID}-{SUFFIX}`
   et l'associer à la Prescription.

---

### Requirement 2 : Génération du PDF de l'ordonnance

**User Story :** En tant que médecin, je veux générer une ordonnance PDF avec QR-ORD signé,
afin de fournir un document officiel et vérifiable au patient.

#### Acceptance Criteria

1. WHEN une Prescription avec le statut `ACTIVE` existe,
   THE PDF_Service SHALL générer un document PDF contenant :
   les informations du médecin (nom, RPPS, spécialité), les informations du patient
   (nom, date de naissance, NSS), la liste des médicaments prescrits,
   la date d'émission, la date d'expiration et l'image du QR-ORD.

2. THE PDF_Service SHALL inclure dans le PDF une représentation visuelle du QR-ORD
   générée par le QR_Service sous forme d'image base64.

3. WHEN le PDF est généré avec succès,
   THE Prescription_Service SHALL stocker l'URL du PDF dans le champ `pdfUrl`
   de l'entité `Prescription`.

4. IF la génération du PDF échoue,
   THEN THE Prescription_Service SHALL logger l'erreur
   et retourner une erreur HTTP 500 avec le message `"Erreur lors de la génération du PDF"`.

5. THE PDF_Service SHALL produire un document PDF conforme au format A4,
   lisible par tout lecteur PDF standard.

---

### Requirement 3 : Envoi de l'ordonnance par email sécurisé

**User Story :** En tant que médecin, je veux envoyer l'ordonnance au patient par email sécurisé,
afin que le patient reçoive son ordonnance directement dans sa messagerie.

#### Acceptance Criteria

1. WHEN une Prescription avec un `pdfUrl` valide est créée,
   THE Email_Service SHALL envoyer un email à l'adresse du Patient
   contenant le PDF de l'ordonnance en pièce jointe.

2. THE Email_Service SHALL inclure dans l'email :
   le nom du médecin prescripteur, la date d'émission de l'ordonnance
   et un lien vers l'espace patient MediConnect.

3. IF l'adresse email du Patient est absente ou invalide,
   THEN THE Email_Service SHALL logger l'erreur
   et ne pas bloquer la création de la Prescription.

4. IF l'envoi de l'email échoue pour une raison technique (SMTP indisponible),
   THEN THE Email_Service SHALL logger l'erreur
   et retourner `false` sans lever d'exception bloquante.

5. WHEN l'email est envoyé avec succès,
   THE Prescription_Service SHALL enregistrer la date d'envoi
   dans le champ `emailSentAt` de l'entité `Prescription`.

---

### Requirement 4 : Consultation et téléchargement des ordonnances par le patient

**User Story :** En tant que patient, je veux consulter et télécharger mes ordonnances,
afin d'accéder à mon historique de prescriptions et de les présenter à un pharmacien.

#### Acceptance Criteria

1. WHEN le Patient accède à la page de ses ordonnances,
   THE Ordonnance_List SHALL afficher toutes les Prescriptions du Patient
   triées par date d'émission décroissante.

2. THE Ordonnance_List SHALL afficher pour chaque Prescription :
   le nom du médecin prescripteur, la date d'émission, la date d'expiration,
   le statut (`ACTIVE`, `PARTIALLY_USED`, `FULLY_USED`, `EXPIRED`, `REVOKED`)
   et la liste des médicaments.

3. WHEN le Patient clique sur "Télécharger" pour une Prescription dont le `pdfUrl` est défini,
   THE Ordonnance_List SHALL déclencher le téléchargement du PDF de l'ordonnance.

4. IF le `pdfUrl` d'une Prescription est absent,
   THEN THE Ordonnance_List SHALL afficher le bouton "Télécharger" désactivé
   avec un message `"PDF non disponible"`.

5. WHILE le Patient est authentifié avec le rôle `PATIENT`,
   THE Prescription_Service SHALL retourner uniquement les Prescriptions
   dont le `patientId` correspond à l'identifiant du Patient connecté.

6. IF un Patient tente d'accéder à la Prescription d'un autre Patient,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 403.

---

### Requirement 5 : Scan du QR-ORD et dispensation en pharmacie

**User Story :** En tant que pharmacien, je veux scanner le QR-ORD et récupérer l'ordonnance complète,
afin de vérifier la validité de l'ordonnance et d'enregistrer la dispensation des médicaments.

#### Acceptance Criteria

1. WHEN le Pharmacien soumet un QR-ORD valide,
   THE Scanner_Pharmacie SHALL afficher les informations complètes de la Prescription :
   nom du patient, nom du médecin, liste des médicaments avec quantités prescrites
   et quantités déjà délivrées.

2. WHEN le Pharmacien valide la dispensation avec les quantités délivrées,
   THE Prescription_Service SHALL mettre à jour le champ `quantityDelivered`
   de chaque médicament concerné et recalculer le statut de la Prescription.

3. IF tous les médicaments ont `quantityDelivered >= quantity`,
   THEN THE Prescription_Service SHALL passer le statut de la Prescription à `FULLY_USED`.

4. IF au moins un médicament a `quantityDelivered < quantity` après dispensation,
   THEN THE Prescription_Service SHALL passer le statut de la Prescription à `PARTIALLY_USED`.

5. IF le QR-ORD soumis correspond à une Prescription avec le statut `EXPIRED`,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 400
   avec le message `"Ordonnance expirée"`.

6. IF le QR-ORD soumis correspond à une Prescription avec le statut `FULLY_USED`,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 400
   avec le message `"Ordonnance déjà délivrée"`.

7. IF le QR-ORD soumis correspond à une Prescription avec le statut `REVOKED`,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 400
   avec le message `"Ordonnance révoquée"`.

8. IF le QR-ORD soumis est introuvable en base de données,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 404
   avec le message `"Ordonnance introuvable"`.

9. THE QR_Service SHALL vérifier la signature JWT du QR-ORD
   et rejeter tout QR-ORD dont la signature est invalide ou expirée.

---

### Requirement 6 : Sérialisation / Désérialisation des données de prescription

**User Story :** En tant que développeur, je veux que les données de prescription soient
correctement sérialisées et désérialisées, afin de garantir l'intégrité des données
entre le frontend et le backend.

#### Acceptance Criteria

1. THE Prescription_Service SHALL sérialiser les données d'une Prescription
   en un objet JSON conforme au schéma défini par le DTO `CreatePrescriptionDto`.

2. WHEN le Prescription_Service reçoit un payload JSON,
   THE Prescription_Service SHALL désérialiser et valider chaque champ
   selon les contraintes définies dans `CreatePrescriptionDto`.

3. FOR ALL Prescriptions valides, la sérialisation puis la désérialisation
   SHALL produire un objet équivalent à l'original (propriété round-trip).

4. IF un champ obligatoire est absent du payload JSON,
   THEN THE Prescription_Service SHALL retourner une erreur HTTP 400
   listant les champs manquants.
