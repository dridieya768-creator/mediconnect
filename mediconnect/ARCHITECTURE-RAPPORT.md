# Architecture du Projet MediConnect
## Section pour le Rapport PFE

---

## 3.5 Architecture Technique

### 3.5.1 Vue d'ensemble de l'architecture

Le projet MediConnect adopte une **architecture client-serveur moderne** basée sur une séparation claire entre le frontend et le backend. Cette architecture suit les principes de l'architecture en couches et implémente des design patterns reconnus pour garantir la maintenabilité, la scalabilité et la testabilité du système.

L'architecture globale se compose de trois couches principales :

1. **Couche Présentation (Frontend)** : Application Angular 17 suivant le pattern MVVM
2. **Couche Application (Backend)** : API REST NestJS suivant le pattern Controller-Service-Repository
3. **Couche Données** : Base de données PostgreSQL avec TypeORM

### 3.5.2 Architecture Backend : Pattern Controller-Service-Repository

Le backend MediConnect utilise le framework NestJS qui implémente une architecture modulaire inspirée du pattern MVC, mais adaptée aux APIs REST modernes. Cette architecture se décompose en quatre couches distinctes :

#### Couche Controller (Présentation)

Les contrôleurs constituent le point d'entrée de l'application. Ils sont responsables de :
- La réception des requêtes HTTP (GET, POST, PUT, DELETE)
- La validation des données entrantes via les DTOs (Data Transfer Objects)
- La délégation de la logique métier aux services
- Le formatage des réponses HTTP

**Exemple : AppointmentsController**
```typescript
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}
  
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointment(dto);
  }
}
```

#### Couche Service (Logique Métier)

Les services encapsulent la logique métier de l'application. Ils orchestrent les opérations complexes et coordonnent les interactions entre différents modules. Leurs responsabilités incluent :
- L'implémentation des règles de gestion
- La coordination des transactions
- L'orchestration des appels aux repositories
- La gestion des notifications et des événements

**Exemple : AppointmentsService**
```typescript
@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    private notificationsService: NotificationsService,
    private emailService: EmailService
  ) {}
  
  async createAppointment(dto: CreateAppointmentDto) {
    // Vérification de la disponibilité
    const isAvailable = await this.checkAvailability(dto);
    if (!isAvailable) throw new ConflictException();
    
    // Création du rendez-vous
    const appointment = this.appointmentRepo.create(dto);
    await this.appointmentRepo.save(appointment);
    
    // Notifications
    await this.notificationsService.notifyDoctor(appointment);
    await this.emailService.sendConfirmation(appointment);
    
    return appointment;
  }
}
```

#### Couche Repository (Accès aux Données)

Les repositories fournissent une abstraction pour l'accès aux données. Ils utilisent TypeORM pour :
- Effectuer les opérations CRUD (Create, Read, Update, Delete)
- Exécuter des requêtes personnalisées
- Gérer les relations entre entités
- Optimiser les performances avec le QueryBuilder

#### Couche Entity (Modèle de Données)

Les entités représentent le modèle de données de l'application. Elles définissent :
- La structure des tables en base de données
- Les relations entre les entités (@ManyToOne, @OneToMany, etc.)
- Les contraintes de validation
- Les hooks de cycle de vie

**Exemple : Appointment Entity**
```typescript
@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  dateHeure: Date;
  
  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;
  
  @ManyToOne(() => Patient, patient => patient.appointments)
  patient: Patient;
  
  @ManyToOne(() => Medecin, medecin => medecin.appointments)
  medecin: Medecin;
}
```

### 3.5.3 Architecture Frontend : Pattern MVVM

Le frontend MediConnect utilise Angular 17 qui implémente le pattern MVVM (Model-View-ViewModel). Cette architecture se compose de trois éléments principaux :

#### View (Vue)

Les templates HTML définissent l'interface utilisateur. Ils utilisent :
- Le data binding bidirectionnel pour synchroniser les données
- Les directives structurelles (*ngIf, *ngFor)
- Les pipes pour la transformation des données
- Les événements pour capturer les interactions utilisateur

#### ViewModel (Composant)

Les composants TypeScript constituent le ViewModel. Ils gèrent :
- L'état local du composant
- La logique de présentation
- Les interactions avec les services
- La validation des formulaires

**Exemple : AppointmentFormComponent**
```typescript
@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html'
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  availableSlots: TimeSlot[] = [];
  
  constructor(
    private fb: FormBuilder,
    private appointmentsService: AppointmentsService
  ) {}
  
  ngOnInit() {
    this.initForm();
    this.loadAvailableSlots();
  }
  
  onSubmit() {
    if (this.appointmentForm.valid) {
      this.appointmentsService.createAppointment(this.appointmentForm.value)
        .subscribe(appointment => {
          // Afficher confirmation
        });
    }
  }
}
```

#### Model (Services et Interfaces)

Les services Angular gèrent :
- Les appels HTTP vers l'API backend
- La gestion d'état de l'application
- Le cache des données
- La communication entre composants

