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
    data :{roles:['PATIENT']},
    loadChildren: () =>
      import("./modules/patient/patient.routes").then((m) => m.PATIENT_ROUTES),
  },
  {
    path: "medecin",
    canActivate: [authGuard],
    data :{roles:['MEDECIN_GENERALISTE',"MEDECIN_SPECIALISTE",'MEDECIN']},
    loadChildren: () =>
      import("./modules/medecin/medecin.routes").then((m) => m.MEDECIN_ROUTES),
  },
  {
    path: "pharmacie",
    canActivate: [authGuard],
    data :{roles:['PHARMACIEN']},
    loadChildren: () =>
      import("./modules/pharmacie/pharmacie.routes").then((m) => m.PHARMACIE_ROUTES),
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
  {
    path: "admin",
    canActivate: [authGuard],
    data :{roles:['ADMIN']},
    loadChildren: () =>
      import("./features/admin/admin.routes").then((m) => m.ADMIN_ROUTES),
  },

  {
    path: "procedure/:slug",
    loadComponent: () =>
      import("./pages/procedure/procedure.component").then((m) => m.ProcedureComponent),
  },

  {
    path: "partage-dossier",
    loadComponent: () =>
      import("./pages/partage-dossier/partage-dossier.component").then((m) => m.PartageDossierComponent),
  },
  {
    path:'unauthorized',
    loadComponent:()=> 
      import("./pages/unauthorized").then((m) => m.Unauthorized),
  },
  { path: "**", redirectTo: "/auth/login" },
];