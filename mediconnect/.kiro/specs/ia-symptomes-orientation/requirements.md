# Requirements : ia-symptomes-orientation

## Introduction

Cette feature ajoute un chatbot IA dans le dashboard patient de MediConnect. Le patient décrit ses symptômes en langage naturel (français, arabe ou anglais), l'IA Google Gemini analyse la description et recommande une spécialité médicale. Le patient peut ensuite être redirigé vers la recherche de médecins filtrée par cette spécialité.

---

## Requirements

### Requirement 1 : Chatbot IA dans le dashboard patient

**User Story** : En tant que patient connecté, je veux accéder à un chatbot IA depuis mon dashboard pour décrire mes symptômes et obtenir une orientation médicale, afin de savoir quel type de médecin consulter.

#### Critères d'acceptation

1. GIVEN le patient est connecté et sur `/patient/dashboard`, WHEN il fait défiler la page, THEN le composant `AiChatbotComponent` est visible avec un message d'accueil de l'IA.
2. GIVEN le chatbot est affiché, WHEN la page se charge, THEN un disclaimer médical est visible en permanence : "⚠️ Ceci est une aide à l'orientation uniquement. Consultez toujours un médecin pour un diagnostic."
3. GIVEN le chatbot est affiché, WHEN le patient n'a pas encore envoyé de message, THEN un message d'accueil de l'IA est présent dans l'historique (ex: "Bonjour ! Décrivez vos symptômes...").
4. GIVEN le chatbot est affiché, WHEN le patient saisit du texte dans le champ de saisie, THEN le bouton d'envoi est activé.
5. GIVEN le patient a saisi un message vide ou uniquement des espaces, WHEN il clique sur envoyer, THEN aucune requête n'est envoyée au backend.

---

### Requirement 2 : Analyse des symptômes par Gemini

**User Story** : En tant que patient, je veux que l'IA analyse mes symptômes décrits en français, arabe ou anglais, afin d'obtenir une réponse empathique et une recommandation de spécialité médicale.

#### Critères d'acceptation

1. GIVEN le patient envoie un message décrivant ses symptômes, WHEN le backend reçoit la requête, THEN il appelle l'API Gemini REST (`gemini-1.5-flash`) avec l'historique de conversation complet.
2. GIVEN l'appel Gemini réussit, WHEN la réponse est reçue, THEN le backend parse le JSON retourné et extrait `reply` (texte de réponse) et `specialite` (valeur enum ou null).
3. GIVEN la réponse Gemini contient une spécialité, WHEN cette valeur n'est pas dans la liste des spécialités valides du projet, THEN `specialite` est mis à `null` (valeur ignorée).
4. GIVEN le patient écrit en arabe, WHEN Gemini répond, THEN la réponse est en arabe.
5. GIVEN le patient écrit en anglais, WHEN Gemini répond, THEN la réponse est en anglais.
6. GIVEN le patient écrit en français, WHEN Gemini répond, THEN la réponse est en français.
7. GIVEN l'appel Gemini réussit, WHEN la réponse est renvoyée au frontend, THEN elle contient toujours les champs `reply`, `specialite` (string ou null), et `disclaimer`.

---

### Requirement 3 : Endpoint backend sécurisé

**User Story** : En tant que développeur, je veux un endpoint NestJS sécurisé pour l'analyse des symptômes, afin que seuls les patients authentifiés puissent l'utiliser.

#### Critères d'acceptation

1. GIVEN une requête `POST /api/v1/ai/analyze-symptoms` sans JWT, WHEN elle arrive au backend, THEN le backend retourne HTTP 401.
2. GIVEN une requête avec un JWT de rôle MEDECIN ou PHARMACIEN, WHEN elle arrive au backend, THEN le backend retourne HTTP 403.
3. GIVEN une requête avec un JWT de rôle PATIENT valide, WHEN le body contient un tableau `messages` valide, THEN le backend retourne HTTP 200 avec la réponse IA.
4. GIVEN le body contient un message avec `content` dépassant 2000 caractères, WHEN la validation DTO s'exécute, THEN le backend retourne HTTP 400 avec le détail de l'erreur.
5. GIVEN le body contient plus de 20 messages, WHEN la validation DTO s'exécute, THEN le backend retourne HTTP 400.
6. GIVEN le body contient un `role` invalide (ni "user" ni "assistant"), WHEN la validation DTO s'exécute, THEN le backend retourne HTTP 400.
7. GIVEN la variable `GEMINI_API_KEY` est définie dans `.env`, WHEN le service est initialisé, THEN la clé est lue via `ConfigService` et n'est jamais exposée dans les logs ou les réponses HTTP.

---

### Requirement 4 : Module NestJS `ai`

**User Story** : En tant que développeur, je veux un module NestJS `ai` autonome et bien structuré, afin de maintenir la séparation des responsabilités du projet.

#### Critères d'acceptation

