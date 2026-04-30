# MediConnect — Release 1 : Prise de Rendez-vous

**Authentification & Gestion des Rendez-vous**

MediConnect — Plateforme e-Santé  
NestJS + Angular 17 • PFE 2026  
2025 – 2026

---

## 3.1 Introduction

Ce chapitre se concentre sur les étapes de réalisation de notre première release en mettant l'accent sur la création et le raffinement du backlog sprint 0 et sprint 1, la conception et la réalisation.

Le sprint 0 couvre les fonctionnalités d'authentification et d'inscription pour l'ensemble des acteurs de la plateforme e-Santé (patients, médecins, pharmaciens et administrateur). Le sprint 1 se concentre sur la prise de rendez-vous médicaux, incluant la recherche de médecins, la sélection de créneaux en temps réel, les confirmations et rappels automatiques.

---

## 3.2 Backlog de Release 1

Pour planifier les tâches à accomplir, nous allons créer le backlog du release 1 présenté sur le tableau 3.1. L'estimation est utilisée pour évaluer la charge de travail associée à chaque tâche.

### Tableau 3.1 – Backlog de Release 1

| User Story (Backlog Produit) | Priorité | Évaluation | Sprint | Acteur | Workflow |
|------------------------------|----------|------------|--------|--------|----------|
| **Sprint 0 — Authentification & Inscription** |
| En tant qu'administrateur, je veux m'authentifier pour accéder au back-office | 1 | Moyen | Sprint 0 | Admin | Auth |
| En tant que patient, je veux m'inscrire (nom, email, mot de passe, profil médical de base) | 1 | Moyen | Sprint 0 | Patient | Auth |
| En tant que patient, je veux m'authentifier | 1 | Moyen | Sprint 0 | Patient | Auth |
| En tant que patient, je veux réinitialiser mon mot de passe par email | 1 | Faible | Sprint 0 | Patient | Auth |
| En tant que médecin, je veux m'inscrire (RPPS, spécialité, cabinet) | 1 | Moyen | Sprint 0 | Médecin | Auth |
| En tant que médecin, je veux m'authentifier | 1 | Moyen | Sprint 0 | Médecin | Auth |
| En tant que médecin, je veux réinitialiser mon mot de passe | 1 | Faible | Sprint 0 | Médecin | Auth |
| En tant que pharmacien, je veux m'inscrire (numéro ordre, officine) | 1 | Moyen | Sprint 0 | Pharmacien | Auth |
| En tant que pharmacien, je veux m'authentifier | 1 | Moyen | Sprint 0 | Pharmacien | Auth |
| **Sprint 1 — W1 — Prise de Rendez-vous** |
| En tant que patient, je veux rechercher un médecin par spécialité, localisation et disponibilité | 2 | Fort | Sprint 1 | Patient | W1 RDV |
| En tant que patient, je veux consulter le profil d'un médecin (photo, avis, tarifs) | 2 | Moyen | Sprint 1 | Patient | W1 RDV |
| En tant que patient, je veux sélectionner un créneau disponible en temps réel (physique ou téléconsultation) | 2 | Fort | Sprint 1 | Patient | W1 RDV |
| En tant que médecin, je veux recevoir une notification instantanée lors d'une demande de RDV | 2 | Fort | Sprint 1 | Médecin | W1 RDV |
| En tant que médecin, je veux accepter ou refuser une demande de RDV en 1 clic (statut VALIDÉ / REFUSÉ) | 2 | Fort | Sprint 1 | Médecin | W1 RDV |
| En tant que patient, je veux recevoir une confirmation de RDV par email et SMS | 2 | Moyen | Sprint 1 | Patient | W1 RDV |
| En tant que patient, je veux recevoir un rappel automatique 24h avant le RDV avec le lien de téléconsultation | 2 | Moyen | Sprint 1 | Patient | W1 RDV |
| En tant que patient, je veux annuler ou reporter un RDV depuis mon espace | 2 | Moyen | Sprint 1 | Patient | W1 RDV |

---

## 3.3 Raffinement de Release 1

Dans cette section nous examinons ces cas d'utilisation :
1. S'inscrire
2. S'authentifier
3. Prendre un rendez-vous
4. Gérer les rendez-vous

### 3.3.1 Raffinement de Sprint 0

#### Raffinement du cas "S'inscrire"

La figure 3.1 offre une représentation visuelle du cas "S'inscrire", décrivant le processus que les utilisateurs suivent pour s'enregistrer sur la plateforme e-Santé.

### Tableau 3.2 – Décomposition du cas « S'inscrire »

