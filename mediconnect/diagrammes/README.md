# Diagrammes MediConnect - Release 1

Ce dossier contient tous les diagrammes UML pour la Release 1 du projet MediConnect.

## Structure des fichiers

### Diagrammes de cas d'utilisation
- `use-case-inscrire.puml` - Figure 3.1 : Décomposition du cas « S'inscrire »
- `use-case-authentifier.puml` - Figure 3.2 : Raffinement du cas « S'authentifier »
- `use-case-prendre-rdv.puml` - Figure 3.3 : Décomposition du cas « Prendre un rendez-vous »
- `use-case-gerer-rdv.puml` - Figure 3.4 : Raffinement du cas « Gérer les rendez-vous »

### Diagrammes de classes
- `class-inscrire-patient.puml` - Figure 3.5 : Diagramme de classe « S'inscrire patient »
- `class-inscrire-medecin.puml` - Figure 3.6 : Diagramme de classe « S'inscrire médecin »
- `class-authentifier.puml` - Figure 3.8 : Diagramme de classe « S'authentifier »
- `class-prendre-rdv.puml` - Figure 3.10 : Diagramme de classe « Prendre un rendez-vous »
- `class-gerer-rdv.puml` - Figure 3.12 : Diagramme de classe « Gérer les rendez-vous »

### Diagrammes de séquence
- `sequence-inscrire.puml` - Figure 3.7 : Diagramme de séquence « S'inscrire »
- `sequence-authentifier.puml` - Figure 3.9 : Diagramme de séquence « S'authentifier »
- `sequence-prendre-rdv.puml` - Figure 3.11 : Diagramme de séquence « Prendre un rendez-vous »
- `sequence-gerer-rdv.puml` - Figure 3.13 : Diagramme de séquence « Gérer les rendez-vous »

### Diagramme de déploiement
- `deploiement.puml` - Figure 3.14 : Diagramme de déploiement

### Diagrammes d'architecture
- `architecture-globale.puml` - Architecture globale du système (Controller-Service-Repository + MVVM)
- `architecture-couches.puml` - Architecture en couches détaillée
- `architecture-modules.puml` - Organisation modulaire Frontend/Backend

## Architecture du Projet

Le projet MediConnect utilise une architecture moderne en couches :

### Backend (NestJS)
- **Pattern** : Controller-Service-Repository
- **Couches** : Controllers → Services → Repositories → Entities
- **Modules** : Organisation modulaire par fonctionnalité

### Frontend (Angular)
- **Pattern** : MVVM (Model-View-ViewModel)
- **Couches** : Components → Services → Models
- **Routing** : Lazy loading des modules

Pour plus de détails, consultez le fichier `ARCHITECTURE.md` à la racine du projet.

## Comment générer les images

### Option 1 : Utiliser PlantUML en ligne de commande

```bash
# Installer PlantUML
npm install -g node-plantuml

# Générer tous les diagrammes en PNG
plantuml *.puml

# Générer en SVG (meilleure qualité)
plantuml -tsvg *.puml
```

### Option 2 : Utiliser l'extension VS Code

1. Installer l'extension "PlantUML" dans VS Code
2. Ouvrir un fichier `.puml`
3. Appuyer sur `Alt+D` pour prévisualiser
4. Clic droit > "Export Current Diagram" pour exporter

### Option 3 : Utiliser le serveur PlantUML en ligne

Visitez : http://www.plantuml.com/plantuml/uml/

Copiez-collez le contenu d'un fichier `.puml` et générez l'image.

## Technologies utilisées

- **PlantUML** : Langage de modélisation UML
- **Format** : Tous les diagrammes sont au format `.puml` (PlantUML)

## Notes

- Les diagrammes sont conformes à la notation UML 2.5
- Les couleurs et styles peuvent être personnalisés dans chaque fichier
- Les diagrammes sont synchronisés avec le code source du projet MediConnect
