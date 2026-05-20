"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinPatientProfileComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MedecinPatientProfileComponent = /** @class */ (function () {
    function MedecinPatientProfileComponent() {
        var _this = this;
        this.route = core_1.inject(router_1.ActivatedRoute);
        this.router = core_1.inject(router_1.Router);
        this.http = core_1.inject(http_1.HttpClient);
        this.patient = core_1.signal(null);
        this.loading = core_1.signal(true);
        this.newObservation = '';
        this.obsSaving = core_1.signal(false);
        this.obsSaved = core_1.signal(false);
        this.obsError = core_1.signal(null);
        this.patientId = '';
        this.permissions = core_1.signal({ allergies: false, documents: false, observations: false });
        this.initials = function () {
            var _a, _b, _c, _d;
            var p = _this.patient();
            if (!p)
                return '?';
            return ("" + ((_b = (_a = p.firstName) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '') + ((_d = (_c = p.lastName) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '')).toUpperCase() || '?';
        };
    }
    MedecinPatientProfileComponent.prototype.ngOnInit = function () {
        var _this = this;
        var userId = this.route.snapshot.paramMap.get('id');
        if (!userId) {
            this.loading.set(false);
            return;
        }
        this.patientId = userId;
        this.http.get("/api/v1/patients/" + userId)
            .pipe(operators_1.catchError(function (err) {
            console.error('[MedecinPatientProfile] GET /patients error:', err);
            return rxjs_1.of(null);
        }))
            .subscribe(function (res) {
            var _a, _b, _c, _d;
            console.log('[MedecinPatientProfile] GET /patients response:', JSON.stringify(res));
            var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : null;
            _this.patient.set(data);
            if (data === null || data === void 0 ? void 0 : data.id)
                _this.patientId = data.id;
            _this.newObservation = (_d = data === null || data === void 0 ? void 0 : data.observationsMedecin) !== null && _d !== void 0 ? _d : '';
            _this.loading.set(false);
            // Charger les permissions accordées par ce patient au médecin connecté
            if (data === null || data === void 0 ? void 0 : data.id) {
                _this.http.get("/api/v1/dossier-medical/" + data.id + "/acces/my-permissions")
                    .pipe(operators_1.catchError(function (err) {
                    console.error('[MedecinPatientProfile] my-permissions error:', err === null || err === void 0 ? void 0 : err.status, err === null || err === void 0 ? void 0 : err.error);
                    return rxjs_1.of(null);
                }))
                    .subscribe(function (r) {
                    var _a, _b;
                    console.log('[MedecinPatientProfile] my-permissions response:', JSON.stringify(r));
                    var perms = (_b = (_a = r === null || r === void 0 ? void 0 : r.data) === null || _a === void 0 ? void 0 : _a.permissions) !== null && _b !== void 0 ? _b : r === null || r === void 0 ? void 0 : r.permissions;
                    if (perms) {
                        _this.permissions.set(perms);
                    }
                });
            }
        });
    };
    MedecinPatientProfileComponent.prototype.saveObservation = function () {
        var _this = this;
        if (!this.newObservation.trim() || !this.patientId)
            return;
        this.obsSaving.set(true);
        this.obsSaved.set(false);
        this.obsError.set(null);
        this.http.patch("/api/v1/patients/" + this.patientId + "/observations", {
            observationsMedecin: this.newObservation.trim()
        }).pipe(operators_1.catchError(function (err) {
            var _a;
            _this.obsError.set(((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) || 'Erreur lors de l\'enregistrement');
            _this.obsSaving.set(false);
            return rxjs_1.of(null);
        })).subscribe(function (res) {
            if (res) {
                _this.obsSaved.set(true);
                _this.patient.update(function (p) { return (__assign(__assign({}, p), { observationsMedecin: _this.newObservation.trim() })); });
                setTimeout(function () { return _this.obsSaved.set(false); }, 3000);
            }
            _this.obsSaving.set(false);
        });
    };
    MedecinPatientProfileComponent.prototype.goBack = function () { this.router.navigate(['/medecin/patients']); };
    MedecinPatientProfileComponent.prototype.formatDate = function (d) {
        if (!d)
            return '—';
        return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    };
    MedecinPatientProfileComponent = __decorate([
        core_1.Component({
            selector: 'app-medecin-patient-profile',
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            template: "\n    <div class=\"profile-page\">\n\n      <div class=\"back-bar\">\n        <button class=\"btn-back\" (click)=\"goBack()\">\u2190 Retour</button>\n      </div>\n\n      <div class=\"loading-state\" *ngIf=\"loading()\">\n        <div class=\"spinner\"></div>\n        <p>Chargement du profil...</p>\n      </div>\n\n      <div class=\"error-state\" *ngIf=\"!loading() && !patient()\">\n        <p>Profil patient introuvable.</p>\n      </div>\n\n      <div class=\"content\" *ngIf=\"!loading() && patient()\">\n\n        <!-- Header patient -->\n        <div class=\"patient-header\">\n          <div class=\"avatar\">\n            <img *ngIf=\"patient()?.avatarUrl\" [src]=\"patient()?.avatarUrl\" alt=\"photo\">\n            <span *ngIf=\"!patient()?.avatarUrl\">{{ initials() }}</span>\n          </div>\n          <div class=\"patient-info\">\n            <h1>{{ patient()?.firstName }} {{ patient()?.lastName }}</h1>\n            <p class=\"patient-email\">{{ patient()?.email }}</p>\n            <div class=\"patient-tags\">\n              <span class=\"tag\" *ngIf=\"patient()?.sexe\">{{ patient()?.sexe === 'M' ? 'Homme' : 'Femme' }}</span>\n              <span class=\"tag\" *ngIf=\"patient()?.ville\">{{ patient()?.ville }}</span>\n              <span class=\"tag blood\" *ngIf=\"patient()?.groupeSanguin\">{{ patient()?.groupeSanguin }}</span>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"cards-grid\">\n\n          <!-- Infos g\u00E9n\u00E9rales -->\n          <div class=\"card\">\n            <div class=\"card-title\">Informations g\u00E9n\u00E9rales</div>\n            <div class=\"info-row\"><span class=\"label\">T\u00E9l\u00E9phone</span><span>{{ patient()?.telephone || '\u2014' }}</span></div>\n            <div class=\"info-row\"><span class=\"label\">Date de naissance</span><span>{{ formatDate(patient()?.dateNaissance) }}</span></div>\n            <div class=\"info-row\"><span class=\"label\">Ville</span><span>{{ patient()?.ville || '\u2014' }}</span></div>\n            <div class=\"info-row\"><span class=\"label\">NSS</span><span>{{ patient()?.nss || '\u2014' }}</span></div>\n          </div>\n\n          <!-- Informations m\u00E9dicales -->\n          <div class=\"card\">\n            <div class=\"card-title\">Informations m\u00E9dicales</div>\n            <div class=\"info-row\"><span class=\"label\">Groupe sanguin</span><span class=\"blood-badge\">{{ patient()?.groupeSanguin || '\u2014' }}</span></div>\n\n            <ng-container *ngIf=\"permissions().allergies\">\n            <div class=\"section-label\">Allergies</div>\n            <div class=\"tags-list\" *ngIf=\"patient()?.allergies?.length\">\n              <span class=\"tag-item allergy\" *ngFor=\"let a of patient()?.allergies\">{{ a }}</span>\n            </div>\n            <p class=\"empty-text\" *ngIf=\"!patient()?.allergies?.length\">Aucune allergie connue</p>\n\n            <div class=\"section-label\">Maladies chroniques</div>\n            <div class=\"tags-list\" *ngIf=\"patient()?.maladiesChroniques?.length\">\n              <span class=\"tag-item chronic\" *ngFor=\"let m of patient()?.maladiesChroniques\">{{ m }}</span>\n            </div>\n            <p class=\"empty-text\" *ngIf=\"!patient()?.maladiesChroniques?.length\">Aucune maladie chronique</p>\n            </ng-container>\n            <div *ngIf=\"!permissions().allergies\" class=\"no-access-msg\"> Acc\u00E8s non autoris\u00E9 par le patient</div>\n          </div>\n\n          <!-- M\u00E9dicaments actuels -->\n          <div class=\"card card-full\">\n            <div class=\"card-title\">M\u00E9dicaments actuels</div>\n            <div *ngIf=\"patient()?.medicamentsActuels?.length\">\n              <div class=\"med-item\" *ngFor=\"let m of patient()?.medicamentsActuels\">\n                <span class=\"med-name\">{{ m?.nom || m?.name || m }}</span>\n                <span class=\"med-dose\" *ngIf=\"m?.dose\">{{ m.dose }}</span>\n              </div>\n            </div>\n            <p class=\"empty-text\" *ngIf=\"!patient()?.medicamentsActuels?.length\">Aucun m\u00E9dicament en cours</p>\n          </div>\n\n          <!-- Documents m\u00E9dicaux -->\n          <div class=\"card card-full\" *ngIf=\"permissions().documents\">\n            <div class=\"card-title\"> Documents m\u00E9dicaux</div>\n            <div *ngIf=\"patient()?.documents?.length\">\n              <div class=\"doc-item\" *ngFor=\"let d of patient()?.documents\">\n                <span class=\"doc-icon\"></span>\n                <div class=\"doc-info\">\n                  <div class=\"doc-name\">{{ d.name }}</div>\n                  <div class=\"doc-date\">{{ d.uploadedAt ? formatDate(d.uploadedAt) : '' }}</div>\n                </div>\n                <a class=\"btn-dl\" [href]=\"d.url\" target=\"_blank\">\u2B07 T\u00E9l\u00E9charger</a>\n              </div>\n            </div>\n            <p class=\"empty-text\" *ngIf=\"!patient()?.documents?.length\">Aucun document partag\u00E9</p>\n          </div>\n          <div class=\"card card-full\" *ngIf=\"!permissions().documents\">\n            <div class=\"card-title\"> Documents m\u00E9dicaux</div>\n            <div class=\"no-access-msg\"> Acc\u00E8s non autoris\u00E9 par le patient</div>\n          </div>\n\n          <!-- Observations m\u00E9decin -->\n          <div class=\"card card-full\">\n            <div class=\"card-title\">Observations m\u00E9dicales</div>\n            <!-- Observation existante : soumise \u00E0 permission -->\n<ng-container *ngIf=\"permissions().observations\">\n  <div *ngIf=\"patient()?.observationsMedecin\" class=\"obs-existing\">\n    <p class=\"obs-text\">{{ patient()?.observationsMedecin }}</p>\n  </div>\n</ng-container>\n<div *ngIf=\"!permissions().observations\" class=\"no-access-msg\">\n  Acc\u00E8s non autoris\u00E9 par le patient\n</div>\n\n<!-- \u00C9criture : toujours visible -->\n<textarea\n  class=\"obs-textarea\"\n  [(ngModel)]=\"newObservation\"\n  placeholder=\"Saisir vos observations, remarques cliniques...\"\n  rows=\"4\"\n></textarea>\n<div class=\"obs-actions\">\n  <span class=\"obs-success\" *ngIf=\"obsSaved()\">\u2713 Observation enregistr\u00E9e</span>\n  <span class=\"obs-error\" *ngIf=\"obsError()\">{{ obsError() }}</span>\n  <button class=\"btn-save-obs\" (click)=\"saveObservation()\" \n    [disabled]=\"obsSaving() || !newObservation.trim()\">\n    {{ obsSaving() ? 'Enregistrement...' : 'Enregistrer' }}\n  </button>\n</div>\n          </div>\n\n        </div>\n      </div>\n    </div>\n  ",
            styles: ["\n    .profile-page { padding: 24px; max-width: 900px; margin: 0 auto; }\n\n    .back-bar { margin-bottom: 20px; }\n    .btn-back { background: none; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #475569; }\n    .btn-back:hover { background: #f8fafc; }\n\n    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; gap: 12px; color: #64748b; }\n    .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    .patient-header { display: flex; align-items: center; gap: 20px; background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; padding: 24px; margin-bottom: 20px; }\n    .avatar { width: 72px; height: 72px; border-radius: 50%; background: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: white; flex-shrink: 0; overflow: hidden; }\n    .avatar img { width: 100%; height: 100%; object-fit: cover; }\n    .patient-info h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .patient-email { font-size: 14px; color: #64748b; margin: 0 0 10px; }\n    .patient-tags { display: flex; gap: 8px; flex-wrap: wrap; }\n    .tag { background: #f1f5f9; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }\n    .tag.blood { background: #fef2f2; color: #dc2626; }\n\n    .cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }\n    .card-full { grid-column: 1 / -1; }\n\n    .card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 20px; }\n    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }\n\n    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; color: #0f172a; }\n    .info-row:last-child { border-bottom: none; }\n    .label { color: #64748b; font-weight: 500; }\n    .blood-badge { background: #fef2f2; color: #dc2626; padding: 2px 10px; border-radius: 20px; font-weight: 700; font-size: 12px; }\n\n    .section-label { font-size: 12px; font-weight: 600; color: #64748b; margin: 14px 0 8px; text-transform: uppercase; letter-spacing: .5px; }\n    .tags-list { display: flex; flex-wrap: wrap; gap: 6px; }\n    .tag-item { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }\n    .tag-item.allergy { background: #fef2f2; color: #dc2626; }\n    .tag-item.chronic { background: #fffbeb; color: #d97706; }\n    .empty-text { font-size: 13px; color: #94a3b8; margin: 4px 0; }\n\n    .med-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }\n    .med-item:last-child { border-bottom: none; }\n    .med-name { font-weight: 600; color: #0f172a; }\n    .med-dose { color: #64748b; font-size: 12px; }\n\n    .obs-existing { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-bottom: 12px; }\n    .obs-text { font-size: 13px; color: #166534; margin: 0; white-space: pre-wrap; }\n    .obs-textarea { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 13px; font-family: inherit; resize: vertical; outline: none; box-sizing: border-box; }\n    .obs-textarea:focus { border-color: #4f46e5; }\n    .obs-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 10px; }\n    .obs-success { font-size: 13px; color: #16a34a; font-weight: 600; }\n    .obs-error { font-size: 13px; color: #dc2626; }\n    .btn-save-obs { background: #4f46e5; color: white; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }\n    .btn-save-obs:hover:not(:disabled) { background: #4338ca; }\n    .btn-save-obs:disabled { opacity: 0.5; cursor: not-allowed; }\n    .no-access-msg { font-size: 13px; color: #94a3b8; font-style: italic; padding: 8px 0; }\n    .doc-item { display: flex; align-items: center; gap: 12px; background: #f8fafc; border-radius: 10px; padding: 12px; border: 1px solid #e2e8f0; margin-bottom: 8px; }\n    .doc-icon { font-size: 24px; flex-shrink: 0; }\n    .doc-info { flex: 1; }\n    .doc-name { font-size: 14px; font-weight: 600; color: #0f172a; }\n    .doc-date { font-size: 12px; color: #64748b; }\n    .btn-dl { padding: 6px 12px; background: #eff6ff; color: #1a56db; border: 1.5px solid #bfdbfe; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; }\n\n    @media (max-width: 640px) { .cards-grid { grid-template-columns: 1fr; } .card-full { grid-column: 1; } }\n  "]
        })
    ], MedecinPatientProfileComponent);
    return MedecinPatientProfileComponent;
}());
exports.MedecinPatientProfileComponent = MedecinPatientProfileComponent;
