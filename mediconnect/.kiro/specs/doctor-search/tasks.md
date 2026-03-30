# Plan d'implémentation : Recherche de Médecins

## Vue d'ensemble

Amélioration et formalisation de l'endpoint `GET /medecins` et `GET /medecins/:id` dans le module NestJS `medecins`. Les fichiers principaux à modifier sont dans `backend/src/modules/medecins/`.

## Tâches

- [x] 1. Créer le DTO de validation des paramètres de recherche
  - Créer `backend/src/modules/medecins/dto/search-medecins.dto.ts`
  - Déclarer les champs `search`, `specialite`, `ville` avec `@IsOptional()`, `@IsString()` et `@Transform(({ value }) => value?.trim())`
  - _Requirements : 5.2, 5.3_

- [ ] 2. Améliorer `getAllMedecinsWithProfiles` dans `MedecinsService`
  - [x] 2.1 Ignorer les paramètres dont la valeur est une chaîne vide après trim
    - Modifier `medecins.service.ts` : ajouter une vérification `if (specialite && specialite.trim())` et `if (ville && ville.trim())` avant d'appliquer les filtres
    - _Requirements : 5.3_

  - [x] 2.2 Rendre le filtre `ville` insensible à la casse
    - Remplacer la comparaison exacte `d.profile?.ville === ville` par une comparaison `toLowerCase()`
    - _Requirements : 1.3, 5.1_

  - [ ]* 2.3 Écrire le test de propriété — Propriété 1 : seuls les médecins actifs apparaissent
    - **Propriété 1 : Seuls les médecins actifs apparaissent dans les résultats**
    - **Valide : Requirements 1.1, 2.4**

  - [ ]* 2.4 Écrire le test de propriété — Propriété 2 : filtre specialite contains insensible à la casse
    - **Propriété 2 : Le filtre specialite est un filtre contains insensible à la casse**
    - **Valide : Requirements 1.2, 5.1**

  - [ ]* 2.5 Écrire le test de propriété — Propriété 3 : filtre ville insensible à la casse
    - **Propriété 3 : Le filtre ville est insensible à la casse**
    - **Valide : Requirements 1.3**

  - [ ]* 2.6 Écrire le test de propriété — Propriété 4 : filtres combinés produisent l'intersection
    - **Propriété 4 : Les filtres combinés produisent l'intersection**
    - **Valide : Requirements 1.4**

  - [ ]* 2.7 Écrire le test de propriété — Propriété 5 : filtre search couvre prénom, nom et email
    - **Propriété 5 : Le filtre search couvre prénom, nom et email**
    - **Valide : Requirements 1.5**

  - [ ]* 2.8 Écrire le test de propriété — Propriété 9 : espaces en début/fin ignorés
    - **Propriété 9 : Les espaces en début/fin de chaîne sont ignorés**
    - **Valide : Requirements 5.2**

  - [ ]* 2.9 Écrire le test de propriété — Propriété 10 : filtre vide ignoré
    - **Propriété 10 : Un filtre vide est ignoré**
    - **Valide : Requirements 5.3**

- [x] 3. Checkpoint — S'assurer que tous les tests passent
  - S'assurer que tous les tests passent, demander à l'utilisateur si des questions se posent.

- [x] 4. Créer la méthode `getMedecinById` dans `MedecinsService`
  - Ajouter la méthode `getMedecinById(id: string)` dans `medecins.service.ts`
  - Récupérer l'utilisateur par `id` avec vérification du rôle médecin (`MEDECIN_GENERALISTE`, `MEDECIN_SPECIALISTE`, `MEDECIN_CHEF_SERVICE`, `MEDECIN_URGENTISTE`) et du statut `ACTIVE`
  - Récupérer le `MedecinProfile` associé (sans créer de profil vide si absent)
  - Lever `NotFoundException('Médecin non trouvé')` si l'utilisateur n'existe pas ou n'est pas un médecin actif
  - Retourner `null` pour `profile` si aucun `MedecinProfile` n'existe
  - _Requirements : 4.1, 4.2, 4.3, 2.3_

  - [ ]* 4.1 Écrire le test de propriété — Propriété 7 : structure complète du profil détaillé
    - **Propriété 7 : Structure complète du profil détaillé**
    - **Valide : Requirements 4.1, 4.3**

  - [ ]* 4.2 Écrire les tests unitaires pour `getMedecinById`
    - Tester le cas `GET /medecins/:id` avec un id inexistant → HTTP 404 (Requirement 4.2)
    - Tester le cas médecin sans profil `MedecinProfile` → `profile: null` (Requirement 2.3)
    - _Requirements : 4.2, 2.3_

- [ ] 5. Mettre à jour `MedecinsController`
  - [x] 5.1 Appliquer `SearchMedecinsDto` sur `GET /medecins`
    - Remplacer les `@Query()` individuels par `@Query() query: SearchMedecinsDto` dans la méthode `getAllMedecins`
    - Activer `ValidationPipe` avec `transform: true` pour que le trim soit appliqué
    - Transmettre `query.search`, `query.specialite`, `query.ville` au service
    - _Requirements : 5.2, 5.3_

  - [x] 5.2 Brancher `getMedecinById` sur `GET /medecins/:id`
    - Remplacer l'appel à `this.medecinsService.getProfile(id)` par `this.medecinsService.getMedecinById(id)` dans la méthode `getMedecinById`
    - _Requirements : 4.1, 4.2_

  - [ ]* 5.3 Écrire le test de propriété — Propriété 8 : tout rôle authentifié peut accéder à la recherche
    - **Propriété 8 : Tout rôle authentifié peut accéder à la recherche**
    - **Valide : Requirements 3.2**

  - [ ]* 5.4 Écrire le test unitaire — requête sans token JWT → HTTP 401
    - Tester que `GET /medecins` sans token retourne HTTP 401
    - _Requirements : 3.1_

- [ ] 6. Vérifier la structure des réponses
  - [x] 6.1 S'assurer que `getAllMedecinsWithProfiles` retourne les champs `id`, `firstName`, `lastName`, `role`, `avatarUrl`, `profile`
    - Vérifier que l'objet `profile` (si non-null) contient au minimum `specialite`, `ville`, `adresseCabinet`, `telephonePro`, `disponTeleconsult`, `tarifs`
    - _Requirements : 2.1, 2.2_

  - [ ]* 6.2 Écrire le test de propriété — Propriété 6 : structure complète des résultats de liste
    - **Propriété 6 : Structure complète des résultats de liste**
    - **Valide : Requirements 2.1, 2.2**

- [x] 7. Checkpoint final — S'assurer que tous les tests passent
  - S'assurer que tous les tests passent, demander à l'utilisateur si des questions se posent.

## Notes

- Les tâches marquées `*` sont optionnelles et peuvent être ignorées pour un MVP rapide
- Les tests de propriétés utilisent **fast-check** (TypeScript/Jest) avec un minimum de 100 itérations
- Chaque test de propriété doit être annoté : `// Feature: doctor-search, Propriété N: <texte>`
- La méthode `getProfile` existante ne doit pas être modifiée (elle est utilisée par le médecin connecté via `GET /medecins/me`)
- Le `ValidationPipe` global doit avoir `transform: true` pour que les `@Transform` du DTO soient actifs
