"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SidebarComponent = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var common_1 = require("@angular/common");
var auth_service_1 = require("@core/services/auth.service");
var SidebarComponent = /** @class */ (function () {
    function SidebarComponent() {
        this.portalName = "Portail";
        this.portalIcon = "🏥";
        this.brandColor = "#0d9488";
        this.navSections = [];
        // ✅ Route du profil — chaque portail passe sa propre route
        this.profileRoute = "/medecin/profil";
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.currentUser = this.authService.currentUser;
    }
    SidebarComponent.prototype.logout = function () {
        this.authService.logout();
    };
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "portalName");
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "portalIcon");
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "brandColor");
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "navSections");
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "establishmentName");
    __decorate([
        core_1.Input()
    ], SidebarComponent.prototype, "profileRoute");
    SidebarComponent = __decorate([
        core_1.Component({
            selector: "app-sidebar",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink, router_1.RouterLinkActive],
            templateUrl: "./sidebar.component.html",
            styleUrls: ["./sidebar.component.scss"]
        })
    ], SidebarComponent);
    return SidebarComponent;
}());
exports.SidebarComponent = SidebarComponent;
