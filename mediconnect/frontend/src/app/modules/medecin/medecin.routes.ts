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
      // Route prescriptions médecin
      {
        path: "prescriptions",
        loadComponent: () =>
          import("./pages/ordonnance-form.component").then((m) => m.OrdonnanceFormComponent),
      },
    ],
  },
];