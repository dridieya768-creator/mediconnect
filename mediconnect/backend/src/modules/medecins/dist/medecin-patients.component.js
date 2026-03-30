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
var MedecinPatientsComponent = /** @class */ (function () {
    function MedecinPatientsComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.cdr = core_1.inject(core_1.ChangeDetectorRef);
        this.appointments = core_1.signal([]);
        this.patients = core_1.signal(new Map());
        this.isLoading = core_1.signal(true);
        this.searchTerm = "";
        this.activeTab = "appointments";
        this.showModal = false;
        this.selectedAppointment = null;
        // Computed values
        this.totalPatients = core_1.computed(function () { return _this.patients().size; });
        this.totalAppointments = core_1.computed(function () { return _this.appointments().length; });
        this.completedAppointments = core_1.computed(function () {
            return _this.appointments().filter(function (a) { return a.status === "COMPLETED"; }).length;
        });
        this.pendingAppointments = core_1.computed(function () {
            return _this.appointments().filter(function (a) { return a.status === "REQUESTED"; }).length;
        });
        this.filteredAppointments = core_1.computed(function () {
            if (!_this.searchTerm)
                return _this.appointments();
            var term = _this.searchTerm.toLowerCase();
            return _this.appointments().filter(function (apt) {
                var _a, _b, _c;
                var patientName = _this.getPatientFullName(apt).toLowerCase();
                var patientEmail = ((_b = (_a = apt.patient) === null || _a === void 0 ? void 0 : _a.email) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || "";
                var motif = ((_c = apt.motif) === null || _c === void 0 ? void 0 : _c.toLowerCase()) || "";
                return patientName.includes(term) || patientEmail.includes(term) || motif.includes(term);
            });
        });
        this.filteredPatients = core_1.computed(function () {
            if (!_this.searchTerm)
                return Array.from(_this.patients().values());
            var term = _this.searchTerm.toLowerCase();
            return Array.from(_this.patients().values()).filter(function (patient) {
                var _a;
                var fullName = _this.getPatientFullNameFromPatient(patient).toLowerCase();
                var email = ((_a = patient.email) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
                return fullName.includes(term) || email.includes(term);
            });
        });
        this.upcomingAppointmentsList = core_1.computed(function () {
            var now = new Date();
            return _this.appointments()
                .filter(function (apt) { return new Date(apt.appointmentDate) >= now && apt.status === "CONFIRMED"; })
                .sort(function (a, b) { return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(); })
                .slice(0, 10);
        });
    }
    MedecinPatientsComponent.prototype.ngOnInit = function () {
        this.loadData();
    };
    MedecinPatientsComponent.prototype.loadData = function () {
        var _this = this;
        this.isLoading.set(true);
        // Récupérer l'ID du médecin
        this.http.get("/api/v1/medecins/me").subscribe({
            next: function (res) {
                var _a, _b, _c;
                if (!res) {
                    _this.isLoading.set(false);
                    return;
                }
                var data = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
                var doctorId = (data === null || data === void 0 ? void 0 : data.id) || (data === null || data === void 0 ? void 0 : data.userId) || (res === null || res === void 0 ? void 0 : res.userId) || (res === null || res === void 0 ? void 0 : res.id);
                if (!doctorId) {
                    console.error("Doctor ID not found");
                    _this.isLoading.set(false);
                    return;
                }
                // Récupérer les rendez-vous
                _this.http.get("/api/v1/appointments/doctor/" + doctorId).subscribe({
                    next: function (appts) {
                        var _a;
                        var list = Array.isArray(appts) ? appts :
                            Array.isArray(appts === null || appts === void 0 ? void 0 : appts.data) ? appts.data :
                                Array.isArray((_a = appts === null || appts === void 0 ? void 0 : appts.data) === null || _a === void 0 ? void 0 : _a.data) ? appts.data.data : [];
                        _this.appointments.set(list);
                        // Extraire les patients uniques
                        var patientsMap = new Map();
                        list.forEach(function (apt) {
                            if (apt.patient && apt.patient.id && !patientsMap.has(apt.patient.id)) {
                                patientsMap.set(apt.patient.id, apt.patient);
                            }
                        });
                        _this.patients.set(patientsMap);
                        _this.isLoading.set(false);
                        _this.cdr.detectChanges();
                    },
                    error: function (err) {
                        console.error("Error loading appointments:", err);
                        _this.isLoading.set(false);
                    }
                });
            },
            error: function (err) {
                console.error("Error loading doctor data:", err);
                _this.isLoading.set(false);
            }
        });
    };
    MedecinPatientsComponent.prototype.onSearch = function (value) {
        this.searchTerm = value;
    };
    MedecinPatientsComponent.prototype.getPatientFullName = function (apt) {
        if (!apt.patient)
            return "Patient";
        var prenom = apt.patient.prenom || apt.patient.firstName || "";
        var nom = apt.patient.nom || apt.patient.lastName || "";
        return (prenom + " " + nom).trim() || "Patient";
    };
    MedecinPatientsComponent.prototype.getPatientFullNameFromPatient = function (patient) {
        var prenom = patient.prenom || patient.firstName || "";
        var nom = patient.nom || patient.lastName || "";
        return (prenom + " " + nom).trim() || "Patient";
    };
    MedecinPatientsComponent.prototype.getPatientInitials = function (patient) {
        var prenom = patient.prenom || patient.firstName || "";
        var nom = patient.nom || patient.lastName || "";
        return ("" + (prenom[0] || "") + (nom[0] || "")).toUpperCase() || "P";
    };
    MedecinPatientsComponent.prototype.getPatientAppointmentCount = function (patientId) {
        return this.appointments().filter(function (apt) { return apt.patientId === patientId; }).length;
    };
    MedecinPatientsComponent.prototype.getLastAppointment = function (patientId) {
        var patientAppointments = this.appointments()
            .filter(function (apt) { return apt.patientId === patientId; })
            .sort(function (a, b) { return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime(); });
        return patientAppointments.length > 0 ? patientAppointments[0].appointmentDate : null;
    };
    MedecinPatientsComponent.prototype.formatDate = function (date) {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };
    MedecinPatientsComponent.prototype.formatDateTime = function (date) {
        return new Date(date).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    MedecinPatientsComponent.prototype.formatTime = function (date) {
        return new Date(date).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    MedecinPatientsComponent.prototype.formatDay = function (date) {
        return new Date(date).toLocaleDateString("fr-FR", { weekday: "short" });
    };
    MedecinPatientsComponent.prototype.formatDateNum = function (date) {
        return new Date(date).getDate().toString();
    };
    MedecinPatientsComponent.prototype.getStatusLabel = function (status) {
        var labels = {
            CONFIRMED: "Confirmé",
            REQUESTED: "En attente",
            CANCELLED: "Annulé",
            COMPLETED: "Terminé"
        };
        return labels[status] || status;
    };
    MedecinPatientsComponent.prototype.getStatusClass = function (status) {
        var classes = {
            CONFIRMED: "status-confirmed",
            REQUESTED: "status-pending",
            CANCELLED: "status-cancelled",
            COMPLETED: "status-completed"
        };
        return classes[status] || "status-pending";
    };
    MedecinPatientsComponent.prototype.exportData = function () {
        var data = {
            patients: Array.from(this.patients().values()),
            appointments: this.appointments(),
            exportedAt: new Date().toISOString()
        };
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "patients_data_" + new Date().toISOString() + ".json";
        a.click();
        URL.revokeObjectURL(url);
    };
    MedecinPatientsComponent.prototype.viewAppointmentDetails = function (apt) {
        this.selectedAppointment = apt;
        this.showModal = true;
    };
    MedecinPatientsComponent.prototype.editAppointment = function (apt) {
        console.log("Edit appointment:", apt);
        // TODO: Implémenter la navigation
    };
    MedecinPatientsComponent.prototype.cancelAppointment = function (apt) {
        if (confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) {
            // TODO: Appel API pour annuler le rendez-vous
            console.log("Cancel appointment:", apt);
        }
    };
    MedecinPatientsComponent.prototype.viewPatientHistory = function (patient) {
        console.log("View patient history:", patient);
        // TODO: Implémenter la navigation
    };
    MedecinPatientsComponent.prototype.createAppointmentForPatient = function (patient) {
        console.log("Create appointment for patient:", patient);
        // TODO: Implémenter la navigation
    };
    MedecinPatientsComponent.prototype.startConsultation = function (apt) {
        console.log("Start consultation:", apt);
        // TODO: Implémenter le lancement de la téléconsultation
    };
    MedecinPatientsComponent.prototype.closeModal = function () {
        this.showModal = false;
        this.selectedAppointment = null;
    };
    MedecinPatientsComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-patients",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink],
            template: "\n    <div class=\"patients-container\">\n      <!-- Header -->\n      <div class=\"patients-header\">\n        <div class=\"header-content\">\n          <h1 class=\"page-title\">\uD83D\uDC65 Gestion des Patients</h1>\n          <div class=\"header-actions\">\n            <div class=\"search-bar\">\n              <input \n                type=\"text\" \n                #searchInput\n                (input)=\"onSearch(searchInput.value)\" \n                placeholder=\"\uD83D\uDD0D Rechercher par nom, pr\u00E9nom, email...\"\n                class=\"search-input\"\n              />\n            </div>\n            <button class=\"btn-primary\" (click)=\"exportData()\">\n              \uD83D\uDCCA Exporter\n            </button>\n          </div>\n        </div>\n        <p class=\"page-subtitle\">Consultez et g\u00E9rez l'historique des rendez-vous de vos patients</p>\n      </div>\n\n      <!-- Loading State -->\n      <div class=\"loading-state\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div>\n        <p>Chargement des donn\u00E9es...</p>\n      </div>\n\n      <!-- Main Content -->\n      <div class=\"patients-content\" *ngIf=\"!isLoading()\">\n        <!-- Stats Cards -->\n        <div class=\"stats-row\">\n          <div class=\"stat-card\">\n            <div class=\"stat-icon\">\uD83D\uDC65</div>\n            <div class=\"stat-body\">\n              <div class=\"stat-val\">{{ totalPatients() }}</div>\n              <div class=\"stat-label\">Patients total</div>\n            </div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-icon\">\uD83D\uDCC5</div>\n            <div class=\"stat-body\">\n              <div class=\"stat-val\">{{ totalAppointments() }}</div>\n              <div class=\"stat-label\">Rendez-vous total</div>\n            </div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-icon\">\u2705</div>\n            <div class=\"stat-body\">\n              <div class=\"stat-val\">{{ completedAppointments() }}</div>\n              <div class=\"stat-label\">Consultations termin\u00E9es</div>\n            </div>\n          </div>\n          <div class=\"stat-card\">\n            <div class=\"stat-icon\">\u23F3</div>\n            <div class=\"stat-body\">\n              <div class=\"stat-val\">{{ pendingAppointments() }}</div>\n              <div class=\"stat-label\">En attente</div>\n            </div>\n          </div>\n        </div>\n\n        <!-- Tabs -->\n        <div class=\"tabs\">\n          <button \n            class=\"tab-btn\" \n            [class.active]=\"activeTab === 'appointments'\"\n            (click)=\"activeTab = 'appointments'\">\n            \uD83D\uDCCB Tous les rendez-vous\n          </button>\n          <button \n            class=\"tab-btn\" \n            [class.active]=\"activeTab === 'patients'\"\n            (click)=\"activeTab = 'patients'\">\n            \uD83D\uDC65 Liste des patients\n          </button>\n          <button \n            class=\"tab-btn\" \n            [class.active]=\"activeTab === 'upcoming'\"\n            (click)=\"activeTab = 'upcoming'\">\n            \uD83D\uDCC5 Prochains rendez-vous\n          </button>\n        </div>\n\n        <!-- Appointments List Tab -->\n        <div class=\"tab-content\" *ngIf=\"activeTab === 'appointments'\">\n          <div class=\"appointments-table-container\">\n            <table class=\"appointments-table\">\n              <thead>\n                <tr>\n                  <th>Date & Heure</th>\n                  <th>Patient</th>\n                  <th>Type</th>\n                  <th>Dur\u00E9e</th>\n                  <th>Motif</th>\n                  <th>Statut</th>\n                  <th>Actions</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr *ngFor=\"let apt of filteredAppointments()\">\n                  <td class=\"appt-date\">\n                    <div class=\"date-time\">\n                      <span class=\"date\">{{ formatDate(apt.appointmentDate) }}</span>\n                      <span class=\"time\">{{ formatTime(apt.appointmentDate) }}</span>\n                    </div>\n                  </td>\n                  <td class=\"patient-info\">\n                    <div class=\"patient-name\">{{ getPatientFullName(apt) }}</div>\n                    <div class=\"patient-contact\" *ngIf=\"apt.patient?.email || apt.patient?.telephone\">\n                      <span *ngIf=\"apt.patient?.email\" class=\"email\">{{ apt.patient.email }}</span>\n                      <span *ngIf=\"apt.patient?.telephone\" class=\"phone\">{{ apt.patient.telephone }}</span>\n                    </div>\n                  </td>\n                  <td>\n                    <span class=\"type-badge\" [class.teleconsult]=\"apt.consultationType === 'TELECONSULTATION'\">\n                      {{ apt.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9consultation' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}\n                    </span>\n                  </td>\n                  <td>{{ apt.durationMinutes }} min</td>\n                  <td class=\"motif-cell\">\n                    <span class=\"motif-text\">{{ apt.motif || 'Non sp\u00E9cifi\u00E9' }}</span>\n                  </td>\n                  <td>\n                    <span class=\"status-pill\" [class]=\"getStatusClass(apt.status)\">\n                      {{ getStatusLabel(apt.status) }}\n                    </span>\n                  </td>\n                  <td class=\"actions\">\n                    <button class=\"action-btn view\" (click)=\"viewAppointmentDetails(apt)\" title=\"Voir d\u00E9tails\">\n                      \uD83D\uDC41\uFE0F\n                    </button>\n                    <button class=\"action-btn edit\" (click)=\"editAppointment(apt)\" title=\"Modifier\">\n                      \u270F\uFE0F\n                    </button>\n                    <button class=\"action-btn cancel\" (click)=\"cancelAppointment(apt)\" title=\"Annuler\" *ngIf=\"apt.status === 'CONFIRMED'\">\n                      \u274C\n                    </button>\n                  </td>\n                </tr>\n                <tr *ngIf=\"filteredAppointments().length === 0\">\n                  <td colspan=\"7\" class=\"empty-state\">\n                    <span>\uD83D\uDCED</span>\n                    <p>Aucun rendez-vous trouv\u00E9</p>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n\n        <!-- Patients List Tab -->\n        <div class=\"tab-content\" *ngIf=\"activeTab === 'patients'\">\n          <div class=\"patients-grid\">\n            <div class=\"patient-card\" *ngFor=\"let patient of filteredPatients()\">\n              <div class=\"patient-avatar\">\n                {{ getPatientInitials(patient) }}\n              </div>\n              <div class=\"patient-details\">\n                <h3 class=\"patient-name\">{{ getPatientFullNameFromPatient(patient) }}</h3>\n                <div class=\"patient-contact-info\">\n                  <span *ngIf=\"patient.email\" class=\"contact-item\">\uD83D\uDCE7 {{ patient.email }}</span>\n                  <span *ngIf=\"patient.telephone\" class=\"contact-item\">\uD83D\uDCDE {{ patient.telephone }}</span>\n                </div>\n                <div class=\"patient-stats\">\n                  <span class=\"stat-badge\">\n                    \uD83D\uDCCA {{ getPatientAppointmentCount(patient.id) }} RDV\n                  </span>\n                  <span class=\"stat-badge\" *ngIf=\"getLastAppointment(patient.id)\">\n                    \uD83D\uDD52 Dernier: {{ formatDate(getLastAppointment(patient.id)!) }}\n                  </span>\n                </div>\n              </div>\n              <div class=\"patient-actions\">\n                <button class=\"action-btn\" (click)=\"viewPatientHistory(patient)\" title=\"Voir historique\">\n                  \uD83D\uDCCB Historique\n                </button>\n                <button class=\"action-btn\" (click)=\"createAppointmentForPatient(patient)\" title=\"Prendre RDV\">\n                  \uD83D\uDCC5 RDV\n                </button>\n              </div>\n            </div>\n            <div *ngIf=\"filteredPatients().length === 0\" class=\"empty-state-full\">\n              <span>\uD83D\uDC65</span>\n              <p>Aucun patient trouv\u00E9</p>\n            </div>\n          </div>\n        </div>\n\n        <!-- Upcoming Appointments Tab -->\n        <div class=\"tab-content\" *ngIf=\"activeTab === 'upcoming'\">\n          <div class=\"upcoming-list\">\n            <div class=\"upcoming-item\" *ngFor=\"let apt of upcomingAppointmentsList()\">\n              <div class=\"upcoming-date-badge\">\n                <div class=\"day\">{{ formatDay(apt.appointmentDate) }}</div>\n                <div class=\"date-num\">{{ formatDateNum(apt.appointmentDate) }}</div>\n              </div>\n              <div class=\"upcoming-details\">\n                <div class=\"upcoming-patient\">{{ getPatientFullName(apt) }}</div>\n                <div class=\"upcoming-time\">\n                  \u23F0 {{ formatTime(apt.appointmentDate) }} \u2022 {{ apt.durationMinutes }} min\n                </div>\n                <div class=\"upcoming-type\">\n                  {{ apt.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9consultation' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}\n                  <span class=\"motif\" *ngIf=\"apt.motif\">\u2022 {{ apt.motif }}</span>\n                </div>\n              </div>\n              <div class=\"upcoming-actions\">\n                <button class=\"action-btn\" (click)=\"startConsultation(apt)\" *ngIf=\"apt.consultationType === 'TELECONSULTATION'\">\n                  \uD83C\uDFA5 D\u00E9marrer\n                </button>\n                <button class=\"action-btn\" (click)=\"viewAppointmentDetails(apt)\">\n                  \uD83D\uDC41\uFE0F D\u00E9tails\n                </button>\n              </div>\n            </div>\n            <div *ngIf=\"upcomingAppointmentsList().length === 0\" class=\"empty-state-full\">\n              <span>\uD83C\uDF89</span>\n              <p>Aucun rendez-vous \u00E0 venir</p>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <!-- Modal pour d\u00E9tails du rendez-vous -->\n      <div class=\"modal\" [class.show]=\"showModal\" (click)=\"closeModal()\">\n        <div class=\"modal-content\" (click)=\"$event.stopPropagation()\">\n          <div class=\"modal-header\">\n            <h2>\uD83D\uDCCB D\u00E9tails du rendez-vous</h2>\n            <button class=\"close-btn\" (click)=\"closeModal()\">\u2715</button>\n          </div>\n          <div class=\"modal-body\" *ngIf=\"selectedAppointment\">\n            <div class=\"detail-row\">\n              <label>Patient:</label>\n              <span>{{ getPatientFullName(selectedAppointment) }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Date & Heure:</label>\n              <span>{{ formatDateTime(selectedAppointment.appointmentDate) }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Type:</label>\n              <span>{{ selectedAppointment.consultationType === 'TELECONSULTATION' ? 'T\u00E9l\u00E9consultation' : 'Pr\u00E9sentiel' }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Dur\u00E9e:</label>\n              <span>{{ selectedAppointment.durationMinutes }} minutes</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Motif:</label>\n              <span>{{ selectedAppointment.motif || 'Non sp\u00E9cifi\u00E9' }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Notes:</label>\n              <span>{{ selectedAppointment.notes || 'Aucune note' }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <label>Statut:</label>\n              <span class=\"status-pill\" [class]=\"getStatusClass(selectedAppointment.status)\">\n                {{ getStatusLabel(selectedAppointment.status) }}\n              </span>\n            </div>\n            <div class=\"detail-row\" *ngIf=\"selectedAppointment.patient\">\n              <label>Contact patient:</label>\n              <span>\n                {{ selectedAppointment.patient.email || 'Email non renseign\u00E9' }}<br>\n                {{ selectedAppointment.patient.telephone || 'T\u00E9l\u00E9phone non renseign\u00E9' }}\n              </span>\n            </div>\n          </div>\n          <div class=\"modal-footer\">\n            <button class=\"btn-secondary\" (click)=\"closeModal()\">Fermer</button>\n            <button class=\"btn-primary\" *ngIf=\"selectedAppointment?.status === 'CONFIRMED'\" (click)=\"editAppointment(selectedAppointment)\">\n              \u270F\uFE0F Modifier\n            </button>\n          </div>\n        </div>\n      </div>\n    </div>\n  ",
            styles: [ /* ... styles identiques à avant ... */]
        })
    ], MedecinPatientsComponent);
    return MedecinPatientsComponent;
}());
exports.MedecinPatientsComponent = MedecinPatientsComponent;
