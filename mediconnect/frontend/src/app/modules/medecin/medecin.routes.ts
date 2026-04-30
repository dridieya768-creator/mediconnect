import { Routes } from "@angular/router";

export const MEDECIN_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/medecin-layout.component").then((m) => m.MedecinLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/medecin-dashboard.component").then((m) => m.MedecinDashboardComponent),
      },
      {
        path: "planning",
        loadComponent: () =>
          import("./planning/medecin-planning.component").then((m) => m.MedecinPlanningComponent),
      },
      {
        path: "appointments",
        redirectTo: "planning",
        pathMatch: "full",
      },
      // ✅ Nouvelle route profil
      {
        path: "profil",
        loadComponent: () =>
          import("./pages/profile/medecin-profile.component").then((m) => m.MedecinProfileComponent),
      },
      {
  path: "scan/:id",
  loadComponent: () => import("src/app/modules/medecin/scan/scan-medecin.component")
    .then(m => m.ScanMedecinComponent),
     },
    {
  path: "patients",
  loadComponent: () =>
    import("./medecin-patients.component").then((m) => m.MedecinPatientsComponent),
},
      {
  path: "patients/:id",
  loadComponent: () =>
    import("./pages/patient-profile/medecin-patient-profile.component").then((m) => m.MedecinPatientProfileComponent),
},
      // Route prescriptions médecin
      {
        path: "prescriptions",
        loadComponent: () =>
          import("./pages/prescriptions/ordonnance-form.component").then((m) => m.OrdonnanceFormComponent),
      },
      {
        path: "video/:id",
        loadComponent: () =>
          import("./pages/video/teleconsultation-medecin.component").then((m) => m.TeleconsultationMedecinComponent),
      },
    ],
  },
];