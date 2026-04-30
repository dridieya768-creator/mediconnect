# Architecture du Projet MediConnect

## Vue d'ensemble

MediConnect utilise une **architecture client-serveur moderne** avec une séparation claire entre le frontend et le backend, suivant les principes de l'architecture en couches et des design patterns modernes.

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                     │
│              Angular 17 - Architecture MVVM              │
│                  (Component-Based)                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     │ WebSocket (notifications)
┌────────────────────▼────────────────────────────────────┐
│                   SERVEUR (Backend)                      │
│         NestJS - Architecture Modulaire MVC-like         │
│              (Controller-Service-Repository)             │
└────────────────────┬────────────────────────────────────┘
                     │ TypeORM
┌────────────────────▼────────────────────────────────────┐
│              BASE DE DONNÉES PostgreSQL                  │
│                  (Modèle relationnel)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Backend : Architecture NestJS (MVC-like)

### Pattern : **Controller-Service-Repository**

Votre backend suit une architecture inspirée de MVC mais adaptée aux APIs REST modernes :

```
┌──────────────────────────────────────────────────────┐
│                    BACKEND LAYERS                     │
├──────────────────────────────────────────────────────┤
│  Controllers (Couche Présentation/Routing)           │
│    ↓ Reçoit les requêtes HTTP                        │
│    ↓ Valide les DTOs                                 │
│    ↓ Appelle les Services                            │
├──────────────────────────────────────────────────────┤
│  Services (Couche Métier/Business Logic)             │
│    ↓ Logique métier                                  │
│    ↓ Orchestration                                   │
│    ↓ Appelle les Repositories                        │
├──────────────────────────────────────────────────────┤
│  Repositories (Couche Accès aux Données)             │
│    ↓ TypeORM                                         │
│    ↓ Requêtes SQL                                    │
├──────────────────────────────────────────────────────┤
│  Entities (Modèle de Données)                        │
│    ↓ Définition des tables                           │
│    ↓ Relations                                       │
└──────────────────────────────────────────────────────┘
```

### Structure d'un Module Backend

```
backend/src/modules/appointments/
├── appointments.controller.ts    ← Controller (Routes HTTP)
├── appointments.service.ts       ← Service (Logique métier)
├── appointments.module.ts        ← Module (Configuration)
├── appointments-reminder.service.ts ← Service spécialisé
├── dto/
│   ├── create-appointment.dto.ts ← Data Transfer Objects
│   ├── cancel-appointment.dto.ts
│   └── rate-appointment.dto.ts
└── entities/
    └── appointment.entity.ts     ← Entity (Modèle de données)
```

### Correspondance avec MVC

| Composant NestJS | Équivalent MVC | Rôle |
|------------------|----------------|------|
| **Controller** | Controller | Gère les routes HTTP, validation des entrées |
| **Service** | Model (logique) | Logique métier, orchestration |
| **Entity** | Model (données) | Représentation des données en base |
| **DTO** | - | Validation et transformation des données |
| **Repository** | Model (accès) | Accès aux données via TypeORM |

### Exemple Concret : Module Appointments

```typescript
// 1. CONTROLLER (Point d'entrée HTTP)
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}
  
  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }
}

// 2. SERVICE (Logique métier)
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    private notificationsService: NotificationsService
  ) {}
  
  async createAppointment(dto: CreateAppointmentDto) {
    // Logique métier
    const appointment = this.appointmentRepo.create(dto);
    await this.appointmentRepo.save(appointment);
    await this.notificationsService.notifyDoctor(appointment);
    return appointment;
  }
}

// 3. ENTITY (Modèle de données)
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  patientId: number;
  
  @ManyToOne(() => Patient)
  patient: Patient;
}
```

---

## 🎨 Frontend : Architecture Angular (MVVM)

### Pattern : **MVVM (Model-View-ViewModel)**