1. GIVEN le module `ai` est créé, WHEN l'application démarre, THEN `AiModule` est importé dans `AppModule` sans erreur.
2. GIVEN le module `ai` est créé, THEN il contient : `AiController`, `AiService`, `AnalyzeSymptomsDto`, `AnalyzeSymptomsResponseDto`.
3. GIVEN `AiService` appelle Gemini, WHEN il utilise axios, THEN il n'utilise pas le SDK officiel Gemini — uniquement des appels HTTP REST directs.
4. GIVEN `AiService` reçoit une erreur HTTP 429 de Gemini, WHEN il la traite, THEN il lève une `ServiceUnavailableException` NestJS.
5. GIVEN `AiService` reçoit une erreur réseau ou timeout (> 10s), WHEN il la traite, THEN il lève une `ServiceUnavailableException` NestJS.
6. GIVEN `AiService` reçoit une réponse Gemini non-JSON, WHEN il la parse, THEN il retourne le texte brut comme `reply` et `specialite: null` sans lever d'exception.

---

### Requirement 5 : Composant Angular `AiChatbotComponent`

**User Story** : En tant que patient, je veux une interface de chat fluide et réactive dans mon dashboard, afin d'interagir naturellement avec l'IA.

#### Critères d'acceptation

1. GIVEN le composant est créé, THEN c'est un composant standalone Angular 17 utilisant des signals pour l'état.
2. GIVEN le patient envoie un message, WHEN la requête est en cours, THEN un indicateur de chargement (spinner ou "...") est affiché dans le chat et le bouton d'envoi est désactivé.
3. GIVEN la réponse IA arrive, WHEN elle est affichée, THEN le message utilisateur et la réponse IA sont visuellement distincts (alignement ou couleur différente).
4. GIVEN plusieurs échanges ont eu lieu, WHEN de nouveaux messages arrivent, THEN la zone de chat défile automatiquement vers le bas pour afficher le dernier message.
5. GIVEN le patient appuie sur la touche Entrée dans le champ de saisie, WHEN le message est non vide, THEN le message est envoyé (équivalent au clic sur le bouton).
6. GIVEN une erreur backend survient, WHEN la réponse d'erreur arrive, THEN un message d'erreur est affiché dans le chat (pas d'alerte browser, pas de console.error visible).
7. GIVEN le composant est monté, THEN l'historique de conversation est vide (pas de persistance entre sessions/rechargements).

---

### Requirement 6 : Recommandation de spécialité et redirection

**User Story** : En tant que patient, je veux voir la spécialité recommandée par l'IA et pouvoir trouver un médecin de cette spécialité en un clic, afin de prendre rendez-vous rapidement.

#### Critères d'acceptation

1. GIVEN l'IA a recommandé une spécialité, WHEN la réponse est affichée, THEN un bouton "Trouver un médecin [Spécialité]" apparaît sous la réponse IA.
2. GIVEN le bouton "Trouver un médecin" est affiché, WHEN le patient clique dessus, THEN il est redirigé vers `/patient/recherche` avec le query param `specialite` correspondant.
3. GIVEN l'IA n'a pas encore recommandé de spécialité (réponse de clarification), WHEN la réponse est affichée, THEN le bouton "Trouver un médecin" n'est pas affiché.
4. GIVEN une nouvelle spécialité est recommandée dans un message ultérieur, WHEN la réponse arrive, THEN le bouton est mis à jour avec la nouvelle spécialité.
5. GIVEN le patient est redirigé vers `/patient/recherche?specialite=CARDIOLOGUE`, WHEN la page de recherche se charge, THEN le filtre spécialité est pré-rempli avec "CARDIOLOGUE".

---

### Requirement 7 : Historique de session (sans persistance)

**User Story** : En tant que patient, je veux que ma conversation avec l'IA soit maintenue pendant ma session de navigation, mais effacée à la fermeture ou au rechargement, afin de protéger ma vie privée.

#### Critères d'acceptation

1. GIVEN le patient a eu une conversation avec l'IA, WHEN il navigue vers une autre page puis revient au dashboard, THEN l'historique de conversation est effacé (composant re-monté).
2. GIVEN le patient a eu une conversation, WHEN il recharge la page, THEN l'historique est effacé.
3. GIVEN plusieurs messages ont été échangés, WHEN le backend reçoit une nouvelle requête, THEN il reçoit l'historique complet de la session (tous les messages précédents) pour maintenir le contexte.
4. GIVEN l'historique contient 20 messages, WHEN le patient envoie un 21ème message, THEN le frontend envoie uniquement les 20 derniers messages (fenêtre glissante) pour respecter la limite DTO.

---

### Requirement 8 : Intégration dans le dashboard patient existant

**User Story** : En tant que développeur, je veux intégrer le chatbot dans le dashboard existant sans casser les fonctionnalités actuelles, afin de livrer la feature de manière non-régressive.

#### Critères d'acceptation

1. GIVEN `AiChatbotComponent` est ajouté au dashboard, WHEN la page se charge, THEN toutes les fonctionnalités existantes du dashboard (RDV, ordonnances, QR code, spécialités) continuent de fonctionner.
2. GIVEN `AiChatbotComponent` est un composant standalone, WHEN il est importé dans `PatientDashboardComponent`, THEN aucune modification du module patient n'est requise.
3. GIVEN le composant est intégré, THEN il est positionné dans une section dédiée du dashboard (après la section hero ou dans une card dédiée).
4. GIVEN la route `/patient/recherche` reçoit un query param `specialite`, WHEN `PatientSearchMedecinComponent` se charge, THEN il lit ce paramètre et pré-filtre les résultats.
