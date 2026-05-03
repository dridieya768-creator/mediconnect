# Tasks : ia-symptomes-orientation

## Phase 1 : Backend — Module NestJS `ai`

- [x] 1.1 Créer la structure du module `ai` : `backend/src/modules/ai/` avec `ai.module.ts`, `ai.controller.ts`, `ai.service.ts`, et le dossier `dto/`
- [x] 1.2 Créer `AnalyzeSymptomsDto` avec validation `class-validator` : tableau `messages` (max 20), chaque message avec `role` enum et `content` string (max 2000 chars)
- [x] 1.3 Créer `AnalyzeSymptomsResponseDto` avec les champs `reply`, `specialite` (string | null), `disclaimer`
- [x] 1.4 Implémenter `AiService` : méthode `analyzeSymptoms()` qui construit le payload Gemini, appelle l'API REST via axios, et parse la réponse JSON
- [x] 1.5 Implémenter `buildGeminiPrompt()` dans `AiService` : construit le tableau `contents` avec le prompt système médical multilingue et l'historique de conversation
- [x] 1.6 Implémenter `parseGeminiResponse()` dans `AiService` : parse le JSON Gemini, valide la spécialité contre `SPECIALITES_VALIDES`, gère les erreurs de parsing sans lever d'exception
- [x] 1.7 Implémenter `AiController` avec `POST /analyze-symptoms`, protégé par `JwtAuthGuard` et `@Roles('PATIENT')`
- [x] 1.8 Ajouter `GEMINI_API_KEY=` dans `backend/.env` et `backend/.env.example`
- [x] 1.9 Importer `AiModule` dans `AppModule`

## Phase 2 : Frontend — Service et modèles Angular

- [x] 2.1 Créer `frontend/src/app/core/models/ai-chat.model.ts` avec les interfaces `ChatMessage` et `AnalyzeSymptomResponse`
- [x] 2.2 Créer `frontend/src/app/core/services/ai.service.ts` : service Angular injectable avec la méthode `analyzeSymptoms(messages: ChatMessage[]): Observable<AnalyzeSymptomResponse>`

## Phase 3 : Frontend — Composant `AiChatbotComponent`

- [x] 3.1 Créer `frontend/src/app/modules/patient/pages/dashboard/ai-chatbot/ai-chatbot.component.ts` : composant standalone Angular 17 avec signals (`messages`, `isLoading`, `specialiteRecommandee`, `userInput`)
- [x] 3.2 Implémenter le template HTML du chatbot : zone d'affichage des messages, champ de saisie, bouton d'envoi, disclaimer médical permanent
- [x] 3.3 Implémenter `handleUserMessage()` : ajoute le message à l'historique, appelle `AiService`, gère la réponse et les erreurs
- [x] 3.4 Implémenter le scroll automatique vers le bas après chaque nouveau message (via `ViewChild` et `scrollIntoView`)
- [x] 3.5 Implémenter l'envoi par touche Entrée (keydown event sur le champ de saisie)
- [x] 3.6 Implémenter `navigateToSearch()` : navigation vers `/patient/recherche` avec `queryParams: { specialite }`
- [x] 3.7 Afficher le bouton "Trouver un médecin [Spécialité]" uniquement quand `specialiteRecommandee() !== null`
- [x] 3.8 Ajouter les styles SCSS du composant cohérents avec le design system MediConnect (couleurs `#1a56db`, border-radius 16px, etc.)

## Phase 4 : Intégration dans le dashboard

- [x] 4.1 Importer `AiChatbotComponent` dans `PatientDashboardComponent` et l'ajouter au template HTML dans une section dédiée
- [x] 4.2 Modifier `PatientSearchMedecinComponent` pour lire le query param `specialite` au `ngOnInit` via `ActivatedRoute` et pré-remplir `filterSpecialite`

## Phase 5 : Tests

- [ ] 5.1 Écrire les tests unitaires Jest pour `AiService.parseGeminiResponse()` : JSON valide, JSON invalide, spécialité inconnue, champ manquant
- [ ] 5.2 Écrire les tests unitaires Jest pour `AiService.buildGeminiPrompt()` : vérifier la structure du payload, la présence du prompt système, le mapping des rôles
- [ ] 5.3 Écrire les tests d'intégration pour `AiController` : 401 sans JWT, 403 avec rôle MEDECIN, 400 avec DTO invalide, 200 avec données valides (mock de `AiService`)
- [ ] 5.4 Écrire un test de propriété avec `fast-check` : pour tout tableau de messages valides, `parseGeminiResponse` ne lève jamais d'exception
