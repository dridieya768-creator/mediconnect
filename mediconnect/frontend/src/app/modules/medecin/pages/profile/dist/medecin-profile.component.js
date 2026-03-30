"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinProfileComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MedecinProfileComponent = /** @class */ (function () {
    function MedecinProfileComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.medecin = core_1.signal(null);
        this.isLoading = core_1.signal(true);
        this.isSaving = core_1.signal(false);
        this.isUploadingPhoto = core_1.signal(false);
        this.successMsg = core_1.signal(null);
        this.errorMsg = core_1.signal(null);
        this.photoPreview = null;
        this.cabinetPhotosList = [];
        this.form = {
            titre: '',
            specialite: '',
            numeroOrdrePro: '',
            diplomes: '',
            photoPro: '',
            photosCabinet: '',
            languesParlees: '',
            biographie: '',
            adresseCabinet: '',
            geoGoogleMaps: '',
            ville: '',
            telephonePro: '',
            emailPro: '',
            tarifs: '',
            actesCouverts: '',
            assurancesAcceptees: '',
            agendaConnecte: true,
            disponTeleconsult: false,
            connexionVideoIntegree: false,
            profilSEO: false,
            statsAnalytics: false
        };
        this.features = [
            { key: 'agendaConnecte', icon: '📅', label: 'Agenda connecté', desc: 'Synchronisation avec le planning' },
            { key: 'disponTeleconsult', icon: '💻', label: 'Téléconsultation', desc: 'Disponible en vidéo consultation' },
            { key: 'connexionVideoIntegree', icon: '📹', label: 'Vidéo intégrée', desc: 'Utiliser Jitsi Meet intégré' },
            { key: 'profilSEO', icon: '🔍', label: 'Profil SEO', desc: 'Référencement sur les moteurs de recherche' },
            { key: 'statsAnalytics', icon: '📊', label: 'Stats & Analytics', desc: 'Statistiques de consultation du profil' },
        ];
    }
    MedecinProfileComponent.prototype.ngOnInit = function () { this.loadProfile(); };
    MedecinProfileComponent.prototype.loadProfile = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c;
            var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
            if (data) {
                _this.medecin.set(data);
                if (data.profile) {
                    Object.keys(_this.form).forEach(function (key) {
                        if (data.profile[key] !== undefined && data.profile[key] !== null) {
                            _this.form[key] = data.profile[key];
                            if (key === 'photoPro' && data.profile[key]) {
                                _this.photoPreview = data.profile[key];
                            }
                            if (key === 'photosCabinet' && data.profile[key]) {
                                _this.cabinetPhotosList = data.profile[key].split(',').map(function (p) { return p.trim(); });
                            }
                        }
                    });
                }
                if (data.emailPro === undefined && data.email) {
                    _this.form.emailPro = data.email;
                }
            }
            _this.isLoading.set(false);
        });
    };
    MedecinProfileComponent.prototype.onPhotoSelected = function (event) {
        var _this = this;
        var input = event.target;
        if (input.files && input.files[0]) {
            var file = input.files[0];
            // Vérifier la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMsg.set("La photo ne doit pas dépasser 5MB");
                setTimeout(function () { return _this.errorMsg.set(null); }, 3000);
                return;
            }
            // Vérifier le type
            if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
                this.errorMsg.set("Format accepté: JPEG, PNG, JPG");
                setTimeout(function () { return _this.errorMsg.set(null); }, 3000);
                return;
            }
            this.isUploadingPhoto.set(true);
            var formData = new FormData();
            formData.append('file', file);
            this.http.post("/api/v1/upload/photo", formData)
                .pipe(operators_1.finalize(function () { return _this.isUploadingPhoto.set(false); }))
                .subscribe({
                next: function (res) {
                    var _a;
                    var photoUrl = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.url) || (res === null || res === void 0 ? void 0 : res.url);
                    if (photoUrl) {
                        _this.photoPreview = photoUrl;
                        _this.form.photoPro = photoUrl;
                        _this.successMsg.set("Photo téléchargée avec succès !");
                        setTimeout(function () { return _this.successMsg.set(null); }, 3000);
                    }
                },
                error: function (err) {
                    console.error('Upload error:', err);
                    _this.errorMsg.set("Erreur lors du téléchargement de la photo");
                    setTimeout(function () { return _this.errorMsg.set(null); }, 3000);
                }
            });
        }
    };
    MedecinProfileComponent.prototype.onCabinetPhotosSelected = function (event) {
        var _this = this;
        var input = event.target;
        if (input.files && input.files.length > 0) {
            var files = Array.from(input.files);
            var _loop_1 = function (file) {
                // Vérifier la taille
                if (file.size > 5 * 1024 * 1024) {
                    this_1.errorMsg.set("La photo \"" + file.name + "\" d\u00E9passe 5MB");
                    setTimeout(function () { return _this.errorMsg.set(null); }, 3000);
                    return "continue";
                }
                // Vérifier le type
                if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
                    this_1.errorMsg.set("Format non accept\u00E9 pour \"" + file.name + "\"");
                    setTimeout(function () { return _this.errorMsg.set(null); }, 3000);
                    return "continue";
                }
                var formData = new FormData();
                formData.append('file', file);
                this_1.http.post("/api/v1/upload/photo", formData)
                    .subscribe({
                    next: function (res) {
                        var _a;
                        var photoUrl = ((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.url) || (res === null || res === void 0 ? void 0 : res.url);
                        if (photoUrl) {
                            _this.cabinetPhotosList.push(photoUrl);
                            _this.form.photosCabinet = _this.cabinetPhotosList.join(', ');
                        }
                    },
                    error: function (err) {
                        console.error('Upload error:', err);
                        _this.errorMsg.set("Erreur lors du t\u00E9l\u00E9chargement de \"" + file.name + "\"");
                    }
                });
            };
            var this_1 = this;
            for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                var file = files_1[_i];
                _loop_1(file);
            }
            this.successMsg.set(files.length + " photo(s) en cours de t\u00E9l\u00E9chargement...");
            setTimeout(function () { return _this.successMsg.set(null); }, 3000);
        }
    };
    MedecinProfileComponent.prototype.removePhoto = function () {
        this.photoPreview = null;
        this.form.photoPro = '';
    };
    MedecinProfileComponent.prototype.removeCabinetPhoto = function (index) {
        this.cabinetPhotosList.splice(index, 1);
        this.form.photosCabinet = this.cabinetPhotosList.join(', ');
    };
    MedecinProfileComponent.prototype.saveProfile = function () {
        var _this = this;
        this.isSaving.set(true);
        this.errorMsg.set(null);
        this.http.put("/api/v1/medecins/profile", this.form)
            .pipe(operators_1.catchError(function (err) {
            _this.errorMsg.set("Erreur lors de l'enregistrement");
            _this.isSaving.set(false);
            return rxjs_1.of(null);
        }))
            .subscribe(function (res) {
            if (res) {
                _this.successMsg.set("Profil mis à jour avec succès !");
                setTimeout(function () { return _this.successMsg.set(null); }, 3000);
            }
            _this.isSaving.set(false);
        });
    };
    MedecinProfileComponent.prototype.getInitials = function () {
        var _a, _b, _c, _d;
        var m = this.medecin();
        if (!m)
            return 'M';
        return ("" + ((_b = (_a = m.firstName) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '') + ((_d = (_c = m.lastName) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '')).toUpperCase();
    };
    MedecinProfileComponent.prototype.getRoleLabel = function () {
        var _a, _b;
        var role = (_b = (_a = this.medecin()) === null || _a === void 0 ? void 0 : _a.role) !== null && _b !== void 0 ? _b : '';
        var labels = {
            MEDECIN_GENERALISTE: 'Médecin Généraliste',
            MEDECIN_SPECIALISTE: 'Médecin Spécialiste',
            MEDECIN_CHEF_SERVICE: 'Chef de Service'
        };
        return labels[role] || role;
    };
    MedecinProfileComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-profile",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            template: "\n    <div class=\"profile-page\">\n      <!-- HEADER -->\n      <div class=\"page-header\">\n        <h1 class=\"page-title\">\uD83D\uDC68\u200D\u2695\uFE0F Mon Profil Professionnel</h1>\n        <div class=\"header-actions\">\n          <button class=\"btn-save\" (click)=\"saveProfile()\" [disabled]=\"isSaving()\">\n            {{ isSaving() ? '\u23F3 Enregistrement...' : '\uD83D\uDCBE Enregistrer' }}\n          </button>\n        </div>\n      </div>\n\n      <div class=\"alert-success\" *ngIf=\"successMsg()\">\u2705 {{ successMsg() }}</div>\n      <div class=\"alert-error\" *ngIf=\"errorMsg()\">\u274C {{ errorMsg() }}</div>\n\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div><p>Chargement...</p>\n      </div>\n\n      <div class=\"profile-grid\" *ngIf=\"!isLoading()\">\n\n        <!-- \u2500\u2500 CARTE IDENTIT\u00C9 \u2500\u2500 -->\n        <div class=\"profile-card full-width\">\n          <div class=\"card-header\">\n            <span class=\"card-icon\">\uD83E\uDEAA</span>\n            <h2>Identit\u00E9 Professionnelle</h2>\n          </div>\n          <div class=\"card-body\">\n            <div class=\"avatar-section\">\n              <div class=\"avatar-preview\">\n                <img *ngIf=\"photoPreview || form.photoPro\" [src]=\"photoPreview || form.photoPro\" alt=\"Photo pro\" class=\"avatar-img\"/>\n                <div *ngIf=\"!photoPreview && !form.photoPro\" class=\"avatar-placeholder\">\n                  {{ getInitials() }}\n                </div>\n                <div class=\"avatar-overlay\" *ngIf=\"isUploadingPhoto()\">\n                  <div class=\"spinner-small\"></div>\n                </div>\n              </div>\n              <div class=\"avatar-info\">\n                <h3>{{ medecin()?.firstName }} {{ medecin()?.lastName }}</h3>\n                <span class=\"role-badge\">{{ getRoleLabel() }}</span>\n                <div class=\"avatar-upload\">\n                  <label class=\"upload-photo-btn\">\n                    \uD83D\uDCF8 Changer la photo\n                    <input type=\"file\" (change)=\"onPhotoSelected($event)\" \n                           accept=\"image/jpeg,image/png,image/jpg\" hidden>\n                  </label>\n                  <button *ngIf=\"form.photoPro || photoPreview\" class=\"remove-photo-btn\" \n                          (click)=\"removePhoto()\" type=\"button\">\uD83D\uDDD1\uFE0F Supprimer</button>\n                </div>\n                <small class=\"upload-hint\">JPEG, PNG, JPG. Max 5MB</small>\n              </div>\n            </div>\n\n            <div class=\"form-grid\">\n              <div class=\"form-group\">\n                <label class=\"form-label\">Titre</label>\n                <select class=\"form-input\" [(ngModel)]=\"form.titre\">\n                  <option value=\"\">\u2014 S\u00E9lectionner \u2014</option>\n                  <option value=\"Dr\">Dr</option>\n                  <option value=\"Pr\">Pr</option>\n                  <option value=\"Dr Pr\">Dr Pr</option>\n                </select>\n              </div>\n              <div class=\"form-group\">\n                <label class=\"form-label\">Sp\u00E9cialit\u00E9</label>\n                <input class=\"form-input\" [(ngModel)]=\"form.specialite\" placeholder=\"Ex: Cardiologie\"/>\n              </div>\n              <div class=\"form-group\">\n                <label class=\"form-label\">N\u00B0 Ordre Professionnel</label>\n                <input class=\"form-input\" [(ngModel)]=\"form.numeroOrdrePro\" placeholder=\"Ex: TN-12345\"/>\n              </div>\n              <div class=\"form-group\">\n                <label class=\"form-label\">Langues parl\u00E9es</label>\n                <input class=\"form-input\" [(ngModel)]=\"form.languesParlees\" placeholder=\"Ex: Fran\u00E7ais, Arabe, Anglais\"/>\n              </div>\n              <div class=\"form-group full-span\">\n                <label class=\"form-label\">Dipl\u00F4mes & Formations</label>\n                <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"form.diplomes\"\n                  placeholder=\"Ex: Doctorat en M\u00E9decine - Facult\u00E9 de Tunis (2010)...\"></textarea>\n              </div>\n              <div class=\"form-group full-span\">\n                <label class=\"form-label\">Biographie</label>\n                <textarea class=\"form-input\" rows=\"4\" [(ngModel)]=\"form.biographie\"\n                  placeholder=\"Pr\u00E9sentez-vous en quelques lignes...\"></textarea>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 LOCALISATION \u2500\u2500 -->\n        <div class=\"profile-card\">\n          <div class=\"card-header\">\n            <span class=\"card-icon\">\uD83D\uDCCD</span>\n            <h2>Cabinet & Localisation</h2>\n          </div>\n          <div class=\"card-body\">\n            <div class=\"form-group\">\n              <label class=\"form-label\">Ville</label>\n              <input class=\"form-input\" [(ngModel)]=\"form.ville\" placeholder=\"Ex: Tunis\"/>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Adresse du cabinet</label>\n              <input class=\"form-input\" [(ngModel)]=\"form.adresseCabinet\" placeholder=\"Ex: 12 Rue de la R\u00E9publique, Tunis\"/>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Lien Google Maps</label>\n              <input class=\"form-input\" [(ngModel)]=\"form.geoGoogleMaps\" placeholder=\"https://maps.google.com/...\"/>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Photos du cabinet (upload multiple)</label>\n              <div class=\"cabinet-photos-section\">\n                <div class=\"photos-grid\">\n                  <div *ngFor=\"let photo of cabinetPhotosList; let i = index\" class=\"photo-item\">\n                    <img [src]=\"photo\" alt=\"Photo cabinet\">\n                    <button type=\"button\" class=\"remove-photo-btn-small\" (click)=\"removeCabinetPhoto(i)\">\u00D7</button>\n                  </div>\n                  <div class=\"add-photo-box\">\n                    <label class=\"add-photo-label\">\n                      <div class=\"add-photo-icon\">+</div>\n                      <span>Ajouter</span>\n                      <input type=\"file\" (change)=\"onCabinetPhotosSelected($event)\" \n                             accept=\"image/jpeg,image/png,image/jpg\" multiple hidden>\n                    </label>\n                  </div>\n                </div>\n                <small class=\"upload-hint\">Vous pouvez s\u00E9lectionner plusieurs photos \u00E0 la fois</small>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 CONTACT PRO \u2500\u2500 -->\n        <div class=\"profile-card\">\n          <div class=\"card-header\">\n            <span class=\"card-icon\">\uD83D\uDCDE</span>\n            <h2>Contact Professionnel</h2>\n          </div>\n          <div class=\"card-body\">\n            <div class=\"form-group\">\n              <label class=\"form-label\">T\u00E9l\u00E9phone professionnel</label>\n              <input class=\"form-input\" [(ngModel)]=\"form.telephonePro\" placeholder=\"+216 XX XXX XXX\"/>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Email professionnel</label>\n              <input class=\"form-input\" type=\"email\" [(ngModel)]=\"form.emailPro\" placeholder=\"dr.nom@cabinet.tn\"/>\n            </div>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 TARIFS \u2500\u2500 -->\n        <div class=\"profile-card\">\n          <div class=\"card-header\">\n            <span class=\"card-icon\">\uD83D\uDCB0</span>\n            <h2>Tarifs & Actes</h2>\n          </div>\n          <div class=\"card-body\">\n            <div class=\"form-group\">\n              <label class=\"form-label\">Tarifs (description)</label>\n              <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"form.tarifs\"\n                placeholder=\"Ex: Consultation: 50 DT, T\u00E9l\u00E9consultation: 40 DT\"></textarea>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Actes couverts</label>\n              <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"form.actesCouverts\"\n                placeholder=\"Ex: ECG, \u00C9chocardiographie, Holter...\"></textarea>\n            </div>\n            <div class=\"form-group\">\n              <label class=\"form-label\">Assurances accept\u00E9es</label>\n              <textarea class=\"form-input\" rows=\"2\" [(ngModel)]=\"form.assurancesAcceptees\"\n                placeholder=\"Ex: CNAM, MAE, GAT...\"></textarea>\n            </div>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 FONCTIONNALIT\u00C9S \u2500\u2500 -->\n        <div class=\"profile-card full-width\">\n          <div class=\"card-header\">\n            <span class=\"card-icon\">\u2699\uFE0F</span>\n            <h2>Fonctionnalit\u00E9s & Options</h2>\n          </div>\n          <div class=\"card-body\">\n            <div class=\"features-grid\">\n              <div class=\"feature-toggle\" *ngFor=\"let feat of features\">\n                <div class=\"feat-info\">\n                  <span class=\"feat-icon\">{{ feat.icon }}</span>\n                  <div>\n                    <div class=\"feat-label\">{{ feat.label }}</div>\n                    <div class=\"feat-desc\">{{ feat.desc }}</div>\n                  </div>\n                </div>\n                <label class=\"toggle-label\">\n                  <input type=\"checkbox\" class=\"toggle-input\" [(ngModel)]=\"form[feat.key]\">\n                  <span class=\"toggle-switch\"></span>\n                </label>\n              </div>\n            </div>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  ",
            styles: ["\n    .profile-page { padding: 0; }\n    .page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }\n    .page-title { font-size:24px; font-weight:700; color:#0f172a; margin:0; }\n    .btn-save { padding:10px 24px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-save:disabled { opacity:.6; cursor:not-allowed; }\n    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n    .alert-error { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }\n    .spinner { width:36px; height:36px; border:3px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }\n    .spinner-small { width:20px; height:20px; border:2px solid #fff; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }\n    @keyframes spin { to { transform:rotate(360deg); } }\n\n    .profile-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }\n    .profile-card { background:white; border-radius:16px; border:1.5px solid #e2e8f0; overflow:hidden; }\n    .profile-card.full-width { grid-column:1/-1; }\n    .card-header { display:flex; align-items:center; gap:10px; padding:16px 20px; border-bottom:1px solid #f1f5f9; background:#f8fafc; }\n    .card-header h2 { font-size:15px; font-weight:700; color:#0f172a; margin:0; }\n    .card-icon { font-size:20px; }\n    .card-body { padding:20px; display:flex; flex-direction:column; gap:14px; }\n\n    .avatar-section { display:flex; align-items:flex-start; gap:20px; margin-bottom:16px; flex-wrap:wrap; }\n    .avatar-preview { width:100px; height:100px; border-radius:50%; overflow:hidden; background:#4f46e5; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }\n    .avatar-img { width:100%; height:100%; object-fit:cover; }\n    .avatar-placeholder { color:white; font-size:28px; font-weight:700; }\n    .avatar-overlay { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; border-radius:50%; }\n    .avatar-info h3 { font-size:18px; font-weight:700; color:#0f172a; margin:0 0 6px; }\n    .role-badge { background:#eef2ff; color:#4f46e5; border-radius:20px; padding:4px 12px; font-size:12px; font-weight:600; display:inline-block; margin-bottom:12px; }\n    .avatar-upload { display:flex; gap:10px; margin-top:8px; flex-wrap:wrap; }\n    .upload-photo-btn { background:#f1f5f9; color:#334155; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; transition:all .2s; border:1px solid #e2e8f0; display:inline-block; }\n    .upload-photo-btn:hover { background:#e2e8f0; }\n    .remove-photo-btn { background:#fee2e2; color:#dc2626; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; border:none; }\n    .remove-photo-btn:hover { background:#fecaca; }\n    .upload-hint { font-size:11px; color:#94a3b8; margin-top:5px; display:block; }\n\n    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }\n    .form-group { display:flex; flex-direction:column; gap:6px; }\n    .form-group.full-span { grid-column:1/-1; }\n    .form-label { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }\n    .form-input { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; font-family:inherit; resize:vertical; }\n    .form-input:focus { border-color:#4f46e5; }\n\n    /* Photos cabinet styles */\n    .cabinet-photos-section { margin-top:8px; }\n    .photos-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(100px, 100px)); gap:12px; margin-bottom:12px; }\n    .photo-item { position:relative; width:100px; height:100px; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0; }\n    .photo-item img { width:100%; height:100%; object-fit:cover; }\n    .remove-photo-btn-small { position:absolute; top:4px; right:4px; width:22px; height:22px; border-radius:50%; background:#ef4444; color:white; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:14px; }\n    .add-photo-box { width:100px; height:100px; border:2px dashed #cbd5e1; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; background:#f8fafc; }\n    .add-photo-box:hover { border-color:#4f46e5; background:#eef2ff; }\n    .add-photo-label { display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; width:100%; height:100%; justify-content:center; }\n    .add-photo-icon { font-size:28px; color:#64748b; }\n\n    .features-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }\n    .feature-toggle { display:flex; align-items:center; justify-content:space-between; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px 16px; }\n    .feat-info { display:flex; align-items:center; gap:10px; }\n    .feat-icon { font-size:22px; flex-shrink:0; }\n    .feat-label { font-size:13px; font-weight:700; color:#0f172a; }\n    .feat-desc { font-size:11px; color:#94a3b8; margin-top:2px; }\n    .toggle-label { display:flex; align-items:center; cursor:pointer; }\n    .toggle-input { display:none; }\n    .toggle-switch { width:42px; height:24px; background:#e2e8f0; border-radius:12px; position:relative; transition:background .2s; flex-shrink:0; }\n    .toggle-switch::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; background:white; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }\n    .toggle-input:checked + .toggle-switch { background:#4f46e5; }\n    .toggle-input:checked + .toggle-switch::after { transform:translateX(18px); }\n\n    @media (max-width:768px) {\n      .profile-grid { grid-template-columns:1fr; }\n      .form-grid { grid-template-columns:1fr; }\n      .features-grid { grid-template-columns:1fr; }\n      .photos-grid { grid-template-columns:repeat(auto-fill, minmax(80px, 80px)); }\n      .photo-item, .add-photo-box { width:80px; height:80px; }\n    }\n  "]
        })
    ], MedecinProfileComponent);
    return MedecinProfileComponent;
}());
exports.MedecinProfileComponent = MedecinProfileComponent;
