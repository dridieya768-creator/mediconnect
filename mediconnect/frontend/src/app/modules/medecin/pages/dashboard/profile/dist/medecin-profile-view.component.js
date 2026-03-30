"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinProfileViewComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var router_1 = require("@angular/router");
var medecin_qrcode_component_1 = require("src/app/modules/medecin/qrcode/medecin-qrcode.component");
var MedecinProfileViewComponent = /** @class */ (function () {
    function MedecinProfileViewComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.profile = core_1.signal(null);
        this.isLoading = core_1.signal(true);
    }
    MedecinProfileViewComponent.prototype.ngOnInit = function () { this.loadProfile(); };
    MedecinProfileViewComponent.prototype.loadProfile = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c;
            var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
            if (data) {
                _this.profile.set(data.profile);
            }
            _this.isLoading.set(false);
        });
    };
    MedecinProfileViewComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-profile-view",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink, medecin_qrcode_component_1.MedecinQrcodeComponent],
            template: "\n    <div class=\"profile-view-container\">\n      <div class=\"profile-header\">\n        <div class=\"header-content\">\n          <h1 class=\"page-title\">\uD83D\uDC68\u200D\u2695\uFE0F Mon Profil Professionnel</h1>\n          <button class=\"btn-edit\" routerLink=\"/medecin/profil/edit\">\n            \u270F\uFE0F Modifier mon profil\n          </button>\n        </div>\n        <p class=\"page-subtitle\">Consultez et g\u00E9rez vos informations professionnelles</p>\n      </div>\n\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div>\n        <p>Chargement de votre profil...</p>\n      </div>\n\n      <div class=\"profile-content\" *ngIf=\"!isLoading() && profile()\">\n        <div class=\"profile-section\">\n          <div class=\"section-header\">\n            <span class=\"section-icon\">\uD83E\uDEAA</span>\n            <h2>Identit\u00E9 Professionnelle</h2>\n          </div>\n          <div class=\"section-body\">\n            <div class=\"info-grid\">\n              <div class=\"info-item\" *ngIf=\"profile()?.titre\">\n                <span class=\"info-label\">Titre</span>\n                <span class=\"info-value\">{{ profile()?.titre }}</span>\n              </div>\n              <div class=\"info-item\" *ngIf=\"profile()?.specialite\">\n                <span class=\"info-label\">Sp\u00E9cialit\u00E9</span>\n                <span class=\"info-value\">{{ profile()?.specialite }}</span>\n              </div>\n              <div class=\"info-item\" *ngIf=\"profile()?.numeroOrdrePro\">\n                <span class=\"info-label\">N\u00B0 Ordre</span>\n                <span class=\"info-value\">{{ profile()?.numeroOrdrePro }}</span>\n              </div>\n              <div class=\"info-item\" *ngIf=\"profile()?.languesParlees\">\n                <span class=\"info-label\">Langues</span>\n                <span class=\"info-value\">{{ profile()?.languesParlees }}</span>\n              </div>\n              <div class=\"info-item full-width\" *ngIf=\"profile()?.diplomes\">\n                <span class=\"info-label\">Dipl\u00F4mes</span>\n                <span class=\"info-value\">{{ profile()?.diplomes }}</span>\n              </div>\n              <div class=\"info-item full-width\" *ngIf=\"profile()?.biographie\">\n                <span class=\"info-label\">Biographie</span>\n                <span class=\"info-value\">{{ profile()?.biographie }}</span>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"profile-section\" *ngIf=\"profile()?.ville || profile()?.adresseCabinet\">\n          <div class=\"section-header\">\n            <span class=\"section-icon\">\uD83D\uDCCD</span>\n            <h2>Cabinet & Localisation</h2>\n          </div>\n          <div class=\"section-body\">\n            <div class=\"info-grid\">\n              <div class=\"info-item\" *ngIf=\"profile()?.ville\">\n                <span class=\"info-label\">Ville</span>\n                <span class=\"info-value\">{{ profile()?.ville }}</span>\n              </div>\n              <div class=\"info-item full-width\" *ngIf=\"profile()?.adresseCabinet\">\n                <span class=\"info-label\">Adresse</span>\n                <span class=\"info-value\">{{ profile()?.adresseCabinet }}</span>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"profile-section\" *ngIf=\"profile()?.telephonePro || profile()?.emailPro\">\n          <div class=\"section-header\">\n            <span class=\"section-icon\">\uD83D\uDCDE</span>\n            <h2>Contact Professionnel</h2>\n          </div>\n          <div class=\"section-body\">\n            <div class=\"info-grid\">\n              <div class=\"info-item\" *ngIf=\"profile()?.telephonePro\">\n                <span class=\"info-label\">T\u00E9l\u00E9phone</span>\n                <span class=\"info-value\">{{ profile()?.telephonePro }}</span>\n              </div>\n              <div class=\"info-item\" *ngIf=\"profile()?.emailPro\">\n                <span class=\"info-label\">Email</span>\n                <span class=\"info-value\">{{ profile()?.emailPro }}</span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  ",
            styles: ["\n    .profile-view-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }\n    .profile-header { margin-bottom: 2rem; }\n    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }\n    .page-title { font-size: 2rem; font-weight: 700; color: #0f172a; margin: 0; }\n    .page-subtitle { color: #64748b; margin: 0.5rem 0 0 0; }\n    .btn-edit { padding: 0.75rem 1.5rem; background: #4f46e5; color: white; border: none; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; }\n    .btn-edit:hover { background: #4338ca; }\n    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 4rem; gap: 1rem; }\n    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin 0.8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n    .profile-section { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; overflow: hidden; }\n    .section-header { padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }\n    .section-header h2 { font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0; }\n    .section-icon { font-size: 1.25rem; margin-right: 0.75rem; }\n    .section-body { padding: 1.5rem; }\n    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }\n    .info-item { display: flex; flex-direction: column; gap: 0.25rem; }\n    .info-item.full-width { grid-column: 1 / -1; }\n    .info-label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; }\n    .info-value { font-size: 0.875rem; color: #0f172a; }\n    @media (max-width: 768px) { .info-grid { grid-template-columns: 1fr; } }\n  "]
        })
    ], MedecinProfileViewComponent);
    return MedecinProfileViewComponent;
}());
exports.MedecinProfileViewComponent = MedecinProfileViewComponent;
