# Document de Requirements — Recherche de Médecins

## Introduction

Cette fonctionnalité permet à un patient authentifié de rechercher des médecins en filtrant par spécialité et/ou localisation (ville). Les résultats affichent les informations essentielles du profil médecin afin que le patient puisse identifier le praticien adapté à ses besoins et initier une prise de rendez-vous.

Le backend NestJS dispose déjà d'un endpoint `GET /medecins` avec des paramètres `search`, `specialite` et `ville`. Cette fonctionnalité formalise et complète le comportement attendu de cet endpoint ainsi que les règles métier associées.

---

## Glossaire

- **Patient** : utilisateur authentifié avec le rôle `PATIENT` dans le système.
- **Médecin** : utilisateur avec l'un des rôles `MEDECIN_GENERALISTE`, `MEDECIN_SPECIALISTE`, `MEDECIN_CHEF_SERVICE` ou `MEDECIN_URGENTISTE`, et dont le statut est `ACTIVE`.
- **MedecinProfile** : entité `medecin_profiles` contenant les informations professionnelles d'un médecin (spécialité, ville, adresse, disponibilités, etc.).
- **Recherche_Service** : service NestJS (`MedecinsService`) responsable de l'interrogation de la base de données et de l'application des filtres.
- **API** : l'interface HTTP exposée par le backend NestJS.
- **Spécialité** : valeur textuelle du champ `specialite` dans `MedecinProfile`.
- **Ville** : valeur textuelle du champ `ville` dans `MedecinProfile`.

---

## Requirements

### Requirement 1 : Recherche de médecins par critères

**User Story :** En tant que patient, je veux rechercher des médecins par spécialité et/ou localisation, afin de trouver rapidement un praticien adapté à mes besoins.

#### Critères d'acceptation

1. WHEN un patient envoie une requête `GET /medecins` sans paramètres, THE API SHALL retourner la liste de tous les médecins actifs avec leurs profils.
2. WHEN un patient envoie une requête `GET /medecins?specialite={valeur}`, THE Recherche_Service SHALL retourner uniquement les médecins dont le champ `specialite` contient la valeur fournie (recherche insensible à la casse).
3. WHEN un patient envoie une requête `GET /medecins?ville={valeur}`, THE Recherche_Service SHALL retourner uniquement les médecins dont le champ `ville` correspond exactement à la valeur fournie.
4. WHEN un patient envoie une requête `GET /medecins?specialite={valeur}&ville={valeur}`, THE Recherche_Service SHALL appliquer les deux filtres simultanément et retourner uniquement les médecins satisfaisant les deux conditions.
5. WHEN un patient envoie une requête `GET /medecins?search={valeur}`, THE Recherche_Service SHALL retourner les médecins dont le prénom, le nom ou l'email contient la valeur fournie (recherche insensible à la casse).
6. IF aucun médecin ne correspond aux critères fournis, THEN THE API SHALL retourner un tableau vide avec le code HTTP 200.

---

### Requirement 2 : Contenu des résultats de recherche

**User Story :** En tant que patient, je veux voir les informations essentielles de chaque médecin dans les résultats, afin de pouvoir choisir le bon praticien sans avoir à consulter chaque profil individuellement.

#### Critères d'acceptation

1. THE API SHALL inclure dans chaque résultat de recherche les champs suivants : `id`, `firstName`, `lastName`, `role`, `avatarUrl`, et l'objet `profile` associé.
2. THE API SHALL inclure dans l'objet `profile` au minimum : `specialite`, `ville`, `adresseCabinet`, `telephonePro`, `disponTeleconsult`, `tarifs`.
3. WHEN un médecin n'a pas encore de profil `MedecinProfile`, THE API SHALL retourner `null` pour le champ `profile` de ce médecin.
4. THE API SHALL exclure des résultats tout médecin dont le statut n'est pas `ACTIVE`.

---

### Requirement 3 : Accès et authentification

**User Story :** En tant que patient, je veux que la recherche de médecins soit accessible uniquement aux utilisateurs authentifiés, afin de protéger les données des praticiens.

#### Critères d'acceptation

1. WHEN une requête `GET /medecins` est reçue sans token JWT valide, THE API SHALL retourner une réponse HTTP 401.
2. WHEN une requête `GET /medecins` est reçue avec un token JWT valide, THE API SHALL traiter la recherche quel que soit le rôle de l'utilisateur authentifié.

---

### Requirement 4 : Consultation du profil détaillé d'un médecin

**User Story :** En tant que patient, je veux consulter le profil complet d'un médecin, afin d'obtenir toutes les informations nécessaires avant de prendre rendez-vous.

#### Critères d'acceptation

1. WHEN un patient envoie une requête `GET /medecins/{id}` avec un identifiant valide, THE API SHALL retourner le profil complet du médecin correspondant.
2. IF l'identifiant fourni ne correspond à aucun médecin actif, THEN THE API SHALL retourner une réponse HTTP 404 avec un message d'erreur descriptif.
3. THE API SHALL inclure dans le profil détaillé : `specialite`, `ville`, `adresseCabinet`, `geoGoogleMaps`, `telephonePro`, `emailPro`, `languesParlees`, `diplomes`, `biographie`, `photoPro`, `photosCabinet`, `actesCouverts`, `assurancesAcceptees`, `disponTeleconsult`, `tarifs`.

---

### Requirement 5 : Qualité et robustesse des filtres

**User Story :** En tant que patient, je veux que les filtres de recherche soient tolérants aux variations de saisie, afin d'obtenir des résultats pertinents même si ma saisie n'est pas parfaite.

#### Critères d'acceptation

1. WHEN le paramètre `specialite` est fourni avec des caractères en majuscules ou minuscules, THE Recherche_Service SHALL traiter la valeur de manière insensible à la casse.
2. WHEN le paramètre `search` est fourni avec des espaces en début ou fin de chaîne, THE Recherche_Service SHALL ignorer ces espaces avant d'appliquer le filtre.
3. IF un paramètre de filtre est fourni avec une valeur vide (`""`), THEN THE Recherche_Service SHALL ignorer ce filtre et retourner les résultats comme si le paramètre n'avait pas été fourni.
4. THE API SHALL retourner une réponse en moins de 2000ms pour une base contenant jusqu'à 10 000 médecins actifs.
