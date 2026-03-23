import { Routes } from "@angular/router";

export const PATIENT_ROUTES: Routes = [
  {
    path: "",
    loadComponent: () => import("./layout/patient-layout.component")
      .then((m) => m.PatientLayoutComponent),
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () => import("./pages/dashboard/patient-dashboard.component")
          .then((m) => m.PatientDashboardComponent),
      },
      {
        path: "appointments",
        loadComponent: () => import("./pages/appointments/patient-appointments.component")
          .then((m) => (m as any).PatientAppointmentsComponent ?? (m as any).default),
      },
      {
        path: "dossier",
        loadComponent: () => import("./pages/dossier/patient-dossier.component")
          .then((m) => m.PatientDossierComponent),
      },
      {
        path: "prescriptions",
        loadComponent: () => import("./pages/prescriptions/patient-prescriptions.component")
          .then((m) => m.PatientPrescriptionsComponent),
      },
      {
        path: "notifications",
        loadComponent: () => import("./pages/notifications/patient-notifications.component")
          .then((m) => m.PatientNotificationsComponent),
      },
    ],
  },
];