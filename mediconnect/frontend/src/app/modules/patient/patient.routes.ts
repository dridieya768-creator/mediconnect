import { Routes } from "@angular/router";
// v2
export const PATIENT_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/patient-layout.component").then((m) => m.PatientLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/patient-dashboard.component").then((m) => m.PatientDashboardComponent),
      },
      {
        path: "appointments",
        loadComponent: () =>
          import("./pages/appointments/patient-appointments.component").then((m) => m.PatientAppointmentsComponent),
      },
      {
        path: "dossier",
        loadComponent: () =>
          import("./pages/dossier/patient-dossier.component").then((m) => m.PatientDossierComponent),
      },
      {
        path: "notifications",
        loadComponent: () =>
          import("./pages/notifications/patient-notifications.component").then((m) => m.PatientNotificationsComponent),
      },
    
      {
        path: "recherche",
        loadComponent: () =>
          import("./pages/search/patient-search-medecin.component").then((m) => m.PatientSearchMedecinComponent),
      },
      
      {
        path: "profil",
        loadComponent: () =>
          import("./pages/profile/patient-profile.component").then((m) => m.PatientProfileComponent),
      },
      
      {
        path: "prescriptions",
        loadComponent: () =>
          import("./pages/prescriptions/patient-prescriptions.component").then((m) => m.PatientPrescriptionsComponent),
      },
      {
        path: "video/:id",
        loadComponent: () =>
          import("./pages/video/teleconsultation.component").then((m) => m.TeleconsultationComponent),
      },
      {
        path: "guide-medecin",
        loadComponent: () =>
          import("./pages/guide-medecin/guide-medecin.component").then((m) => m.GuideMedecinComponent),
      },
      {
        path: "paiement",
        loadComponent: () =>
          import("./pages/paiement/paiement.component").then((m) => m.PaiementComponent),
      },
      {
        path: "famille",
        loadComponent: () =>
          import("./pages/famille/famille.component").then((m) => m.FamilleComponent),
      },
      {
        path: "pharmacies",
        loadComponent: () =>
          import("./pages/pharmacies/patient-pharmacies.component").then((m) => m.PatientPharmaciesComponent),
      },
      {
        path: "securite",
        loadComponent: () =>
          import("./pages/securite/patient-securite.component").then((m) => m.PatientSecuriteComponent),
      },
    ],
  },
];