"use strict";
exports.__esModule = true;
exports.PATIENT_ROUTES = void 0;
exports.PATIENT_ROUTES = [
    {
        path: "",
        loadComponent: function () {
            return Promise.resolve().then(function () { return require("./layout/patient-layout.component"); }).then(function (m) { return m.PatientLayoutComponent; });
        },
        children: [
            { path: "", redirectTo: "dashboard", pathMatch: "full" },
            {
                path: "dashboard",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/dashboard/patient-dashboard.component"); }).then(function (m) { return m.PatientDashboardComponent; });
                }
            },
            {
                path: "appointments",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/appointments/patient-appointments.component"); }).then(function (m) { return m.PatientAppointmentsComponent; });
                }
            },
            {
                path: "dossier",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/dossier/patient-dossier.component"); }).then(function (m) { return m.PatientDossierComponent; });
                }
            },
            {
                path: "notifications",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/notifications/patient-notifications.component"); }).then(function (m) { return m.PatientNotificationsComponent; });
                }
            },
            // ✅ Nouvelle route recherche médecin
            {
                path: "recherche",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/search/patient-search-medecin.component"); }).then(function (m) { return m.PatientSearchMedecinComponent; });
                }
            },
        ]
    },
];
