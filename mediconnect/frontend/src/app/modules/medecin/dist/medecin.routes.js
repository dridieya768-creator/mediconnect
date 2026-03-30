"use strict";
exports.__esModule = true;
exports.MEDECIN_ROUTES = void 0;
exports.MEDECIN_ROUTES = [
    {
        path: "",
        loadComponent: function () {
            return Promise.resolve().then(function () { return require("./layout/medecin-layout.component"); }).then(function (m) { return m.MedecinLayoutComponent; });
        },
        children: [
            { path: "", redirectTo: "dashboard", pathMatch: "full" },
            {
                path: "dashboard",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/dashboard/medecin-dashboard.component"); }).then(function (m) { return m.MedecinDashboardComponent; });
                }
            },
            {
                path: "planning",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./planning/medecin-planning.component"); }).then(function (m) { return m.MedecinPlanningComponent; });
                }
            },
            {
                path: "appointments",
                redirectTo: "planning",
                pathMatch: "full"
            },
            // ✅ Nouvelle route profil
            {
                path: "profil",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./pages/profile/medecin-profile.component"); }).then(function (m) { return m.MedecinProfileComponent; });
                }
            },
            {
                path: "scan/:id",
                loadComponent: function () { return Promise.resolve().then(function () { return require("src/app/modules/medecin/scan/scan-medecin.component"); }).then(function (m) { return m.ScanMedecinComponent; }); }
            },
            {
                path: "patients",
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require("./medecin-patients.component"); }).then(function (m) { return m.MedecinPatientsComponent; });
                }
            },
        ]
    },
];
