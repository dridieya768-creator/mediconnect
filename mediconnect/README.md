# 🏥 MediConnect — Plateforme e-Santé SaaS

> Stack: **Angular 17** + **NestJS** + **PostgreSQL** + **Redis**

## 📁 Structure du Projet

```
mediconnect/
├── frontend/          # Angular 17 app
│   └── src/app/
│       ├── core/              # Guards, interceptors, services globaux
│       ├── shared/            # Composants partagés (sidebar, navbar...)
│       └── modules/
│           ├── auth/          # Login, register
│           ├── patient/       # Portail patient
│           ├── medecin/       # Portail médecin
│           ├── pharmacie/     # Portail pharmacie
│           ├── laboratoire/   # Portail labo
│           └── radiologie/    # Portail radio
│
└── backend/           # NestJS API
    └── src/
        ├── modules/           # Modules métier
        │   ├── auth/
        │   ├── patients/
        │   ├── medecins/
        │   ├── appointments/
        │   ├── prescriptions/
        │   ├── pharmacie/
        │   ├── laboratoire/
        │   ├── radiologie/
        │   ├── qr-codes/
        │   └── notifications/
        ├── common/            # Guards, filters, decorators
        └── config/            # Configuration DB, JWT, etc.
```

## 🚀 Démarrage rapide

### Backend (NestJS)
```bash
cd backend
npm install
cp .env.example .env   # Configurer les variables
npm run migration:run  # Créer les tables
npm run seed           # Données de test
npm run start:dev      # Port 3000
```

### Frontend (Angular)
```bash
cd frontend
npm install
npm start              # Port 4200
```

## 🔑 Comptes de test
| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Patient | patient@test.com | Test1234! |
| Médecin | medecin@test.com | Test1234! |
| Pharmacien | pharmacien@test.com | Test1234! |
| Biologiste | biologiste@test.com | Test1234! |
| Radiologue | radiologue@test.com | Test1234! |
| Admin | admin@test.com | Test1234! |

## 📡 API Documentation
Swagger disponible sur : http://localhost:3000/api/docs

## 🏗️ Architecture

MediConnect utilise une architecture moderne en couches :

### Backend (NestJS)
- **Pattern** : Controller-Service-Repository-Entity
- **Modules** : Organisation modulaire par fonctionnalité
- **ORM** : TypeORM avec PostgreSQL
- **Authentification** : JWT avec Passport

### Frontend (Angular 17)
- **Pattern** : MVVM (Model-View-ViewModel)
- **Modules** : Lazy loading pour optimisation
- **State Management** : Services + RxJS
- **Routing** : Angular Router avec guards

### Communication
- **API REST** : JSON avec authentification JWT
- **WebSocket** : Notifications temps réel
- **WebRTC** : Téléconsultation P2P

📚 **Documentation complète** : Voir `ARCHITECTURE.md` et `INDEX-DOCUMENTATION.md`

## 📊 Diagrammes UML

Tous les diagrammes UML (cas d'utilisation, classes, séquence, architecture) sont disponibles dans le dossier `diagrammes/` au format PlantUML.

Pour générer les images :
```bash
cd diagrammes
npm install -g node-plantuml
plantuml *.puml
```

## 📖 Documentation

- `ARCHITECTURE.md` - Documentation technique complète
- `ARCHITECTURE-RESUME.md` - Résumé simplifié de l'architecture
- `ARCHITECTURE-RAPPORT.md` - Section pour rapport PFE
- `rapport-release1-mediconnect.md` - Rapport Release 1
- `INDEX-DOCUMENTATION.md` - Index de toute la documentation
- `DEMARRAGE_RAPIDE.md` - Guide d'installation détaillé
