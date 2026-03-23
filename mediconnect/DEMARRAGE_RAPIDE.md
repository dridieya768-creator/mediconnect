# 🚀 MediConnect — Démarrage Rapide

## ⚠️ IMPORTANT — Lire avant tout

Quand vous extrayez le ZIP, vous obtenez ce dossier :
```
mediconnect-starter-kit-v3\
  └── mediconnect\
        ├── frontend\   ← dossier Angular
        ├── backend\    ← dossier NestJS
        └── ...
```

---

## 🎨 FRONTEND Angular 17 — PowerShell

```powershell
# Étape 1 : Aller DIRECTEMENT dans frontend (depuis l'endroit où vous avez extrait)
cd mediconnect\frontend

# Si vous êtes déjà dans "mediconnect\" :
cd frontend

# Étape 2 : Installer
npm install

# Étape 3 : Démarrer
npm start
```
→ Ouvrir : http://localhost:4200

---

## 🔧 BACKEND NestJS — Nouveau terminal PowerShell

```powershell
# Étape 1 : Aller dans backend
cd mediconnect\backend

# Si vous êtes déjà dans "mediconnect\" :
cd backend

# Étape 2 : Installer
npm install

# Étape 3 : Copier le .env
copy .env.example .env

# Étape 4 : Démarrer
npm run start:dev
```
→ API : http://localhost:3000/api
→ Swagger : http://localhost:3000/api/docs

---

## 🔑 Comptes de test (mot de passe : Test1234!)

| Rôle | Email |
|------|-------|
| Patient | patient@test.com |
| Médecin | medecin@test.com |
| Pharmacien | pharmacien@test.com |
| Biologiste | biologiste@test.com |
| Radiologue | radiologue@test.com |
| Admin | admin@test.com |

---

## ⚠️ Prérequis Node.js

Votre Node.js v18.20.8 est compatible avec Angular 17.
```powershell
node --version   # v18.x ✓
npm --version    # 9.x ou 10.x ✓
```
