import { Routes } from "@angular/router";

export const LABORATOIRE_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/laboratoire-layout.component").then((m) => m.LaboratoireLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/laboratoire-dashboard.component").then((m) => m.LaboratoireDashboardComponent),
      },
    ],
  },
];
