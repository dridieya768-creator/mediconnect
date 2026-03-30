"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ScanMedecinComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var ScanMedecinComponent = /** @class */ (function () {
    function ScanMedecinComponent() {
        this.route = core_1.inject(router_1.ActivatedRoute);
        this.http = core_1.inject(http_1.HttpClient);
        this.loading = core_1.signal(true);
        this.medecin = core_1.signal(null);
    }
    ScanMedecinComponent.prototype.ngOnInit = function () {
        var _this = this;
        var _a;
        var medecinId = (_a = this.route.snapshot.paramMap.get("id")) !== null && _a !== void 0 ? _a : this.route.snapshot.queryParams["id"];
        if (!medecinId) {
            this.loading.set(false);
            return;
        }
        this.http.get("/api/v1/medecins/" + medecinId + "/public").subscribe({
            next: function (res) {
                var _a;
                var data = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
                if (data)
                    _this.medecin.set(data);
                _this.loading.set(false);
            },
            error: function () { return _this.loading.set(false); }
        });
    };
    ScanMedecinComponent.prototype.getInitials = function () {
        var _a, _b, _c, _d;
        var m = this.medecin();
        if (!m)
            return "M";
        return ("" + ((_b = (_a = m.firstName) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "") + ((_d = (_c = m.lastName) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : "")).toUpperCase();
    };
    ScanMedecinComponent.prototype.getSpecialiteLabel = function () {
        var _a, _b, _c;
        var role = (_b = (_a = this.medecin()) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : "";
        var labels = {
            MEDECIN_GENERALISTE: "Médecin Généraliste",
            MEDECIN_SPECIALISTE: "Médecin Spécialiste",
            MEDECIN_CHEF_SERVICE: "Médecin Chef de Service"
        };
        return labels[role] || ((_c = this.medecin()) === null || _c === void 0 ? void 0 : _c.specialite) || role;
    };
    ScanMedecinComponent = __decorate([
        core_1.Component({
            selector: "app-scan-medecin",
            standalone: true,
            imports: [common_1.CommonModule],
            template: "\n    <div style=\"min-height:100vh; background:#f0f4ff; display:flex; justify-content:center; align-items:center; padding:24px;\">\n      <div style=\"background:white; border-radius:20px; padding:36px; max-width:460px; width:100%; box-shadow:0 8px 32px rgba(79,70,229,0.12);\">\n\n        <!-- Header -->\n        <div style=\"text-align:center; margin-bottom:28px;\">\n          <div style=\"font-size:30px; font-weight:800; color:#0f172a;\">\uD83C\uDFE5 MediConnect</div>\n          <div style=\"color:#64748b; font-size:13px; margin-top:4px;\">Profil M\u00E9decin V\u00E9rifi\u00E9</div>\n        </div>\n\n        <!-- Chargement -->\n        @if (loading()) {\n          <div style=\"text-align:center; color:#64748b; padding:40px 0;\">\n            <div style=\"font-size:32px; margin-bottom:12px;\">\u23F3</div>\n            <div>Chargement du profil...</div>\n          </div>\n        }\n\n        <!-- Erreur -->\n        @if (!loading() && !medecin()) {\n          <div style=\"text-align:center; background:#fef2f2; border-radius:12px; padding:24px; color:#dc2626;\">\n            <div style=\"font-size:32px; margin-bottom:8px;\">\u274C</div>\n            <div style=\"font-weight:700; margin-bottom:4px;\">QR code invalide ou expir\u00E9</div>\n            <div style=\"font-size:13px; color:#94a3b8;\">Ce m\u00E9decin n'est pas enregistr\u00E9 sur MediConnect</div>\n          </div>\n        }\n\n        <!-- Profil m\u00E9decin -->\n        @if (medecin()) {\n          <div>\n\n            <!-- Avatar + nom -->\n            <div style=\"background:linear-gradient(135deg,#eef2ff,#e0e7ff); border-radius:16px; padding:20px; margin-bottom:20px; text-align:center;\">\n              <div style=\"width:72px; height:72px; background:linear-gradient(135deg,#4f46e5,#7c3aed); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; color:white; margin:0 auto 12px;\">\n                {{ getInitials() }}\n              </div>\n              <div style=\"font-size:22px; font-weight:800; color:#0f172a;\">\n                Dr. {{ medecin()?.firstName }} {{ medecin()?.lastName }}\n              </div>\n              <div style=\"margin-top:6px;\">\n                <span style=\"background:#4f46e5; color:white; padding:4px 14px; border-radius:20px; font-size:12px; font-weight:700;\">\n                  {{ getSpecialiteLabel() }}\n                </span>\n              </div>\n\n              <!-- Badge v\u00E9rifi\u00E9 -->\n              <div style=\"margin-top:10px; display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:20px; padding:4px 12px; font-size:12px; color:#16a34a; font-weight:700;\">\n                \u2705 M\u00E9decin v\u00E9rifi\u00E9 \u2014 MediConnect\n              </div>\n            </div>\n\n            <!-- Informations -->\n            <div style=\"display:flex; flex-direction:column; gap:10px;\">\n\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                <span style=\"color:#64748b; font-size:13px;\">\uD83D\uDCE7 Email professionnel</span>\n                <span style=\"font-weight:600; font-size:13px; color:#0f172a;\">{{ medecin()?.email }}</span>\n              </div>\n\n              @if (medecin()?.phone) {\n                <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                  <span style=\"color:#64748b; font-size:13px;\">\uD83D\uDCDE T\u00E9l\u00E9phone</span>\n                  <span style=\"font-weight:600; font-size:13px; color:#0f172a;\">{{ medecin()?.phone }}</span>\n                </div>\n              }\n\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                <span style=\"color:#64748b; font-size:13px;\">\uD83C\uDFF7\uFE0F Sp\u00E9cialit\u00E9</span>\n                <span style=\"font-weight:600; font-size:13px; color:#0f172a;\">{{ getSpecialiteLabel() }}</span>\n              </div>\n\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                <span style=\"color:#64748b; font-size:13px;\">\uD83D\uDCC5 Membre depuis</span>\n                <span style=\"font-weight:600; font-size:13px; color:#0f172a;\">{{ medecin()?.createdAt | date:'MMMM yyyy' : '' : 'fr' }}</span>\n              </div>\n\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                <span style=\"color:#64748b; font-size:13px;\">\uD83D\uDCCC Statut</span>\n                <span style=\"background:#f0fdf4; color:#16a34a; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700;\">\n                  \u2705 Compte actif et v\u00E9rifi\u00E9\n                </span>\n              </div>\n\n              @if (medecin()?.ville) {\n                <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border-radius:10px; border:1px solid #f1f5f9;\">\n                  <span style=\"color:#64748b; font-size:13px;\">\uD83D\uDCCD Ville</span>\n                  <span style=\"font-weight:600; font-size:13px; color:#0f172a;\">{{ medecin()?.ville }}</span>\n                </div>\n              }\n\n              @if (medecin()?.teleconsultation) {\n                <div style=\"display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#eef2ff; border-radius:10px; border:1px solid #c7d2fe;\">\n                  <span style=\"color:#4f46e5; font-size:13px; font-weight:600;\">\uD83D\uDCBB T\u00E9l\u00E9consultation</span>\n                  <span style=\"background:#4f46e5; color:white; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700;\">\n                    Disponible\n                  </span>\n                </div>\n              }\n\n            </div>\n\n            <!-- Footer -->\n            <div style=\"margin-top:24px; padding-top:16px; border-top:1px solid #f1f5f9; text-align:center; font-size:11px; color:#94a3b8; line-height:1.6;\">\n              Ce QR code certifie que ce m\u00E9decin est enregistr\u00E9 et v\u00E9rifi\u00E9 sur la plateforme MediConnect.<br>\n              Informations confidentielles \u2014 Ne pas partager.\n            </div>\n\n          </div>\n        }\n\n      </div>\n    </div>\n  "
        })
    ], ScanMedecinComponent);
    return ScanMedecinComponent;
}());
exports.ScanMedecinComponent = ScanMedecinComponent;