Angular utilise une architecture basée sur les composants avec le pattern MVVM :

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND LAYERS                     │
├──────────────────────────────────────────────────────┤
│  Components (View + ViewModel)                       │
│    ↓ Templates HTML (View)                           │
│    ↓ TypeScript Class (ViewModel)                    │
│    ↓ Data Binding                                    │
├──────────────────────────────────────────────────────┤
│  Services (Business Logic)                           │
│    ↓ Appels HTTP                                     │
│    ↓ Gestion d'état                                  │
│    ↓ Communication avec le backend                   │
├──────────────────────────────────────────────────────┤
│  Models (Interfaces/Types)                           │
│    ↓ Définition des structures de données            │
└──────────────────────────────────────────────────────┘
```

### Structure d'un Module Frontend

```
frontend/src/app/modules/patient/
├── pages/
│   ├── appointments/
│   │   ├── appointments.component.ts      ← ViewModel
│   │   ├── appointments.component.html    ← View
│   │   └── appointments.component.scss    ← Styles
│   ├── dashboard/
│   └── search/
├── layout/
│   └── patient-layout.component.ts
├── patient.routes.ts                      ← Routing
└── ...

frontend/src/app/core/
├── services/
│   ├── auth.service.ts                    ← Services (HTTP)
│   ├── booking-state.service.ts           ← State Management
│   └── medecin-availability.service.ts
├── models/
│   ├── patient.model.ts                   ← Models (Interfaces)
│   ├── appointment.model.ts
│   └── prescription.model.ts
└── guards/
    └── auth.guard.ts                      ← Route Guards
```

### Correspondance avec MVVM

| Composant Angular | Rôle MVVM | Description |
|-------------------|-----------|-------------|
| **Component.html** | View | Interface utilisateur (template) |
| **Component.ts** | ViewModel | Logique de présentation, data binding |
| **Service** | Model | Logique métier, appels API |
| **Interface/Model** | Model | Structure des données |

### Exemple Concret : Composant Appointments

```typescript
// 1. MODEL (Interface)
export interface Appointment {
  id: number;
  patientId: number;
  medecinId: number;
  dateHeure: Date;
  status: AppointmentStatus;
}

// 2. SERVICE (Logique métier + HTTP)
@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  constructor(private http: HttpClient) {}
  
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>('/api/appointments');
  }
}

// 3. COMPONENT (ViewModel)
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html'
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];  // ViewModel data
  
  constructor(private appointmentsService: AppointmentsService) {}
  
  ngOnInit() {
    this.loadAppointments();
  }
  
  loadAppointments() {
    this.appointmentsService.getAppointments()
      .subscribe(data => this.appointments = data);
  }
}

