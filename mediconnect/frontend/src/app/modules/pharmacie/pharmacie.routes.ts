import { Routes } from "@angular/router";

export const PHARMACIE_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/pharmacie-layout.component").then((m) => m.PharmacieLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/pharmacie-dashboard.component").then((m) => m.PharmacieDashboardComponent),
      },
    ],
  },
];
