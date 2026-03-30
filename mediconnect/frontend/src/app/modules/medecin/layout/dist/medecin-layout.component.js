"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinLayoutComponent = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var sidebar_component_1 = require("@shared/components/sidebar/sidebar.component");
var MedecinLayoutComponent = /** @class */ (function () {
    function MedecinLayoutComponent() {
        this.navSections = [
            {
                label: "Principal",
                items: [
                    { icon: "📊", label: "Tableau de bord", route: "/medecin/dashboard" },
                    { icon: "📅", label: "Planning", route: "/medecin/planning" },
                    { icon: "👥", label: "Patients", route: "/medecin/patients" },
                    { icon: "💊", label: "Prescriptions", route: "/medecin/prescriptions" },
                ]
            },
            {
                label: "Mon Compte",
                items: [
                    { icon: "👨‍⚕️", label: "Mon Profil", route: "/medecin/profil" },
                ]
            },
        ];
    }
    MedecinLayoutComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-layout",
            standalone: true,
            imports: [router_1.RouterOutlet, sidebar_component_1.SidebarComponent],
            template: "\n    <app-sidebar\n      portalName=\"Portail M\u00E9decin\"\n      portalIcon=\"\uD83D\uDC68\u200D\u2695\uFE0F\"\n      brandColor=\"#4f46e5\"\n      [navSections]=\"navSections\"\n    />\n    <div class=\"page-container\">\n      <router-outlet />\n    </div>\n  "
        })
    ], MedecinLayoutComponent);
    return MedecinLayoutComponent;
}());
exports.MedecinLayoutComponent = MedecinLayoutComponent;
