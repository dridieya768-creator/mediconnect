import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./pages/landing/landing.component").then((m) => m.LandingComponent),
    pathMatch: "full",
  },

  {
    path: "auth",
    loadChildren: () =>
      import("./modules/auth/auth.routes").then((m) => m.AUTH_ROUTES),
  },
  {
    path: "patient",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./modules/patient/patient.routes").then((m) => m.PATIENT_ROUTES),
  },
  {
    path: "medecin",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./modules/medecin/medecin.routes").then((m) => m.MEDECIN_ROUTES),
  },
  {
    path: "pharmacie",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./modules/pharmacie/pharmacie.routes").then((m) => m.PHARMACIE_ROUTES),
  },
  {
    path: "laboratoire",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./modules/laboratoire/laboratoire.routes").then((m) => m.LABORATOIRE_ROUTES),
  },
  {
    path: "radiologie",
    canActivate: [authGuard],
    loadChildren: () =>
      import("./modules/radiologie/radiologie.routes").then((m) => m.RADIOLOGIE_ROUTES),
  },
  {
    path: "scan/:token",
    loadComponent: () =>
      import("./modules/scan/scan-patient.component").then((m) => m.ScanPatientComponent),
  },
  {
    path: "qr/:token",
    loadComponent: () =>
      import("./modules/patient/pages/qr-public/qr-public.component").then((m) => m.QrPublicComponent),
  },

  // ✅ ADMIN — doit être AVANT le wildcard **
  {
    path: "admin",
    canActivate: [authGuard],
    data: { role: "ADMIN_SYSTEM" },
    loadChildren: () =>
      import("./features/admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },

  {
    path: "procedure/:slug",
    loadComponent: () =>
      import("./pages/procedure/procedure.component").then((m) => m.ProcedureComponent),
  },

  // ⚠️ Wildcard TOUJOURS EN DERNIER
  { path: "**", redirectTo: "/auth/login" },
];