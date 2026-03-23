import { Routes } from "@angular/router";

export const RADIOLOGIE_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/radiologie-layout.component").then((m) => m.RadiologieLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/radiologie-dashboard.component").then((m) => m.RadiologieDashboardComponent),
      },
    ],
  },
];
