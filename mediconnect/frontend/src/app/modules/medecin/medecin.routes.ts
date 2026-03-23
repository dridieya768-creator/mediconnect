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
      // ── Sprint 2 : Planning & RDV ──────────────────────────────────────────
      {
        path: "planning",
        loadComponent: () =>
          import("./planning/medecin-planning.component").then((m) => m.MedecinPlanningComponent),
      },
      // ── Alias pour la nav sidebar ──────────────────────────────────────────
      {
        path: "appointments",
        redirectTo: "planning",
        pathMatch: "full",
      },
    ],
  },
];