| Élément | Description |
|---------|-------------|
| **Cas** | S'inscrire |
| **Acteur** | - Patient<br>- Médecin<br>- Pharmacien |
| **Condition préalable** | La plateforme est opérationnelle. Adresse mail et mot de passe valides. |
| **Condition résultante** | Inscription réussie. |
| **Description de scénario** | - La plateforme affiche une page d'inscription.<br>- L'utilisateur remplit ses informations personnelles.<br>- L'utilisateur appuie sur le bouton « S'inscrire ».<br>- La plateforme inspecte les informations.<br>- La plateforme indique un avis de succès. |
| **Scénarii** | - La plateforme indique une imprécision si les informations sont inexactes. |

#### Raffinement du cas "S'authentifier"

La figure 3.2 démontre une décomposition de cas d'utilisation "S'authentifier".

### Tableau 3.3 – Raffinement du cas « S'authentifier »

| Élément | Description |
|---------|-------------|
| **Cas** | S'authentifier |
| **Acteur** | - Administrateur<br>- Médecin<br>- Patient<br>- Pharmacien |
| **Condition préalable** | La plateforme est opérationnelle. |
| **Condition résultante** | Utilisateur authentifié. |
| **Description de scénario** | - La plateforme affiche la page d'authentification.<br>- L'utilisateur saisit son adresse e-mail et son mot de passe.<br>- La plateforme inspecte l'adresse e-mail et le mot de passe.<br>- La plateforme oriente vers la page suivante. |
| **Scénarii** | - La plateforme indique une imprécision si les informations sont inexactes. |

### 3.3.2 Raffinement de Sprint 1

#### Raffinement du cas "Prendre un rendez-vous"

La figure 3.3 présente la décomposition détaillée du cas "Prendre un rendez-vous".

### Tableau 3.4 – Raffinement du cas « Prendre un rendez-vous »

| Élément | Description |
|---------|-------------|
| **Cas** | Prendre un rendez-vous |
| **Acteur** | - Patient |
| **Condition préalable** | L'utilisateur est authentifié et la plateforme est opérationnelle. |
| **Condition résultante** | Rendez-vous créé et confirmé. |
| **Description de scénario** | - Le patient recherche un médecin par spécialité, localisation et disponibilité.<br>- Le patient consulte le profil du médecin (photo, avis, tarifs).<br>- Le patient sélectionne un créneau disponible en temps réel (physique ou téléconsultation).<br>- Le patient confirme la prise de rendez-vous.<br>- La plateforme envoie une confirmation par email et SMS.<br>- Un rappel automatique est envoyé 24h avant le RDV avec le lien de téléconsultation. |
| **Scénarii** | - Aucun créneau disponible : la plateforme affiche un message d'indisponibilité. |

#### Raffinement du cas "Gérer les rendez-vous"

La figure 3.4 présente le raffinement du cas d'utilisation "Gérer les rendez-vous".

### Tableau 3.5 – Raffinement du cas « Gérer les rendez-vous »

| Élément | Description |
|---------|-------------|
| **Cas** | Gérer les rendez-vous |
| **Acteur** | - Patient<br>- Médecin |
| **Condition préalable** | L'utilisateur est authentifié. |
| **Condition résultante** | Rendez-vous modifié ou annulé avec succès. |
| **Description de scénario** | - Le médecin reçoit une notification instantanée lors d'une demande de RDV.<br>- Le médecin accepte ou refuse la demande en 1 clic (statut VALIDÉ / REFUSÉ).<br>- Le patient consulte ses rendez-vous depuis son espace personnel.<br>- Le patient peut annuler ou reporter un RDV depuis son espace.<br>- La plateforme notifie les deux parties de tout changement. |
| **Scénarii** | - Annulation tardive : la plateforme affiche un avertissement.<br>- Refus médecin : notification envoyée au patient. |

---

## 3.4 Conception de Release 1

### 3.4.1 Conception de Sprint 0

#### Conception du cas "S'inscrire"

Les diagrammes suivants illustrent la conception du cas d'utilisation "S'inscrire".

### 3.4.2 Conception de Sprint 1

#### Conception du cas "Prendre un rendez-vous"

Les diagrammes suivants illustrent la conception du cas d'utilisation "Prendre un rendez-vous".

#### Conception du cas "Gérer les rendez-vous"

Les diagrammes suivants illustrent la conception du cas d'utilisation "Gérer les rendez-vous".

### 3.4.3 Diagramme de déploiement

La figure 3.14 présente le diagramme de déploiement. Il décrit l'architecture physique sur des composants matériels.

---

*MediConnect e-Santé — PFE 2026*
