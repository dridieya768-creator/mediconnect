# 📚 Index de la Documentation MediConnect

## 📖 Documents Principaux

### 1. Rapport Release 1
- **Fichier** : `rapport-release1-mediconnect.md`
- **Contenu** : Rapport complet de la Release 1 avec backlog, raffinement et conception
- **Sections** :
  - Backlog Sprint 0 et Sprint 1
  - Raffinement des cas d'utilisation
  - Conception détaillée
  - Diagrammes UML

### 2. Architecture Complète
- **Fichier** : `ARCHITECTURE.md`
- **Contenu** : Documentation technique complète de l'architecture
- **Sections** :
  - Architecture globale
  - Backend (Controller-Service-Repository)
  - Frontend (MVVM)
  - Organisation modulaire
  - Flux de données
  - Patterns utilisés
  - Sécurité

### 3. Architecture Résumé
- **Fichier** : `ARCHITECTURE-RESUME.md`
- **Contenu** : Version simplifiée et visuelle de l'architecture
- **Idéal pour** : Comprendre rapidement l'architecture du projet

### 4. Architecture pour Rapport
- **Fichier** : `ARCHITECTURE-RAPPORT.md`
- **Contenu** : Section prête à intégrer dans le rapport PFE
- **Format** : Académique avec tableaux et exemples de code

### 5. Guide de Démarrage
- **Fichier** : `DEMARRAGE_RAPIDE.md`
- **Contenu** : Instructions pour installer et lancer le projet

---

## 🎨 Diagrammes UML

Tous les diagrammes sont dans le dossier `diagrammes/` au format PlantUML (`.puml`)

### Diagrammes de Cas d'Utilisation
1. `use-case-inscrire.puml` - S'inscrire
2. `use-case-authentifier.puml` - S'authentifier
3. `use-case-prendre-rdv.puml` - Prendre un rendez-vous
4. `use-case-gerer-rdv.puml` - Gérer les rendez-vous

### Diagrammes de Classes
5. `class-inscrire-patient.puml` - S'inscrire patient
6. `class-inscrire-medecin.puml` - S'inscrire médecin
7. `class-authentifier.puml` - S'authentifier
8. `class-prendre-rdv.puml` - Prendre un rendez-vous
9. `class-gerer-rdv.puml` - Gérer les rendez-vous

### Diagrammes de Séquence
10. `sequence-inscrire.puml` - S'inscrire
11. `sequence-authentifier.puml` - S'authentifier
12. `sequence-prendre-rdv.puml` - Prendre un rendez-vous
13. `sequence-gerer-rdv.puml` - Gérer les rendez-vous

### Diagrammes d'Architecture
14. `architecture-simple.puml` - Vue simplifiée
15. `architecture-globale.puml` - Architecture complète
16. `architecture-couches.puml` - Architecture en couches
17. `architecture-modules.puml` - Organisation modulaire
18. `deploiement.puml` - Diagramme de déploiement

---

## 🗂️ Structure du Projet

```
mediconnect/
├── backend/                          # Backend NestJS
│   ├── src/
│   │   ├── modules/                  # Modules fonctionnels
│   │   │   ├── auth/                 # Authentification
│   │   │   ├── appointments/         # Gestion RDV
│   │   │   ├── patients/             # Module Patient
│   │   │   ├── medecins/             # Module Médecin
│   │   │   ├── prescriptions/        # Ordonnances
│   │   │   └── ...
│   │   ├── common/                   # Guards, Interceptors, Filters
│   │   ├── config/                   # Configuration
│   │   └── main.ts                   # Point d'entrée
│   └── package.json
│
├── frontend/                         # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/              # Modules fonctionnels
│   │   │   │   ├── auth/             # Authentification
│   │   │   │   ├── patient/          # Espace Patient
│   │   │   │   ├── medecin/          # Espace Médecin
│   │   │   │   └── ...
│   │   │   ├── core/                 # Services globaux
│   │   │   ├── shared/               # Composants partagés
│   │   │   └── pages/                # Pages publiques
│   │   └── index.html
│   └── package.json
│
├── diagrammes/                       # Diagrammes UML
│   ├── use-case-*.puml
│   ├── class-*.puml
│   ├── sequence-*.puml
│   ├── architecture-*.puml
│   └── README.md
│
├── ARCHITECTURE.md                   # Documentation architecture complète
├── ARCHITECTURE-RESUME.md            # Résumé architecture
├── ARCHITECTURE-RAPPORT.md           # Section pour rapport PFE
├── rapport-release1-mediconnect.md   # Rapport Release 1
├── INDEX-DOCUMENTATION.md            # Ce fichier
├── DEMARRAGE_RAPIDE.md              # Guide installation
├── README.md                         # README principal
└── docker-compose.yml                # Configuration Docker
```

---

## 🎯 Guide d'Utilisation

### Pour Comprendre l'Architecture

1. **Débutant** : Commencez par `ARCHITECTURE-RESUME.md`
2. **Intermédiaire** : Lisez `ARCHITECTURE.md`
3. **Avancé** : Consultez le code source et les diagrammes

### Pour le Rapport PFE

1. Utilisez `rapport-release1-mediconnect.md` pour la Release 1
2. Intégrez `ARCHITECTURE-RAPPORT.md` pour la section architecture
3. Générez les images des diagrammes depuis `diagrammes/`

### Pour Développer

1. Suivez `DEMARRAGE_RAPIDE.md` pour l'installation
2. Consultez `ARCHITECTURE.md` pour comprendre l'organisation
3. Référez-vous aux diagrammes pour les flux de données

---

## 🔧 Génération des Diagrammes

### Installer PlantUML

```bash
npm install -g node-plantuml
```

### Générer tous les diagrammes

```bash
cd diagrammes
plantuml *.puml
```

### Générer en SVG (meilleure qualité)

```bash
plantuml -tsvg *.puml
```

---

## 📊 Résumé de l'Architecture

### Backend (NestJS)
- **Pattern** : Controller-Service-Repository-Entity
- **Modules** : 12+ modules fonctionnels
- **Base de données** : PostgreSQL avec TypeORM
- **Authentification** : JWT avec Passport

### Frontend (Angular 17)
- **Pattern** : MVVM (Component-based)
- **Modules** : Lazy loading pour optimisation
- **State Management** : Services + RxJS
- **Routing** : Angular Router avec guards

### Communication
- **API** : REST avec JSON
- **Sécurité** : JWT tokens
- **Temps réel** : WebSocket pour notifications

---

## 📝 Checklist pour le Rapport

- [ ] Lire `rapport-release1-mediconnect.md`
- [ ] Intégrer la section architecture depuis `ARCHITECTURE-RAPPORT.md`
- [ ] Générer les images des diagrammes UML
- [ ] Insérer les diagrammes dans le rapport
- [ ] Vérifier la numérotation des figures
- [ ] Ajouter les références bibliographiques
- [ ] Relire et corriger

---

## 🚀 Prochaines Étapes

1. **Release 2** : Téléconsultation et prescriptions électroniques
2. **Release 3** : Intégration pharmacie et laboratoire
3. **Release 4** : Analytics et tableaux de bord

---

## 📞 Support

Pour toute question sur l'architecture ou le code :
1. Consultez d'abord la documentation
2. Vérifiez les diagrammes UML
3. Examinez le code source avec les commentaires

---

**Dernière mise à jour** : Release 1 - 2026
**Version** : 1.0.0
**Projet** : MediConnect - Plateforme e-Santé
