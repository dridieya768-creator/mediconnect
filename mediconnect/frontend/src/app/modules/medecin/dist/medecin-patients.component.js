"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.MedecinPatientsComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MedecinPatientsComponent = /** @class */ (function () {
    function MedecinPatientsComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.appointments = core_1.signal([]);
        this.patients = core_1.signal([]);
        this.isLoading = core_1.signal(true);
        this.searchTerm = core_1.signal("");
        this.activeTab = core_1.signal("patients");
        this.selectedPatient = core_1.signal(null);
        this.selectedAppt = core_1.signal(null);
        // ── Computed ──────────────────────────────────────────────────────────────
        this.filteredPatients = core_1.computed(function () {
            var term = _this.searchTerm().toLowerCase();
            if (!term)
                return _this.patients();
            return _this.patients().filter(function (p) {
                return _this.getFullName(p).toLowerCase().includes(term) ||
                    (p.email || "").toLowerCase().includes(term) ||
                    (p.phone || "").includes(term);
            });
        });
        this.confirmedCount = core_1.computed(function () { return _this.appointments().filter(function (a) { return a.status === "CONFIRMED"; }).length; });
        this.completedCount = core_1.computed(function () { return _this.appointments().filter(function (a) { return a.status === "COMPLETED"; }).length; });
        this.pendingCount = core_1.computed(function () { return _this.appointments().filter(function (a) { return a.status === "REQUESTED"; }).length; });
        this.filteredAppointments = core_1.computed(function () {
            var term = _this.searchTerm().toLowerCase();
            if (!term)
                return _this.appointments();
            return _this.appointments().filter(function (a) {
                return _this.getApptPatientName(a).toLowerCase().includes(term) ||
                    _this.getApptPatientEmail(a).toLowerCase().includes(term);
            });
        });
        this.upcomingList = core_1.computed(function () {
            var now = new Date();
            return _this.appointments()
                .filter(function (a) { return new Date(a.appointmentDate) >= now
                && (a.status === "CONFIRMED" || a.status === "REQUESTED"); })
                .sort(function (a, b) { return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(); })
                .slice(0, 20);
        });
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    MedecinPatientsComponent.prototype.ngOnInit = function () { this.loadData(); };
    MedecinPatientsComponent.prototype.loadData = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c;
            var doctorId = ((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.id) || ((_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.id) || (res === null || res === void 0 ? void 0 : res.id) || null;
            if (!doctorId) {
                _this.isLoading.set(false);
                return;
            }
            // Charger les RDV (pour les tabs RDV et À venir)
            _this.http.get("/api/v1/appointments/doctor/" + doctorId)
                .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }))
                .subscribe(function (appts) {
                var _a;
                var list = Array.isArray(appts) ? appts :
                    Array.isArray(appts === null || appts === void 0 ? void 0 : appts.data) ? appts.data :
                        Array.isArray((_a = appts === null || appts === void 0 ? void 0 : appts.data) === null || _a === void 0 ? void 0 : _a.data) ? appts.data.data : [];
                _this.appointments.set(list);
            });
            // ✅ Charger les patients filtrés par RDV CONFIRMED/COMPLETED
            _this.http.get("/api/v1/medecins/my-patients")
                .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }))
                .subscribe(function (res) {
                var list = Array.isArray(res) ? res :
                    Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data : [];
                _this.patients.set(list);
                _this.isLoading.set(false);
            });
        });
    };
    // ── Helpers ───────────────────────────────────────────────────────────────
    MedecinPatientsComponent.prototype.getFullName = function (p) {
        var first = p.firstName || "";
        var last = p.lastName || "";
        return (first + " " + last).trim() || p.email || "Patient";
    };
    MedecinPatientsComponent.prototype.getInitials = function (p) {
        var _a, _b, _c;
        var first = ((_a = p.firstName) === null || _a === void 0 ? void 0 : _a[0]) || ((_b = p.email) === null || _b === void 0 ? void 0 : _b[0]) || "P";
        var last = ((_c = p.lastName) === null || _c === void 0 ? void 0 : _c[0]) || "";
        return (first + last).toUpperCase();
    };
    MedecinPatientsComponent.prototype.getApptPatientName = function (a) {
        var p = a.patient;
        if (!p)
            return "Patient";
        var first = p.firstName || p.first_name || "";
        var last = p.lastName || p.last_name || "";
        return (first + " " + last).trim() || p.email || "Patient";
    };
    MedecinPatientsComponent.prototype.getApptPatientEmail = function (a) {
        var _a;
        return ((_a = a.patient) === null || _a === void 0 ? void 0 : _a.email) || "—";
    };
    MedecinPatientsComponent.prototype.getPatientAppts = function (patientId) {
        return this.appointments().filter(function (a) { return a.patientId === patientId; });
    };
    MedecinPatientsComponent.prototype.selectPatient = function (p) { this.selectedPatient.set(p); };
    MedecinPatientsComponent.prototype.openAppt = function (a) { this.selectedAppt.set(a); };
    MedecinPatientsComponent.prototype.formatDate = function (d) {
        return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    };
    MedecinPatientsComponent.prototype.formatDay = function (d) {
        return new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
    };
    MedecinPatientsComponent.prototype.formatTime = function (d) {
        return new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    };
    MedecinPatientsComponent.prototype.getStatusLabel = function (s) {
        return { CONFIRMED: "Confirmé", REQUESTED: "En attente", CANCELLED: "Annulé", COMPLETED: "Terminé" }[s] || s;
    };
    MedecinPatientsComponent.prototype.getStatusClass = function (s) {
        return { CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed" }[s] || "";
    };
    MedecinPatientsComponent.prototype.exportData = function () {
        var data = {
            patients: this.patients(),
            appointments: this.appointments(),
            exportedAt: new Date().toISOString()
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "patients_" + new Date().toISOString().slice(0, 10) + ".json";
        a.click();
        URL.revokeObjectURL(url);
    };
    MedecinPatientsComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-patients",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink],
            template: "\n    <div class=\"patients-page\">\n\n      <!-- HEADER -->\n      <div class=\"page-header\">\n        <div>\n          <h1 class=\"page-title\">\uD83D\uDC65 Mes Patients</h1>\n          <p class=\"page-subtitle\">Patients ayant des rendez-vous confirm\u00E9s avec vous</p>\n        </div>\n        <div class=\"header-actions\">\n          <div class=\"search-wrap\">\n            <span class=\"search-icon\">\uD83D\uDD0D</span>\n            <input\n              type=\"text\"\n              #searchInput\n              (input)=\"searchTerm.set(searchInput.value)\"\n              placeholder=\"Rechercher par nom, email...\"\n              class=\"search-input\"\n            />\n          </div>\n          <button class=\"btn-export\" (click)=\"exportData()\">\uD83D\uDCCA Exporter</button>\n        </div>\n      </div>\n\n      <!-- LOADING -->\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div>\n        <p>Chargement des patients...</p>\n      </div>\n\n      <div *ngIf=\"!isLoading()\">\n\n        <!-- STATS -->\n        <div class=\"stats-row\">\n          <div class=\"stat-card indigo\">\n            <div class=\"stat-icon\">\uD83D\uDC65</div>\n            <div>\n              <div class=\"stat-val\">{{ patients().length }}</div>\n              <div class=\"stat-label\">Patients uniques</div>\n            </div>\n          </div>\n          <div class=\"stat-card green\">\n            <div class=\"stat-icon\">\u2705</div>\n            <div>\n              <div class=\"stat-val\">{{ confirmedCount() }}</div>\n              <div class=\"stat-label\">RDV confirm\u00E9s</div>\n            </div>\n          </div>\n          <div class=\"stat-card blue\">\n            <div class=\"stat-icon\">\u2714\uFE0F</div>\n            <div>\n              <div class=\"stat-val\">{{ completedCount() }}</div>\n              <div class=\"stat-label\">Consultations termin\u00E9es</div>\n            </div>\n          </div>\n          <div class=\"stat-card orange\">\n            <div class=\"stat-icon\">\u23F3</div>\n            <div>\n              <div class=\"stat-val\">{{ pendingCount() }}</div>\n              <div class=\"stat-label\">En attente</div>\n            </div>\n          </div>\n        </div>\n\n        <!-- TABS -->\n        <div class=\"tabs-bar\">\n          <button class=\"tab-btn\" [class.active]=\"activeTab() === 'patients'\" (click)=\"activeTab.set('patients')\">\n            \uD83D\uDC65 Patients <span class=\"tab-pill\">{{ filteredPatients().length }}</span>\n          </button>\n          <button class=\"tab-btn\" [class.active]=\"activeTab() === 'rdv'\" (click)=\"activeTab.set('rdv')\">\n            \uD83D\uDCCB Tous les RDV <span class=\"tab-pill\">{{ appointments().length }}</span>\n          </button>\n          <button class=\"tab-btn\" [class.active]=\"activeTab() === 'upcoming'\" (click)=\"activeTab.set('upcoming')\">\n            \uD83D\uDCC5 \u00C0 venir <span class=\"tab-pill\">{{ upcomingList().length }}</span>\n          </button>\n        </div>\n\n        <!-- \u2550\u2550 TAB PATIENTS \u2550\u2550 -->\n        <div *ngIf=\"activeTab() === 'patients'\">\n          <div class=\"patients-grid\" *ngIf=\"filteredPatients().length > 0\">\n            <div class=\"patient-card\" *ngFor=\"let p of filteredPatients()\" (click)=\"selectPatient(p)\">\n              <div class=\"patient-avatar\">{{ getInitials(p) }}</div>\n              <div class=\"patient-info\">\n                <div class=\"patient-name\">{{ getFullName(p) }}</div>\n                <div class=\"patient-email\">{{ p.email }}</div>\n                <div class=\"patient-phone\" *ngIf=\"p.phone\">\uD83D\uDCDE {{ p.phone }}</div>\n                <div class=\"patient-rdv-count\">\n                  <span class=\"rdv-badge\">{{ p.rdvCount }} RDV</span>\n                </div>\n              </div>\n              <div class=\"patient-arrow\">\u203A</div>\n            </div>\n          </div>\n          <div class=\"empty-state\" *ngIf=\"filteredPatients().length === 0\">\n            <div style=\"font-size:48px\">\uD83D\uDC65</div>\n            <p>Aucun patient trouv\u00E9</p>\n            <small *ngIf=\"searchTerm()\">Essayez un autre terme de recherche</small>\n            <small *ngIf=\"!searchTerm()\">Vos patients appara\u00EEtront ici apr\u00E8s confirmation de RDV</small>\n          </div>\n        </div>\n\n        <!-- \u2550\u2550 TAB RDV \u2550\u2550 -->\n        <div *ngIf=\"activeTab() === 'rdv'\">\n          <div class=\"table-card\">\n            <table class=\"rdv-table\">\n              <thead>\n                <tr>\n                  <th>Date</th>\n                  <th>Patient</th>\n                  <th>Email</th>\n                  <th>Type</th>\n                  <th>Dur\u00E9e</th>\n                  <th>Statut</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr *ngFor=\"let a of filteredAppointments()\" (click)=\"openAppt(a)\" class=\"table-row\">\n                  <td>\n                    <div class=\"appt-date\">{{ formatDate(a.appointmentDate) }}</div>\n                    <div class=\"appt-time\">{{ formatTime(a.appointmentDate) }}</div>\n                  </td>\n                  <td><strong>{{ getApptPatientName(a) }}</strong></td>\n                  <td class=\"email-cell\">{{ getApptPatientEmail(a) }}</td>\n                  <td>\n                    <span class=\"type-badge\">\n                      {{ a.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}\n                    </span>\n                  </td>\n                  <td>{{ a.durationMinutes }} min</td>\n                  <td>\n                    <span class=\"status-pill\" [ngClass]=\"getStatusClass(a.status)\">\n                      {{ getStatusLabel(a.status) }}\n                    </span>\n                  </td>\n                </tr>\n                <tr *ngIf=\"filteredAppointments().length === 0\">\n                  <td colspan=\"6\" class=\"empty-state\">Aucun RDV trouv\u00E9</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n\n        <!-- \u2550\u2550 TAB \u00C0 VENIR \u2550\u2550 -->\n        <div *ngIf=\"activeTab() === 'upcoming'\">\n          <div class=\"upcoming-list\">\n            <div class=\"upcoming-item\" *ngFor=\"let a of upcomingList()\">\n              <div class=\"upcoming-date-block\">\n                <div class=\"upcoming-day\">{{ formatDay(a.appointmentDate) }}</div>\n                <div class=\"upcoming-time\">{{ formatTime(a.appointmentDate) }}</div>\n              </div>\n              <div class=\"upcoming-sep\"></div>\n              <div class=\"upcoming-info\">\n                <div class=\"upcoming-name\">{{ getApptPatientName(a) }}</div>\n                <div class=\"upcoming-meta\">\n                  <span>{{ a.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9consultation' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}</span>\n                  <span>{{ a.durationMinutes }} min</span>\n                </div>\n              </div>\n              <span class=\"status-pill\" [ngClass]=\"getStatusClass(a.status)\">\n                {{ getStatusLabel(a.status) }}\n              </span>\n            </div>\n            <div class=\"empty-state\" *ngIf=\"upcomingList().length === 0\">\n              <div style=\"font-size:48px\">\uD83D\uDCC5</div>\n              <p>Aucun RDV \u00E0 venir</p>\n            </div>\n          </div>\n        </div>\n\n      </div>\n\n      <!-- MODAL PATIENT DETAIL -->\n      <ng-container *ngIf=\"selectedPatient() as p\">\n        <div class=\"modal-overlay\" (click)=\"selectedPatient.set(null)\">\n          <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n            <div class=\"modal-head\">\n              <div class=\"modal-avatar\">{{ getInitials(p) }}</div>\n              <div>\n                <div class=\"modal-name\">{{ getFullName(p) }}</div>\n                <div class=\"modal-email\">{{ p.email }}</div>\n              </div>\n              <button class=\"btn-close\" (click)=\"selectedPatient.set(null)\">\u2715</button>\n            </div>\n            <div class=\"modal-body\">\n              <div class=\"detail-row\" *ngIf=\"p.phone\">\n                <span class=\"detail-label\">\uD83D\uDCDE T\u00E9l\u00E9phone</span>\n                <span>{{ p.phone }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDCC5 Nombre de RDV</span>\n                <span>{{ p.rdvCount }} rendez-vous</span>\n              </div>\n              <div class=\"detail-sub\">Historique des RDV</div>\n              <div class=\"patient-appt-list\">\n                <div class=\"patient-appt-item\" *ngFor=\"let a of getPatientAppts(p.id)\">\n                  <span class=\"appt-date-sm\">{{ formatDate(a.appointmentDate) }} {{ formatTime(a.appointmentDate) }}</span>\n                  <span class=\"type-badge-sm\">{{ a.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB' : '\uD83C\uDFE5' }}</span>\n                  <span class=\"status-pill\" [ngClass]=\"getStatusClass(a.status)\">{{ getStatusLabel(a.status) }}</span>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- MODAL RDV DETAIL -->\n      <ng-container *ngIf=\"selectedAppt() as a\">\n        <div class=\"modal-overlay\" (click)=\"selectedAppt.set(null)\">\n          <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n            <div class=\"modal-head\">\n              <div>\n                <div class=\"modal-name\">D\u00E9tail du rendez-vous</div>\n                <div class=\"modal-email\">{{ formatDate(a.appointmentDate) }} \u00E0 {{ formatTime(a.appointmentDate) }}</div>\n              </div>\n              <button class=\"btn-close\" (click)=\"selectedAppt.set(null)\">\u2715</button>\n            </div>\n            <div class=\"modal-body\">\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDC64 Patient</span>\n                <span>{{ getApptPatientName(a) }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDCE7 Email</span>\n                <span>{{ getApptPatientEmail(a) }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83C\uDFE5 Type</span>\n                <span>{{ a.consultationType === 'TELECONSULTATION' ? 'T\u00E9l\u00E9consultation' : 'Pr\u00E9sentiel' }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\u23F1 Dur\u00E9e</span>\n                <span>{{ a.durationMinutes }} min</span>\n              </div>\n              <div class=\"detail-row\" *ngIf=\"a.reason\">\n                <span class=\"detail-label\">\uD83D\uDCDD Motif</span>\n                <span>{{ a.reason }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDCCC Statut</span>\n                <span class=\"status-pill\" [ngClass]=\"getStatusClass(a.status)\">\n                  {{ getStatusLabel(a.status) }}\n                </span>\n              </div>\n            </div>\n          </div>\n        </div>\n      </ng-container>\n\n    </div>\n  ",
            styles: ["\n    .patients-page { padding: 0; }\n\n    /* \u2500\u2500 Header \u2500\u2500 */\n    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }\n    .page-title  { font-size: 26px; font-weight: 700; color: #0f172a; margin: 0 0 4px; }\n    .page-subtitle { color: #64748b; font-size: 14px; margin: 0; }\n    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }\n    .search-wrap { position: relative; }\n    .search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 14px; }\n    .search-input { padding: 9px 12px 9px 32px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 14px; width: 240px; outline: none; }\n    .search-input:focus { border-color: #4f46e5; }\n    .btn-export { padding: 9px 18px; background: white; color: #4f46e5; border: 1.5px solid #4f46e5; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }\n\n    /* \u2500\u2500 Loading \u2500\u2500 */\n    .loading-state { display: flex; flex-direction: column; align-items: center; padding: 60px; color: #64748b; gap: 12px; }\n    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #4f46e5; border-radius: 50%; animation: spin .8s linear infinite; }\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    /* \u2500\u2500 Stats \u2500\u2500 */\n    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }\n    .stat-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 16px 20px; display: flex; align-items: center; gap: 14px; }\n    .stat-card.indigo { border-left: 4px solid #4f46e5; }\n    .stat-card.green  { border-left: 4px solid #16a34a; }\n    .stat-card.blue   { border-left: 4px solid #3b82f6; }\n    .stat-card.orange { border-left: 4px solid #d97706; }\n    .stat-icon { font-size: 26px; }\n    .stat-val   { font-size: 22px; font-weight: 800; color: #0f172a; }\n    .stat-label { font-size: 12px; color: #64748b; }\n\n    /* \u2500\u2500 Tabs \u2500\u2500 */\n    .tabs-bar { display: flex; gap: 8px; margin-bottom: 20px; }\n    .tab-btn { padding: 8px 18px; border: 1.5px solid #e2e8f0; border-radius: 24px; background: white; font-size: 13px; cursor: pointer; color: #64748b; display: flex; align-items: center; gap: 6px; transition: all .15s; }\n    .tab-btn.active { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; font-weight: 600; }\n    .tab-pill { background: #e2e8f0; color: #64748b; border-radius: 10px; padding: 1px 7px; font-size: 11px; }\n    .tab-btn.active .tab-pill { background: #4f46e5; color: white; }\n\n    /* \u2500\u2500 Patients grid \u2500\u2500 */\n    .patients-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }\n    .patient-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .15s; }\n    .patient-card:hover { border-color: #4f46e5; box-shadow: 0 4px 16px rgba(79,70,229,.1); }\n    .patient-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n    .patient-info { flex: 1; min-width: 0; }\n    .patient-name  { font-size: 15px; font-weight: 700; color: #0f172a; }\n    .patient-email { font-size: 12px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }\n    .patient-phone { font-size: 12px; color: #64748b; margin-top: 2px; }\n    .rdv-badge { background: #eef2ff; color: #4f46e5; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 600; margin-top: 4px; display: inline-block; }\n    .patient-arrow { color: #94a3b8; font-size: 20px; }\n\n    /* \u2500\u2500 Table RDV \u2500\u2500 */\n    .table-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; overflow: hidden; }\n    .rdv-table { width: 100%; border-collapse: collapse; }\n    .rdv-table th { padding: 12px 16px; background: #f8fafc; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .04em; text-align: left; border-bottom: 1px solid #e2e8f0; }\n    .rdv-table td { padding: 12px 16px; border-bottom: 1px solid #f8fafc; font-size: 14px; }\n    .table-row { cursor: pointer; transition: background .1s; }\n    .table-row:hover { background: #fafbff; }\n    .appt-date { font-weight: 600; color: #0f172a; font-size: 13px; }\n    .appt-time { font-size: 11px; color: #94a3b8; }\n    .email-cell { color: #64748b; font-size: 12px; }\n    .type-badge { background: #f1f5f9; color: #475569; border-radius: 6px; padding: 3px 8px; font-size: 11px; font-weight: 600; }\n\n    /* \u2500\u2500 Upcoming \u2500\u2500 */\n    .upcoming-list { display: flex; flex-direction: column; gap: 10px; }\n    .upcoming-item { background: white; border-radius: 12px; border: 1.5px solid #e2e8f0; padding: 14px 18px; display: flex; align-items: center; gap: 16px; }\n    .upcoming-date-block { text-align: center; min-width: 60px; }\n    .upcoming-day  { font-size: 13px; font-weight: 700; color: #0f172a; }\n    .upcoming-time { font-size: 11px; color: #94a3b8; margin-top: 2px; }\n    .upcoming-sep  { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }\n    .upcoming-info { flex: 1; }\n    .upcoming-name { font-size: 14px; font-weight: 600; color: #0f172a; }\n    .upcoming-meta { display: flex; gap: 10px; font-size: 12px; color: #64748b; margin-top: 3px; }\n\n    /* \u2500\u2500 Status pills \u2500\u2500 */\n    .status-pill      { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }\n    .status-confirmed { background: #f0fdf4; color: #16a34a; }\n    .status-pending   { background: #fffbeb; color: #d97706; }\n    .status-cancelled { background: #fef2f2; color: #dc2626; }\n    .status-completed { background: #f1f5f9; color: #475569; }\n\n    /* \u2500\u2500 Empty state \u2500\u2500 */\n    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; color: #94a3b8; gap: 8px; text-align: center; background: white; border-radius: 14px; }\n\n    /* \u2500\u2500 Modals \u2500\u2500 */\n    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 999; padding: 20px; }\n    .modal-card    { background: white; border-radius: 16px; width: 100%; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,.2); overflow: hidden; }\n    .modal-head    { display: flex; align-items: center; gap: 14px; padding: 20px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }\n    .modal-avatar  { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }\n    .modal-name    { font-size: 16px; font-weight: 700; color: #0f172a; }\n    .modal-email   { font-size: 12px; color: #64748b; margin-top: 2px; }\n    .btn-close     { margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }\n    .modal-body    { padding: 20px; }\n    .detail-row    { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }\n    .detail-label  { color: #64748b; }\n    .detail-sub    { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; margin: 16px 0 8px; }\n    .patient-appt-list { display: flex; flex-direction: column; gap: 6px; }\n    .patient-appt-item { display: flex; align-items: center; gap: 10px; padding: 8px; background: #f8fafc; border-radius: 8px; font-size: 12px; }\n    .appt-date-sm  { flex: 1; color: #475569; }\n    .type-badge-sm { font-size: 14px; }\n\n    /* \u2500\u2500 Responsive \u2500\u2500 */\n    @media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }\n    @media (max-width: 640px) {\n      .patients-grid { grid-template-columns: 1fr; }\n      .rdv-table .email-cell { display: none; }\n    }\n  "]
        })
    ], MedecinPatientsComponent);
    return MedecinPatientsComponent;
}());
exports.MedecinPatientsComponent = MedecinPatientsComponent;
