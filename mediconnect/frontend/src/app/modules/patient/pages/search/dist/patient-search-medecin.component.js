"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PatientSearchMedecinComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var rxjs_2 = require("rxjs");
var PatientSearchMedecinComponent = /** @class */ (function () {
    function PatientSearchMedecinComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.router = core_1.inject(router_1.Router);
        this.isLoading = core_1.signal(true);
        this.allDoctors = core_1.signal([]);
        this.selectedDoc = core_1.signal(null);
        this.searchQuery = "";
        this.filterVille = "";
        this.filterSpecialite = "";
        this.filterTeleconsult = false;
        this.filterDisponible = false;
        this.sortBy = "nom";
        this.searchSubject = new rxjs_1.Subject();
        this.villes = ["Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul", "Monastir", "Gabès", "Ariana", "Ben Arous", "La Marsa"];
        this.specialites = [
            "Médecin Généraliste", "Cardiologue", "Dermatologue", "Urgentiste",
            "Gynécologue", "Neurologue", "Ophtalmologue", "ORL", "Pédiatre",
            "Psychiatre", "Radiologue", "Rhumatologue", "Urologue", "Chirurgien",
            "Anesthésiste", "Endocrinologue", "Gastro-entérologue", "Néphrologue",
            "Oncologue", "Pneumologue"
        ];
        this.topSpecialites = ["Cardiologue", "Généraliste", "Pédiatre", "Gynécologue"];
        this.filteredDoctors = core_1.signal([]);
    }
    PatientSearchMedecinComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadDoctors();
        this.searchSubject.pipe(rxjs_1.debounceTime(300), rxjs_1.distinctUntilChanged()).subscribe(function () { return _this.applyFilters(); });
    };
    PatientSearchMedecinComponent.prototype.loadDoctors = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins")
            .pipe(rxjs_1.catchError(function () { return rxjs_2.of([]); }))
            .subscribe(function (res) {
            var _a;
            var list = Array.isArray(res) ? res :
                Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data :
                    Array.isArray((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) ? res.data.data : [];
            _this.allDoctors.set(list);
            _this.filteredDoctors.set(list);
            _this.isLoading.set(false);
        });
    };
    PatientSearchMedecinComponent.prototype.onSearchChange = function (q) { this.searchSubject.next(q); };
    PatientSearchMedecinComponent.prototype.applyFilters = function () {
        var _this = this;
        var list = __spreadArrays(this.allDoctors());
        var q = this.searchQuery.toLowerCase().trim();
        if (q) {
            list = list.filter(function (d) {
                var _a, _b;
                return _this.getFullName(d).toLowerCase().includes(q) ||
                    (((_a = d.profile) === null || _a === void 0 ? void 0 : _a.specialite) || '').toLowerCase().includes(q) ||
                    (((_b = d.profile) === null || _b === void 0 ? void 0 : _b.ville) || '').toLowerCase().includes(q) ||
                    (d.email || '').toLowerCase().includes(q);
            });
        }
        if (this.filterVille) {
            list = list.filter(function (d) { var _a; return ((_a = d.profile) === null || _a === void 0 ? void 0 : _a.ville) === _this.filterVille; });
        }
        if (this.filterSpecialite) {
            list = list.filter(function (d) {
                var _a;
                return (((_a = d.profile) === null || _a === void 0 ? void 0 : _a.specialite) || '').toLowerCase().includes(_this.filterSpecialite.toLowerCase()) ||
                    _this.getRoleLabel(d.role).toLowerCase().includes(_this.filterSpecialite.toLowerCase());
            });
        }
        if (this.filterTeleconsult) {
            list = list.filter(function (d) { var _a; return (_a = d.profile) === null || _a === void 0 ? void 0 : _a.disponTeleconsult; });
        }
        this.sortList(list);
        this.filteredDoctors.set(list);
    };
    PatientSearchMedecinComponent.prototype.sortDoctors = function () {
        var list = __spreadArrays(this.filteredDoctors());
        this.sortList(list);
        this.filteredDoctors.set(list);
    };
    PatientSearchMedecinComponent.prototype.sortList = function (list) {
        var _this = this;
        list.sort(function (a, b) {
            var _a, _b, _c, _d;
            if (_this.sortBy === 'nom')
                return _this.getFullName(a).localeCompare(_this.getFullName(b));
            if (_this.sortBy === 'specialite')
                return (((_a = a.profile) === null || _a === void 0 ? void 0 : _a.specialite) || '').localeCompare(((_b = b.profile) === null || _b === void 0 ? void 0 : _b.specialite) || '');
            if (_this.sortBy === 'ville')
                return (((_c = a.profile) === null || _c === void 0 ? void 0 : _c.ville) || '').localeCompare(((_d = b.profile) === null || _d === void 0 ? void 0 : _d.ville) || '');
            return 0;
        });
    };
    PatientSearchMedecinComponent.prototype.resetFilters = function () {
        this.searchQuery = "";
        this.filterVille = "";
        this.filterSpecialite = "";
        this.filterTeleconsult = false;
        this.filterDisponible = false;
        this.filteredDoctors.set(this.allDoctors());
    };
    PatientSearchMedecinComponent.prototype.openProfile = function (doc) { this.selectedDoc.set(doc); };
    PatientSearchMedecinComponent.prototype.takeAppointment = function (doc) {
        this.selectedDoc.set(null);
        this.router.navigate(['/patient/appointments'], {
            queryParams: { doctorId: doc.userId || doc.id, doctorName: this.getFullName(doc) }
        });
    };
    PatientSearchMedecinComponent.prototype.getFullName = function (doc) {
        return ((doc.firstName || doc.first_name || '') + " " + (doc.lastName || doc.last_name || '')).trim() || 'Médecin';
    };
    PatientSearchMedecinComponent.prototype.getInitials = function (doc) {
        var f = (doc.firstName || doc.first_name || '')[0] || '';
        var l = (doc.lastName || doc.last_name || '')[0] || '';
        return (f + l).toUpperCase() || 'M';
    };
    PatientSearchMedecinComponent.prototype.getRoleLabel = function (role) {
        var labels = {
            MEDECIN_GENERALISTE: 'Médecin Généraliste',
            MEDECIN_SPECIALISTE: 'Médecin Spécialiste',
            MEDECIN_CHEF_SERVICE: 'Chef de Service',
            MEDECIN_URGENTISTE: 'Médecin Urgentiste'
        };
        return labels[role] || 'Médecin';
    };
    PatientSearchMedecinComponent.prototype.getTarif = function (tarifs) {
        try {
            var t = typeof tarifs === 'string' ? JSON.parse(tarifs) : tarifs;
            if (t === null || t === void 0 ? void 0 : t.consultation)
                return "Consultation : " + t.consultation + " DT";
        }
        catch (_a) { }
        return (tarifs === null || tarifs === void 0 ? void 0 : tarifs.substring(0, 60)) || '';
    };
    PatientSearchMedecinComponent = __decorate([
        core_1.Component({
            selector: "app-patient-search-medecin",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            template: "\n    <div class=\"search-page\">\n\n      <!-- HEADER -->\n      <div class=\"page-header\">\n        <h1 class=\"page-title\">\uD83D\uDD0D Trouver un M\u00E9decin</h1>\n        <p class=\"page-subtitle\">Recherchez parmi nos m\u00E9decins disponibles</p>\n      </div>\n\n      <!-- BARRE DE RECHERCHE -->\n      <div class=\"search-hero\">\n        <div class=\"search-bar-main\">\n          <div class=\"search-input-wrap\">\n            <span class=\"search-icon\">\uD83D\uDD0D</span>\n            <input class=\"search-input\" type=\"text\"\n              [(ngModel)]=\"searchQuery\"\n              (ngModelChange)=\"onSearchChange($event)\"\n              placeholder=\"Nom du m\u00E9decin, sp\u00E9cialit\u00E9...\"/>\n          </div>\n          <div class=\"search-select-wrap\">\n            <span class=\"search-icon\">\uD83D\uDCCD</span>\n            <select class=\"search-select\" [(ngModel)]=\"filterVille\" (change)=\"applyFilters()\">\n              <option value=\"\">Toutes les villes</option>\n              <option *ngFor=\"let v of villes\" [value]=\"v\">{{ v }}</option>\n            </select>\n          </div>\n          <div class=\"search-select-wrap\">\n            <span class=\"search-icon\">\uD83E\uDE7A</span>\n            <select class=\"search-select\" [(ngModel)]=\"filterSpecialite\" (change)=\"applyFilters()\">\n              <option value=\"\">Toutes sp\u00E9cialit\u00E9s</option>\n              <option *ngFor=\"let s of specialites\" [value]=\"s\">{{ s }}</option>\n            </select>\n          </div>\n          <button class=\"btn-search\" (click)=\"applyFilters()\">Rechercher</button>\n        </div>\n\n        <!-- FILTRES RAPIDES -->\n        <div class=\"quick-filters\">\n          <button class=\"quick-btn\" [class.active]=\"filterTeleconsult\"\n            (click)=\"filterTeleconsult = !filterTeleconsult; applyFilters()\">\n            \uD83D\uDCBB T\u00E9l\u00E9consultation\n          </button>\n          <button class=\"quick-btn\" [class.active]=\"filterDisponible\"\n            (click)=\"filterDisponible = !filterDisponible; applyFilters()\">\n            \u2705 Disponible aujourd'hui\n          </button>\n          <button *ngFor=\"let s of topSpecialites\" class=\"quick-btn\"\n            [class.active]=\"filterSpecialite === s\"\n            (click)=\"filterSpecialite = filterSpecialite === s ? '' : s; applyFilters()\">\n            {{ s }}\n          </button>\n        </div>\n      </div>\n\n      <!-- LOADING -->\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div>\n        <p>Recherche en cours...</p>\n      </div>\n\n      <!-- R\u00C9SULTATS -->\n      <div *ngIf=\"!isLoading()\">\n        <div class=\"results-header\">\n          <span class=\"results-count\">{{ filteredDoctors().length }} m\u00E9decin(s) trouv\u00E9(s)</span>\n          <div class=\"sort-bar\">\n            <select class=\"sort-select\" [(ngModel)]=\"sortBy\" (change)=\"sortDoctors()\">\n              <option value=\"nom\">Trier par nom</option>\n              <option value=\"specialite\">Trier par sp\u00E9cialit\u00E9</option>\n              <option value=\"ville\">Trier par ville</option>\n            </select>\n          </div>\n        </div>\n\n        <!-- GRILLE M\u00C9DECINS -->\n        <div class=\"doctors-grid\" *ngIf=\"filteredDoctors().length > 0\">\n          <div class=\"doctor-card\" *ngFor=\"let doc of filteredDoctors()\"\n            (click)=\"openProfile(doc)\">\n\n            <!-- Avatar + Badge -->\n            <div class=\"card-top\">\n              <div class=\"doc-avatar\">\n                <img *ngIf=\"doc.profile?.photoPro\" [src]=\"doc.profile.photoPro\" [alt]=\"getFullName(doc)\" class=\"avatar-img\"/>\n                <span *ngIf=\"!doc.profile?.photoPro\" class=\"avatar-initials\">{{ getInitials(doc) }}</span>\n              </div>\n              <div class=\"doc-badges\">\n                <span class=\"badge-teleconsult\" *ngIf=\"doc.profile?.disponTeleconsult\">\uD83D\uDCBB T\u00E9l\u00E9consult.</span>\n                <span class=\"badge-disponible\">\u2705 Disponible</span>\n              </div>\n            </div>\n\n            <!-- Infos principales -->\n            <div class=\"card-body\">\n              <h3 class=\"doc-name\">{{ doc.profile?.titre || 'Dr.' }} {{ getFullName(doc) }}</h3>\n              <p class=\"doc-spec\">{{ doc.profile?.specialite || getRoleLabel(doc.role) }}</p>\n\n              <div class=\"doc-meta\">\n                <span *ngIf=\"doc.profile?.ville\">\n                  <span class=\"meta-icon\">\uD83D\uDCCD</span> {{ doc.profile.ville }}\n                </span>\n                <span *ngIf=\"doc.profile?.languesParlees\">\n                  <span class=\"meta-icon\">\uD83D\uDDE3\uFE0F</span> {{ doc.profile.languesParlees }}\n                </span>\n                <span *ngIf=\"doc.profile?.telephonePro\">\n                  <span class=\"meta-icon\">\uD83D\uDCDE</span> {{ doc.profile.telephonePro }}\n                </span>\n              </div>\n\n              <p class=\"doc-bio\" *ngIf=\"doc.profile?.biographie\">\n                {{ doc.profile.biographie | slice:0:120 }}{{ doc.profile.biographie?.length > 120 ? '...' : '' }}\n              </p>\n\n              <!-- Tarifs -->\n              <div class=\"doc-tarifs\" *ngIf=\"doc.profile?.tarifs\">\n                <span class=\"tarif-label\">\uD83D\uDCB0</span>\n                <span class=\"tarif-text\">{{ getTarif(doc.profile.tarifs) }}</span>\n              </div>\n\n              <!-- Assurances -->\n              <div class=\"doc-assurances\" *ngIf=\"doc.profile?.assurancesAcceptees\">\n                <span class=\"assur-label\">\uD83D\uDEE1\uFE0F Assurances :</span>\n                <span class=\"assur-text\">{{ doc.profile.assurancesAcceptees }}</span>\n              </div>\n            </div>\n\n            <!-- Actions -->\n            <div class=\"card-actions\">\n              <button class=\"btn-profile\" (click)=\"$event.stopPropagation(); openProfile(doc)\">\n                \uD83D\uDC41\uFE0F Voir profil\n              </button>\n              <button class=\"btn-rdv\" (click)=\"$event.stopPropagation(); takeAppointment(doc)\">\n                \uD83D\uDCC5 Prendre RDV\n              </button>\n            </div>\n          </div>\n        </div>\n\n        <!-- EMPTY STATE -->\n        <div class=\"empty-state\" *ngIf=\"filteredDoctors().length === 0\">\n          <div style=\"font-size:56px\">\uD83D\uDD0D</div>\n          <p>Aucun m\u00E9decin trouv\u00E9 pour votre recherche</p>\n          <button class=\"btn-reset\" (click)=\"resetFilters()\">R\u00E9initialiser les filtres</button>\n        </div>\n      </div>\n\n      <!-- MODAL PROFIL M\u00C9DECIN -->\n      <div class=\"modal-overlay\" *ngIf=\"selectedDoc()\" (click)=\"selectedDoc.set(null)\">\n        <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n          <div class=\"modal-header\">\n            <h2>Profil du M\u00E9decin</h2>\n            <button class=\"btn-close\" (click)=\"selectedDoc.set(null)\">\u2715</button>\n          </div>\n          <div class=\"modal-body\" *ngIf=\"selectedDoc()\">\n            <!-- En-t\u00EAte profil -->\n            <div class=\"profile-hero\">\n              <div class=\"profile-avatar\">\n                <img *ngIf=\"selectedDoc()!.profile?.photoPro\"\n                  [src]=\"selectedDoc()!.profile.photoPro\" class=\"avatar-img-lg\"/>\n                <span *ngIf=\"!selectedDoc()!.profile?.photoPro\" class=\"avatar-initials-lg\">\n                  {{ getInitials(selectedDoc()!) }}\n                </span>\n              </div>\n              <div class=\"profile-intro\">\n                <h3>{{ selectedDoc()!.profile?.titre || 'Dr.' }} {{ getFullName(selectedDoc()!) }}</h3>\n                <p class=\"profile-spec\">{{ selectedDoc()!.profile?.specialite || getRoleLabel(selectedDoc()!.role) }}</p>\n                <div class=\"profile-badges\">\n                  <span class=\"badge-teleconsult\" *ngIf=\"selectedDoc()!.profile?.disponTeleconsult\">\uD83D\uDCBB T\u00E9l\u00E9consultation</span>\n                  <span class=\"badge-video\" *ngIf=\"selectedDoc()!.profile?.connexionVideoIntegree\">\uD83D\uDCF9 Vid\u00E9o int\u00E9gr\u00E9e</span>\n                </div>\n              </div>\n            </div>\n\n            <!-- Infos d\u00E9taill\u00E9es -->\n            <div class=\"profile-sections\">\n              <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.biographie\">\n                <h4>\uD83D\uDCCB Biographie</h4>\n                <p>{{ selectedDoc()!.profile.biographie }}</p>\n              </div>\n\n              <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.diplomes\">\n                <h4>\uD83C\uDF93 Dipl\u00F4mes & Formations</h4>\n                <p>{{ selectedDoc()!.profile.diplomes }}</p>\n              </div>\n\n              <div class=\"profile-section\">\n                <h4>\uD83D\uDCCD Contact & Localisation</h4>\n                <div class=\"info-grid\">\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.adresseCabinet\">\n                    <span class=\"info-label\">Adresse</span>\n                    <span>{{ selectedDoc()!.profile.adresseCabinet }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.ville\">\n                    <span class=\"info-label\">Ville</span>\n                    <span>{{ selectedDoc()!.profile.ville }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.telephonePro\">\n                    <span class=\"info-label\">T\u00E9l\u00E9phone</span>\n                    <span>{{ selectedDoc()!.profile.telephonePro }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.emailPro\">\n                    <span class=\"info-label\">Email</span>\n                    <span>{{ selectedDoc()!.profile.emailPro }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.languesParlees\">\n                    <span class=\"info-label\">Langues</span>\n                    <span>{{ selectedDoc()!.profile.languesParlees }}</span>\n                  </div>\n                </div>\n              </div>\n\n              <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.tarifs || selectedDoc()!.profile?.assurancesAcceptees\">\n                <h4>\uD83D\uDCB0 Tarifs & Assurances</h4>\n                <div class=\"info-grid\">\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.tarifs\">\n                    <span class=\"info-label\">Tarifs</span>\n                    <span>{{ selectedDoc()!.profile.tarifs }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.assurancesAcceptees\">\n                    <span class=\"info-label\">Assurances</span>\n                    <span>{{ selectedDoc()!.profile.assurancesAcceptees }}</span>\n                  </div>\n                  <div class=\"info-row\" *ngIf=\"selectedDoc()!.profile?.actesCouverts\">\n                    <span class=\"info-label\">Actes</span>\n                    <span>{{ selectedDoc()!.profile.actesCouverts }}</span>\n                  </div>\n                </div>\n              </div>\n\n              <!-- Google Maps -->\n              <div class=\"profile-section\" *ngIf=\"selectedDoc()!.profile?.geoGoogleMaps\">\n                <h4>\uD83D\uDDFA\uFE0F Localisation</h4>\n                <a [href]=\"selectedDoc()!.profile.geoGoogleMaps\" target=\"_blank\" class=\"maps-link\">\n                  \uD83D\uDCCD Voir sur Google Maps\n                </a>\n              </div>\n            </div>\n          </div>\n          <div class=\"modal-footer\">\n            <button class=\"btn-outline\" (click)=\"selectedDoc.set(null)\">Fermer</button>\n            <button class=\"btn-rdv-lg\" (click)=\"takeAppointment(selectedDoc()!)\">\n              \uD83D\uDCC5 Prendre un rendez-vous\n            </button>\n          </div>\n        </div>\n      </div>\n\n    </div>\n  ",
            styles: ["\n    .search-page { padding: 0; }\n    .page-header { margin-bottom: 24px; }\n    .page-title { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }\n\n    .search-hero { background: linear-gradient(135deg, #0d9488, #0891b2); border-radius: 16px; padding: 28px; margin-bottom: 28px; }\n    .search-bar-main { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }\n    .search-input-wrap, .search-select-wrap { display: flex; align-items: center; gap: 8px; background: white; border-radius: 10px; padding: 10px 14px; flex: 1; min-width: 160px; }\n    .search-icon { font-size: 16px; flex-shrink: 0; }\n    .search-input { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; }\n    .search-select { border: none; outline: none; font-size: 14px; color: #0f172a; width: 100%; background: transparent; cursor: pointer; }\n    .btn-search { padding: 10px 24px; background: #f59e0b; color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; }\n    .btn-search:hover { background: #d97706; }\n\n    .quick-filters { display: flex; gap: 8px; flex-wrap: wrap; }\n    .quick-btn { padding: 6px 14px; background: rgba(255,255,255,.2); color: white; border: 1.5px solid rgba(255,255,255,.4); border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }\n    .quick-btn:hover, .quick-btn.active { background: white; color: #0d9488; border-color: white; }\n\n    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }\n    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #0d9488; border-radius: 50%; animation: spin .8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }\n    .results-count { font-size: 14px; color: #64748b; font-weight: 600; }\n    .sort-select { padding: 6px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; cursor: pointer; }\n\n    .doctors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }\n    .doctor-card { background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; cursor: pointer; transition: all .2s; display: flex; flex-direction: column; }\n    .doctor-card:hover { border-color: #0d9488; box-shadow: 0 8px 24px rgba(13,148,136,.15); transform: translateY(-2px); }\n\n    .card-top { display: flex; justify-content: space-between; align-items: flex-start; padding: 16px 16px 0; }\n    .doc-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }\n    .avatar-img { width: 100%; height: 100%; object-fit: cover; }\n    .avatar-initials { color: white; font-size: 20px; font-weight: 700; }\n    .doc-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }\n    .badge-teleconsult { background: #eff6ff; color: #3b82f6; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }\n    .badge-disponible { background: #f0fdf4; color: #16a34a; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }\n\n    .card-body { padding: 12px 16px; flex: 1; }\n    .doc-name { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .doc-spec { font-size: 13px; color: #0d9488; font-weight: 600; margin: 0 0 10px; }\n    .doc-meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b; margin-bottom: 10px; }\n    .meta-icon { margin-right: 4px; }\n    .doc-bio { font-size: 12px; color: #475569; line-height: 1.5; margin: 0 0 8px; }\n    .doc-tarifs, .doc-assurances { font-size: 12px; color: #64748b; margin-bottom: 4px; display: flex; gap: 6px; align-items: flex-start; }\n    .tarif-label, .assur-label { font-weight: 600; flex-shrink: 0; }\n    .tarif-text, .assur-text { color: #475569; }\n\n    .card-actions { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #f1f5f9; background: #f8fafc; }\n    .btn-profile { flex: 1; padding: 8px; background: white; color: #0d9488; border: 1.5px solid #0d9488; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }\n    .btn-rdv { flex: 1; padding: 8px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; }\n    .btn-rdv:hover { background: #0f766e; }\n\n    .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 16px; background: white; border-radius: 14px; }\n    .btn-reset { padding: 10px 20px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n\n    /* MODAL */\n    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }\n    .modal-card { background: white; border-radius: 16px; width: 100%; max-width: 580px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.2); }\n    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: white; z-index: 1; }\n    .modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }\n    .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; color: #64748b; }\n    .modal-body { padding: 24px; }\n    .modal-footer { display: flex; gap: 12px; padding: 16px 24px; border-top: 1px solid #f1f5f9; position: sticky; bottom: 0; background: white; }\n\n    .profile-hero { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px; }\n    .profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #0d9488, #0891b2); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }\n    .avatar-img-lg { width: 100%; height: 100%; object-fit: cover; }\n    .avatar-initials-lg { color: white; font-size: 26px; font-weight: 700; }\n    .profile-intro h3 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .profile-spec { color: #0d9488; font-weight: 600; font-size: 14px; margin: 0 0 8px; }\n    .profile-badges { display: flex; gap: 6px; flex-wrap: wrap; }\n    .badge-video { background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }\n\n    .profile-sections { display: flex; flex-direction: column; gap: 20px; }\n    .profile-section h4 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #f1f5f9; }\n    .profile-section p { font-size: 14px; color: #475569; line-height: 1.6; margin: 0; }\n    .info-grid { display: flex; flex-direction: column; gap: 8px; }\n    .info-row { display: flex; gap: 12px; font-size: 13px; }\n    .info-label { color: #64748b; font-weight: 600; min-width: 90px; flex-shrink: 0; }\n    .maps-link { display: inline-flex; align-items: center; gap: 6px; color: #0d9488; text-decoration: none; font-size: 14px; font-weight: 600; padding: 8px 16px; background: #f0fdfa; border-radius: 8px; }\n    .maps-link:hover { background: #ccfbf1; }\n\n    .btn-outline { flex: 1; padding: 10px; background: white; color: #64748b; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n    .btn-rdv-lg { flex: 2; padding: 10px; background: #0d9488; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n    .btn-rdv-lg:hover { background: #0f766e; }\n\n    @media (max-width: 640px) {\n      .search-bar-main { flex-direction: column; }\n      .doctors-grid { grid-template-columns: 1fr; }\n    }\n  "]
        })
    ], PatientSearchMedecinComponent);
    return PatientSearchMedecinComponent;
}());
exports.PatientSearchMedecinComponent = PatientSearchMedecinComponent;