Les interfaces TypeScript définissent la structure des données manipulées par l'application.

### 3.5.4 Organisation Modulaire

#### Modules Backend

Le backend est organisé en modules fonctionnels indépendants :

- **AuthModule** : Authentification JWT, gestion des sessions
- **UsersModule** : Gestion des utilisateurs
- **PatientsModule** : Fonctionnalités spécifiques aux patients
- **MedecinsModule** : Fonctionnalités spécifiques aux médecins
- **AppointmentsModule** : Gestion des rendez-vous
- **PrescriptionsModule** : Gestion des ordonnances
- **NotificationsModule** : Système de notifications en temps réel
- **QrCodesModule** : Génération et validation des QR codes

Chaque module encapsule ses propres contrôleurs, services, entités et DTOs, garantissant une forte cohésion et un faible couplage.

#### Modules Frontend

Le frontend utilise le lazy loading pour optimiser les performances :

- **AuthModule** : Authentification et inscription
- **PatientModule** : Espace patient (lazy loaded)
- **MedecinModule** : Espace médecin (lazy loaded)
- **PharmacieModule** : Espace pharmacie (lazy loaded)
- **CoreModule** : Services globaux et guards
- **SharedModule** : Composants réutilisables

### 3.5.5 Communication Frontend-Backend

La communication entre le frontend et le backend s'effectue via une API REST utilisant le format JSON. Le protocole de communication suit les standards HTTP :

- **GET** : Récupération de ressources
- **POST** : Création de ressources
- **PUT/PATCH** : Modification de ressources
- **DELETE** : Suppression de ressources

L'authentification est gérée via des tokens JWT (JSON Web Tokens) transmis dans les headers HTTP. Un intercepteur Angular ajoute automatiquement le token à chaque requête.

### 3.5.6 Sécurité

L'architecture intègre plusieurs couches de sécurité :

#### Frontend
- AuthGuard pour la protection des routes
- Stockage sécurisé des tokens JWT
- Validation des formulaires côté client
- Gestion des erreurs HTTP

#### Backend
- Authentification JWT avec Passport
- Guards pour la protection des routes (JwtAuthGuard, RolesGuard)
- Validation des DTOs avec class-validator
- Rate limiting pour prévenir les attaques DDoS
- Helmet pour sécuriser les headers HTTP
- Hachage des mots de passe avec bcrypt

#### Base de données
- Contraintes d'intégrité référentielle
- Transactions ACID
- Indexes pour optimiser les performances
- Migrations versionnées avec TypeORM

### 3.5.7 Avantages de l'architecture choisie

Cette architecture moderne présente plusieurs avantages par rapport à une architecture MVC classique :

1. **Séparation des responsabilités** : Chaque couche a un rôle bien défini
2. **Scalabilité** : Frontend et backend peuvent évoluer indépendamment
3. **Testabilité** : Les services et composants sont facilement testables
4. **Maintenabilité** : Code organisé en modules fonctionnels
5. **Réutilisabilité** : Services et composants réutilisables
6. **Performance** : SPA avec lazy loading et API REST optimisée
7. **Type Safety** : TypeScript sur toute la stack garantit la sûreté des types
8. **Évolutivité** : Architecture prête pour une migration vers des microservices

### 3.5.8 Diagrammes d'architecture

Les diagrammes suivants illustrent l'architecture du système :

- **Figure 3.15** : Architecture globale du système
- **Figure 3.16** : Architecture en couches détaillée
- **Figure 3.17** : Organisation modulaire Frontend/Backend
- **Figure 3.18** : Flux de données pour la prise de rendez-vous

---

## Tableau 3.6 – Comparaison Architecture MVC vs Architecture MediConnect

| Aspect | MVC Classique | Architecture MediConnect |
|--------|---------------|--------------------------|
| **Séparation Frontend/Backend** | Couplée (rendu serveur) | Totalement découplée (SPA + API) |
| **Pattern Backend** | Model-View-Controller | Controller-Service-Repository-Entity |
| **Pattern Frontend** | Templates serveur | MVVM (Component-based) |
| **Communication** | Rendu HTML serveur | API REST + JSON |
| **État** | Session serveur | JWT + State management client |
| **Routing** | Serveur uniquement | Client-side (Angular Router) |
| **Validation** | Serveur uniquement | Client + Serveur (DTOs) |
| **Scalabilité** | Limitée (monolithe) | Excellente (découplage) |
| **Performance** | Moyenne | Optimale (SPA + cache) |
| **Testabilité** | Moyenne | Excellente (injection de dépendances) |
| **Type Safety** | Variable | Complète (TypeScript) |

---

## Conclusion

L'architecture de MediConnect combine les meilleures pratiques du développement web moderne. Le pattern Controller-Service-Repository côté backend et le pattern MVVM côté frontend garantissent une application robuste, maintenable et évolutive. Cette architecture modulaire facilite le travail en équipe et permet d'ajouter de nouvelles fonctionnalités sans impacter le code existant.
