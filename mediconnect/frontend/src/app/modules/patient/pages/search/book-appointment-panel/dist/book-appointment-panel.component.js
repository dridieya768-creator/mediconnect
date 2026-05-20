"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.BookAppointmentPanelComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var http_1 = require("@angular/common/http");
var medecin_availability_service_1 = require("../../../../../core/services/medecin-availability.service");
var booking_state_service_1 = require("../../../../../core/services/booking-state.service");
var appointment_service_1 = require("../../../../../core/services/appointment.service");
var auth_service_1 = require("../../../../../core/services/auth.service");
var weekly_calendar_component_1 = require("../weekly-calendar/weekly-calendar.component");
var appointment_form_component_1 = require("../appointment-form/appointment-form.component");
var BookAppointmentPanelComponent = /** @class */ (function () {
    function BookAppointmentPanelComponent() {
        this.medecin = null;
        this.closed = new core_1.EventEmitter();
        this.booked = new core_1.EventEmitter();
        this.availabilityService = core_1.inject(medecin_availability_service_1.MedecinAvailabilityService);
        this.appointmentService = core_1.inject(appointment_service_1.AppointmentService);
        this.authService = core_1.inject(auth_service_1.AuthService);
        this.http = core_1.inject(http_1.HttpClient);
        this.bookingState = core_1.inject(booking_state_service_1.BookingStateService);
        this.availability = core_1.signal(null);
        this.occupiedSlots = core_1.signal([]);
        this.conges = core_1.signal([]);
        this.loadingAvailability = core_1.signal(false);
        this.errorMessage = core_1.signal(null);
    }
    Object.defineProperty(BookAppointmentPanelComponent.prototype, "doctorFullName", {
        get: function () {
            var _a, _b, _c, _d, _e;
            if (!this.medecin)
                return '';
            var prenom = (_b = (_a = this.medecin.prenom) !== null && _a !== void 0 ? _a : this.medecin.firstName) !== null && _b !== void 0 ? _b : '';
            var nom = (_e = (_d = (_c = this.medecin.nom) !== null && _c !== void 0 ? _c : this.medecin.lastName) !== null && _d !== void 0 ? _d : this.medecin.name) !== null && _e !== void 0 ? _e : '';
            return ("Dr. " + prenom + " " + nom).trim();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BookAppointmentPanelComponent.prototype, "doctorPhoto", {
        get: function () {
            var _a, _b, _c, _d, _e, _f;
            var photo = (_f = (_c = (_b = (_a = this.medecin) === null || _a === void 0 ? void 0 : _a.profile) === null || _b === void 0 ? void 0 : _b.photoPro) !== null && _c !== void 0 ? _c : (_e = (_d = this.medecin) === null || _d === void 0 ? void 0 : _d.profile) === null || _e === void 0 ? void 0 : _e.photoUrl) !== null && _f !== void 0 ? _f : null;
            return photo ? String(photo) : null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BookAppointmentPanelComponent.prototype, "doctorInitials", {
        get: function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var prenom = (_d = (_b = (_a = this.medecin) === null || _a === void 0 ? void 0 : _a.prenom) !== null && _b !== void 0 ? _b : (_c = this.medecin) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '';
            var nom = (_h = (_f = (_e = this.medecin) === null || _e === void 0 ? void 0 : _e.nom) !== null && _f !== void 0 ? _f : (_g = this.medecin) === null || _g === void 0 ? void 0 : _g.lastName) !== null && _h !== void 0 ? _h : '';
            return ("" + prenom.charAt(0) + nom.charAt(0)).toUpperCase();
        },
        enumerable: false,
        configurable: true
    });
    BookAppointmentPanelComponent.prototype.ngOnChanges = function (changes) {
        if (changes['medecin']) {
            if (this.medecin) {
                this.bookingState.reset();
                this.errorMessage.set(null);
                this.loadAvailabilityData();
            }
            else {
                this.availability.set(null);
                this.occupiedSlots.set([]);
                this.conges.set([]);
            }
        }
    };
    BookAppointmentPanelComponent.prototype.loadAvailabilityData = function () {
        var _this = this;
        var _a, _b, _c;
        var medecinId = (_b = (_a = this.medecin) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = this.medecin) === null || _c === void 0 ? void 0 : _c.userId;
        if (!medecinId)
            return;
        this.loadingAvailability.set(true);
        this.errorMessage.set(null);
        this.availabilityService.getAvailability(medecinId).subscribe({
            next: function (config) {
                var _a, _b;
                console.log('[BookPanel] availability from API:', JSON.stringify(config));
                _this.availability.set(config);
                _this.conges.set((_a = config.conges) !== null && _a !== void 0 ? _a : []);
                _this.bookingState.durationMinutes.set((_b = config.defaultDuration) !== null && _b !== void 0 ? _b : 30);
                _this.loadOccupiedSlots(medecinId);
            },
            error: function () {
                _this.loadingAvailability.set(false);
                _this.errorMessage.set('Impossible de charger les disponibilitÃ©s du mÃ©decin.');
            }
        });
    };
    BookAppointmentPanelComponent.prototype.loadOccupiedSlots = function (medecinId) {
        var _this = this;
        var weekStart = this.bookingState.currentWeekStart();
        var weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        var startDate = this.formatDate(weekStart);
        var endDate = this.formatDate(weekEnd);
        this.availabilityService.getOccupiedSlots(medecinId, startDate, endDate).subscribe({
            next: function (slots) {
                _this.occupiedSlots.set(slots);
                _this.loadingAvailability.set(false);
            },
            error: function () {
                _this.occupiedSlots.set([]);
                _this.loadingAvailability.set(false);
            }
        });
    };
    BookAppointmentPanelComponent.prototype.onSlotSelected = function (_date) {
        // Slot selection is handled by BookingStateService via WeeklyCalendarComponent
        this.errorMessage.set(null);
    };
    BookAppointmentPanelComponent.prototype.onConfirmed = function (formData) {
        var _this = this;
        var _a, _b, _c;
        var selectedSlot = this.bookingState.selectedSlot();
        if (!selectedSlot)
            return;
        if (!this.authService.currentUser())
            return;
        var medecinId = (_b = (_a = this.medecin) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = this.medecin) === null || _c === void 0 ? void 0 : _c.userId;
        this.bookingState.isLoading.set(true);
        this.errorMessage.set(null);
        // Récupérer le vrai patient.id depuis /patients/me
        this.http.get('/api/v1/patients/me').subscribe({
            next: function (res) {
                var _a, _b, _c;
                var outer = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
                var profile = (_b = outer === null || outer === void 0 ? void 0 : outer.data) !== null && _b !== void 0 ? _b : outer;
                var patientId = (_c = profile === null || profile === void 0 ? void 0 : profile.userId) !== null && _c !== void 0 ? _c : profile === null || profile === void 0 ? void 0 : profile.id;
                if (!patientId) {
                    _this.bookingState.isLoading.set(false);
                    _this.errorMessage.set('Profil patient introuvable. Veuillez vous reconnecter.');
                    return;
                }
                _this.appointmentService.create({
                    patientId: patientId,
                    doctorId: medecinId,
                    appointmentDate: selectedSlot,
                    durationMinutes: formData.durationMinutes,
                    consultationType: formData.consultationType,
                    reason: formData.reason || undefined,
                    beneficiaryId: formData.beneficiaryId || undefined,
                    beneficiaryNom: formData.beneficiaryNom || undefined,
                    beneficiaryPrenom: formData.beneficiaryPrenom || undefined
                }).subscribe({
                    next: function () {
                        _this.bookingState.isLoading.set(false);
                        _this.booked.emit();
                        _this.bookingState.reset();
                        _this.closed.emit();
                    },
                    error: function (err) {
                        var _a, _b, _c;
                        _this.bookingState.isLoading.set(false);
                        if (err.status === 400) {
                            _this.errorMessage.set('Ce créneau est deja réservé. Veuillez en choisir un autre.');
                            var id = (_b = (_a = _this.medecin) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : (_c = _this.medecin) === null || _c === void 0 ? void 0 : _c.userId;
                            if (id)
                                _this.loadOccupiedSlots(id);
                        }
                        else {
                            _this.errorMessage.set('Une erreur est survenue. Veuillez rÃ©essayer.');
                        }
                    }
                });
            },
            error: function () {
                _this.bookingState.isLoading.set(false);
                _this.errorMessage.set('Impossible de recuperer votre profil patient.');
            }
        });
    };
    BookAppointmentPanelComponent.prototype.onClose = function () {
        this.closed.emit();
    };
    BookAppointmentPanelComponent.prototype.formatDate = function (date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + "-" + m + "-" + d;
    };
    __decorate([
        core_1.Input()
    ], BookAppointmentPanelComponent.prototype, "medecin");
    __decorate([
        core_1.Output()
    ], BookAppointmentPanelComponent.prototype, "closed");
    __decorate([
        core_1.Output()
    ], BookAppointmentPanelComponent.prototype, "booked");
    BookAppointmentPanelComponent = __decorate([
        core_1.Component({
            selector: 'app-book-appointment-panel',
            standalone: true,
            imports: [common_1.CommonModule, weekly_calendar_component_1.WeeklyCalendarComponent, appointment_form_component_1.AppointmentFormComponent],
            template: "\n    <!-- Overlay backdrop -->\n    <div\n      class=\"overlay\"\n      *ngIf=\"medecin\"\n      (click)=\"onClose()\"\n      aria-hidden=\"true\"\n    ></div>\n\n    <!-- Panel -->\n    <div class=\"panel\" *ngIf=\"medecin\" role=\"dialog\" aria-modal=\"true\" [attr.aria-label]=\"'Prendre rendez-vous avec ' + doctorFullName\">\n\n      <!-- Header -->\n      <div class=\"panel-header\">\n        <div class=\"doctor-info\">\n          <img\n            *ngIf=\"doctorPhoto\"\n            [src]=\"doctorPhoto\"\n            [alt]=\"doctorFullName\"\n            class=\"doctor-avatar\"\n          />\n          <div class=\"doctor-avatar-placeholder\" *ngIf=\"!doctorPhoto\">\n            {{ doctorInitials }}\n          </div>\n          <div class=\"doctor-details\">\n            <h2 class=\"doctor-name\">{{ doctorFullName }}</h2>\n            <span class=\"doctor-specialty\" *ngIf=\"medecin.specialite\">{{ medecin.specialite }}</span>\n          </div>\n        </div>\n        <button class=\"close-btn\" (click)=\"onClose()\" aria-label=\"Fermer le panneau\">fermer</button>\n      </div>\n\n      <!-- Error message -->\n      <div class=\"error-banner\" *ngIf=\"errorMessage()\">\n        <span class=\"error-icon\"></span>\n        <span>{{ errorMessage() }}</span>\n        <button class=\"error-dismiss\" (click)=\"errorMessage.set(null)\" aria-label=\"Fermer le message d'erreur\">fermer</button>\n      </div>\n\n      <!-- Loading state for availability -->\n      <div class=\"loading-state\" *ngIf=\"loadingAvailability()\">\n        <div class=\"spinner\" aria-hidden=\"true\"></div>\n        <span>Chargement des disponibilities...</span>\n      </div>\n\n      <!-- Content -->\n      <div class=\"panel-content\" *ngIf=\"!loadingAvailability()\">\n\n        <!-- Weekly Calendar -->\n        <section class=\"calendar-section\">\n          <h3 class=\"section-title\">Choisissez un cr\u00E9neau</h3>\n          <app-weekly-calendar\n            [availability]=\"availability()\"\n            [occupiedSlots]=\"occupiedSlots()\"\n            [conges]=\"conges()\"\n            (slotSelected)=\"onSlotSelected($event)\"\n          ></app-weekly-calendar>\n        </section>\n\n        <!-- Appointment Form -->\n        <section class=\"form-section\">\n          <app-appointment-form\n            [medecin]=\"medecin\"\n            [availability]=\"availability()\"\n            [isLoading]=\"bookingState.isLoading()\"\n            (confirmed)=\"onConfirmed($event)\"\n            (cancelled)=\"onClose()\"\n          ></app-appointment-form>\n        </section>\n\n      </div>\n    </div>\n  ",
            styles: ["\n    /* Overlay */\n    .overlay {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.5);\n      z-index: 1000;\n      animation: fadeIn .2s ease;\n    }\n\n    /* Panel */\n    .panel {\n      position: fixed;\n      top: 0;\n      right: 0;\n      width: 100%;\n      max-width: 680px;\n      height: 100vh;\n      background: white;\n      z-index: 1001;\n      display: flex;\n      flex-direction: column;\n      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);\n      animation: slideIn .25s ease;\n      overflow: hidden;\n    }\n\n    @keyframes fadeIn {\n      from { opacity: 0; }\n      to { opacity: 1; }\n    }\n\n    @keyframes slideIn {\n      from { transform: translateX(100%); }\n      to { transform: translateX(0); }\n    }\n\n    /* Header */\n    .panel-header {\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      padding: 20px 24px;\n      border-bottom: 1.5px solid #e5e7eb;\n      background: #f8fafc;\n      flex-shrink: 0;\n    }\n\n    .doctor-info {\n      display: flex;\n      align-items: center;\n      gap: 14px;\n    }\n\n    .doctor-avatar {\n      width: 52px;\n      height: 52px;\n      border-radius: 50%;\n      object-fit: cover;\n      border: 2.5px solid #1a56db;\n      flex-shrink: 0;\n    }\n\n    .doctor-avatar-placeholder {\n      width: 52px;\n      height: 52px;\n      border-radius: 50%;\n      background: #1a56db;\n      color: white;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 18px;\n      font-weight: 700;\n      flex-shrink: 0;\n    }\n\n    .doctor-details {\n      display: flex;\n      flex-direction: column;\n      gap: 3px;\n    }\n\n    .doctor-name {\n      font-size: 18px;\n      font-weight: 700;\n      color: #0f172a;\n      margin: 0;\n    }\n\n    .doctor-specialty {\n      font-size: 13px;\n      color: #64748b;\n      font-weight: 500;\n    }\n\n    .close-btn {\n      width: 36px;\n      height: 36px;\n      border-radius: 50%;\n      border: 1.5px solid #e5e7eb;\n      background: white;\n      font-size: 20px;\n      line-height: 1;\n      cursor: pointer;\n      color: #64748b;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      transition: background .15s, color .15s;\n      flex-shrink: 0;\n    }\n\n    .close-btn:hover {\n      background: #fee2e2;\n      color: #dc2626;\n      border-color: #fca5a5;\n    }\n\n    /* Error banner */\n    .error-banner {\n      display: flex;\n      align-items: center;\n      gap: 10px;\n      padding: 12px 20px;\n      background: #fef2f2;\n      border-bottom: 1.5px solid #fca5a5;\n      color: #991b1b;\n      font-size: 14px;\n      flex-shrink: 0;\n    }\n\n    .error-icon { font-size: 16px; }\n\n    .error-dismiss {\n      margin-left: auto;\n      background: none;\n      border: none;\n      cursor: pointer;\n      color: #991b1b;\n      font-size: 18px;\n      line-height: 1;\n      padding: 0 4px;\n    }\n\n    /* Loading state */\n    .loading-state {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      gap: 16px;\n      flex: 1;\n      color: #64748b;\n      font-size: 14px;\n    }\n\n    .spinner {\n      width: 32px;\n      height: 32px;\n      border: 3px solid #e2e8f0;\n      border-top-color: #1a56db;\n      border-radius: 50%;\n      animation: spin .7s linear infinite;\n    }\n\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    /* Content */\n    .panel-content {\n      flex: 1;\n      overflow-y: auto;\n      padding: 24px;\n      display: flex;\n      flex-direction: column;\n      gap: 28px;\n    }\n\n    .section-title {\n      font-size: 15px;\n      font-weight: 700;\n      color: #0f172a;\n      margin: 0 0 14px;\n    }\n\n    .calendar-section,\n    .form-section {\n      display: flex;\n      flex-direction: column;\n    }\n\n    @media (max-width: 640px) {\n      .panel {\n        max-width: 100%;\n      }\n    }\n  "]
        })
    ], BookAppointmentPanelComponent);
    return BookAppointmentPanelComponent;
}());
exports.BookAppointmentPanelComponent = BookAppointmentPanelComponent;