// 4. VIEW (Template HTML)
// <div *ngFor="let appointment of appointments">
//   {{ appointment.dateHeure | date }}
// </div>
```

---

## 📦 Organisation Modulaire

### Backend - Modules NestJS

```
backend/src/
├── modules/
│   ├── auth/              ← Authentification JWT
│   ├── users/             ← Gestion utilisateurs
│   ├── patients/          ← Module Patient
│   ├── medecins/          ← Module Médecin
│   ├── appointments/      ← Gestion RDV
│   ├── prescriptions/     ← Ordonnances
│   ├── pharmacie/         ← Module Pharmacie
│   ├── notifications/     ← Notifications temps réel
│   └── qr-codes/          ← Génération QR codes
├── common/
│   ├── decorators/        ← Décorateurs personnalisés
│   ├── filters/           ← Exception filters
│   ├── guards/            ← Guards (JWT, Roles)
│   └── interceptors/      ← Intercepteurs HTTP
├── config/                ← Configuration
└── main.ts                ← Point d'entrée
```

### Frontend - Modules Angular

```
frontend/src/app/
├── modules/
│   ├── auth/              ← Authentification
│   ├── patient/           ← Espace Patient
│   ├── medecin/           ← Espace Médecin
│   ├── pharmacie/         ← Espace Pharmacie
│   ├── laboratoire/       ← Espace Laboratoire
│   └── radiologie/        ← Espace Radiologie
├── core/
│   ├── services/          ← Services globaux
│   ├── models/            ← Interfaces/Types
│   ├── guards/            ← Route guards
│   └── interceptors/      ← HTTP interceptors
├── shared/
│   └── components/        ← Composants réutilisables
└── pages/                 ← Pages publiques
```

---

## 🔄 Flux de Données (Exemple : Prise de RDV)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    Patient clique "Réserver" dans le composant Angular      │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 2. COMPONENT (ViewModel)                                    │
│    appointment-form.component.ts                            │
│    → Prépare les données                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 3. SERVICE (Frontend)                                       │
│    appointments.service.ts                                  │
│    → http.post('/api/appointments', data)                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓ HTTP Request
┌────────────────────▼────────────────────────────────────────┐
│ 4. CONTROLLER (Backend)                                     │
│    appointments.controller.ts                               │
│    → @Post() create(@Body() dto)                            │
│    → Valide le DTO                                          │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 5. SERVICE (Backend)                                        │
│    appointments.service.ts                                  │
│    → Logique métier                                         │
│    → Vérifie disponibilité                                  │
│    → Crée le RDV                                            │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 6. REPOSITORY + ENTITY                                      │
│    TypeORM Repository                                       │
│    → INSERT INTO appointments                               │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────▼────────────────────────────────────────┐
│ 7. DATABASE                                                 │
│    PostgreSQL                                               │
│    → Stockage persistant                                    │
└────────────────────┬────────────────────────────────────────┘
                     ↓ Response
┌────────────────────▼────────────────────────────────────────┐
│ 8. NOTIFICATIONS                                            │
│    notifications.service.ts                                 │
│    → Notifie le médecin                                     │
│    → Envoie email de confirmation                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Patterns Utilisés

### Backend (NestJS)

1. **Dependency Injection** : Injection de dépendances via constructeur
2. **Repository Pattern** : Abstraction de l'accès aux données (TypeORM)
3. **DTO Pattern** : Validation et transformation des données
4. **Guard Pattern** : Protection des routes (JWT, Roles)
5. **Interceptor Pattern** : Transformation des réponses HTTP
6. **Module Pattern** : Organisation en modules fonctionnels

### Frontend (Angular)

1. **Component Pattern** : Composants réutilisables
2. **Service Pattern** : Services injectables
3. **Observable Pattern** : RxJS pour la programmation réactive
4. **Guard Pattern** : Protection des routes (authGuard)
5. **Lazy Loading** : Chargement différé des modules
6. **Dependency Injection** : Injection de services

---

## 🔐 Sécurité

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHES DE SÉCURITÉ                       │
├─────────────────────────────────────────────────────────────┤
│ Frontend                                                     │
│  → AuthGuard (protection des routes)                        │
│  → JWT Token dans localStorage                              │
│  → HTTP Interceptor (ajout du token)                        │
├─────────────────────────────────────────────────────────────┤
│ Backend                                                      │
│  → JWT Authentication (Passport)                            │
│  → Role-Based Access Control (RBAC)                         │
│  → Guards (JwtAuthGuard, RolesGuard)                        │
│  → DTO Validation (class-validator)                         │
│  → Rate Limiting (Throttler)                                │
│  → Helmet (sécurité HTTP headers)                           │
├─────────────────────────────────────────────────────────────┤
│ Database                                                     │
│  → Hachage des mots de passe (bcrypt)                       │
│  → Contraintes d'intégrité                                  │
│  → Transactions ACID                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Comparaison : Votre Architecture vs MVC Classique

| Aspect | MVC Classique | Votre Projet |
|--------|---------------|--------------|
| **Backend** | Model-View-Controller | Controller-Service-Repository-Entity |
| **Frontend** | Templates serveur | Angular MVVM (SPA) |
| **Communication** | Rendu serveur | API REST + JSON |
| **État** | Session serveur | JWT + State management client |
| **Routing** | Serveur | Client-side (Angular Router) |
| **Validation** | Serveur uniquement | Client + Serveur (DTOs) |

---

## 🚀 Avantages de Votre Architecture

1. **Séparation claire** : Frontend et Backend indépendants
2. **Scalabilité** : Chaque partie peut évoluer séparément
3. **Testabilité** : Services et composants facilement testables
4. **Maintenabilité** : Code organisé en modules fonctionnels
5. **Réutilisabilité** : Services et composants réutilisables
6. **Performance** : SPA + API REST optimisées
7. **Sécurité** : Multiples couches de protection
8. **Type Safety** : TypeScript sur toute la stack

---

## 📝 Conclusion

Votre projet **MediConnect** n'utilise pas MVC classique, mais une **architecture moderne en couches** :

- **Backend** : Architecture modulaire NestJS (Controller-Service-Repository)
- **Frontend** : Architecture MVVM Angular (Component-based)
- **Communication** : API REST avec JWT
- **Base de données** : PostgreSQL avec TypeORM

Cette architecture est **plus moderne et adaptée** aux applications web actuelles que le MVC traditionnel, offrant une meilleure séparation des responsabilités, scalabilité et maintenabilité.
