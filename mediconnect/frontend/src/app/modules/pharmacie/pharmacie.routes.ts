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
      {
        path: "scan",
        loadComponent: () =>
          import("./pages/scanner/scanner-pharmacie.component").then((m) => m.ScannerPharmacieComponent),
      },
      {
        path: "delivrance",
        loadComponent: () =>
          import("./pages/delivrance/delivrance-workflow.component").then((m) => m.DelivranceWorkflowComponent),
      },
      {
        path: "stock",
        loadComponent: () =>
          import("./pages/stock/stock.component").then((m) => m.StockComponent),
      },
    ],
  },
];
