"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PatientDashboardComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var auth_service_1 = require("@core/services/auth.service");
var appointment_model_1 = require("@core/models/appointment.model");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var PatientDashboardComponent = /** @class */ (function () {
    function PatientDashboardComponent() {
        var _this = this;
        this.auth = core_1.inject(auth_service_1.AuthService);
        this.http = core_1.inject(http_1.HttpClient);
        this.currentUser = this.auth.currentUser;
        // État
        this.isLoading = core_1.signal(true);
        this.patient = core_1.signal(null);
        this.appointments = core_1.signal([]);
        this.prescriptions = core_1.signal([]);
        this.qrCodeImage = core_1.signal(null);
        this.qrDisplayId = core_1.signal('');
        // Stats calculées depuis les vraies données
        this.stats = core_1.computed(function () { return ({
            appointments: _this.appointments().filter(function (a) {
                return a.status === appointment_model_1.AppointmentStatus.CONFIRMED ||
                    a.status === appointment_model_1.AppointmentStatus.REQUESTED;
            }).length,
            prescriptions: _this.prescriptions().length,
            analyses: 0,
            documents: 0
        }); });
        // RDV à venir (triés, max 3)
        this.upcomingAppointments = core_1.computed(function () {
            return _this.appointments()
                .filter(function (a) { return a.status !== appointment_model_1.AppointmentStatus.CANCELLED && a.status !== appointment_model_1.AppointmentStatus.COMPLETED; })
                .sort(function (a, b) { return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(); })
                .slice(0, 3);
        });
        // Ordonnances actives (max 3)
        this.activePrescriptions = core_1.computed(function () {
            return _this.prescriptions().slice(0, 3);
        });
        this.today = new Date();
    }
    PatientDashboardComponent.prototype.ngOnInit = function () {
        this.loadDashboard();
    };
    PatientDashboardComponent.prototype.loadDashboard = function () {
        var _this = this;
        this.isLoading.set(true);
        // 1. Charger le profil patient
        this.http.get('/api/v1/patients/me').pipe(operators_1.catchError(function () { return rxjs_1.of(null); })).subscribe(function (response) {
            var _a;
            var patient = (_a = response === null || response === void 0 ? void 0 : response.data) !== null && _a !== void 0 ? _a : response;
            _this.patient.set(patient);
            if (!(patient === null || patient === void 0 ? void 0 : patient.id)) {
                _this.isLoading.set(false);
                return;
            }
            // 2. Charger en parallèle : RDV + Ordonnances + QR code
            rxjs_1.forkJoin({
                appointments: _this.http.get("/api/v1/appointments/patient/" + patient.id).pipe(operators_1.catchError(function () { return rxjs_1.of([]); })),
                prescriptions: _this.http.get("/api/v1/prescriptions/patient/" + patient.id).pipe(operators_1.catchError(function () { return rxjs_1.of([]); })),
                qr: _this.http.get('/api/v1/patient/qr').pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            }).subscribe(function (_a) {
                var _b, _c;
                var appointments = _a.appointments, prescriptions = _a.prescriptions, qr = _a.qr;
                _this.appointments.set(Array.isArray(appointments) ? appointments : []);
                _this.prescriptions.set(Array.isArray(prescriptions) ? prescriptions : []);
                if (qr) {
                    var img = ((_b = qr === null || qr === void 0 ? void 0 : qr.data) === null || _b === void 0 ? void 0 : _b.qrImage) || (qr === null || qr === void 0 ? void 0 : qr.qrImage);
                    var id = ((_c = qr === null || qr === void 0 ? void 0 : qr.data) === null || _c === void 0 ? void 0 : _c.displayId) || (qr === null || qr === void 0 ? void 0 : qr.displayId);
                    if (img)
                        _this.qrCodeImage.set(img);
                    if (id)
                        _this.qrDisplayId.set(id);
                }
                _this.isLoading.set(false);
            });
        });
    };
    // ── Helpers dates ──────────────────────────────────────────
    PatientDashboardComponent.prototype.formatDay = function (d) {
        if (!d)
            return '--';
        return new Date(d).getDate().toString().padStart(2, '0');
    };
    PatientDashboardComponent.prototype.formatMonth = function (d) {
        if (!d)
            return '--';
        return new Date(d).toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
    };
    PatientDashboardComponent.prototype.getDoctorName = function (a) {
        if (a.doctor) {
            var first = a.doctor.firstName || a.doctor.first_name || '';
            var last = a.doctor.lastName || a.doctor.last_name || '';
            return (first + " " + last).trim() || 'Médecin';
        }
        return 'Médecin';
    };
    PatientDashboardComponent.prototype.getSpecialty = function (appt) {
        var _a, _b;
        return ((_a = appt.medecin) === null || _a === void 0 ? void 0 : _a.specialite) || ((_b = appt.doctor) === null || _b === void 0 ? void 0 : _b.specialty) || 'Médecin généraliste';
    };
    PatientDashboardComponent.prototype.getConsultationType = function (appt) {
        var type = appt.consultationType || appt.type;
        return type === 'VIDEO' ? '📹 Téléconsultation' : '🏥 Présentiel';
    };
    PatientDashboardComponent.prototype.isVideo = function (appt) {
        return appt.consultationType === 'VIDEO' || appt.type === 'VIDEO';
    };
    PatientDashboardComponent.prototype.formatTime = function (d) {
        if (!d)
            return '';
        return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };
    // ── Statuts ────────────────────────────────────────────────
    PatientDashboardComponent.prototype.getStatusLabel = function (status) {
        var labels = {
            CONFIRMED: '✓ Confirmé',
            REQUESTED: '⏳ En attente',
            CANCELLED: '✕ Annulé',
            COMPLETED: '✔ Terminé',
            NO_SHOW: '⚠ Absent'
        };
        return labels[status] || status;
    };
    PatientDashboardComponent.prototype.getStatusClass = function (status) {
        var classes = {
            CONFIRMED: 'status-confirmed',
            REQUESTED: 'status-pending',
            CANCELLED: 'status-cancelled',
            COMPLETED: 'status-completed',
            NO_SHOW: 'status-cancelled'
        };
        return classes[status] || 'status-pending';
    };
    // ── QR Code ────────────────────────────────────────────────
    PatientDashboardComponent.prototype.downloadQr = function () {
        var img = this.qrCodeImage();
        if (!img)
            return;
        var a = document.createElement('a');
        a.href = img;
        a.download = "mediconnect-qr-" + this.qrDisplayId() + ".png";
        a.click();
    };
    PatientDashboardComponent.prototype.downloadPdf = function () {
        var _this = this;
        this.http.get('/api/v1/patient/qr/pdf', { responseType: 'blob' }).subscribe({
            next: function (blob) {
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = "mediconnect-qr-" + _this.qrDisplayId() + ".pdf";
                a.click();
                window.URL.revokeObjectURL(url);
            },
            error: function (err) { return console.error('PDF error:', err); }
        });
    };
    PatientDashboardComponent.prototype.printQr = function () {
        var img = this.qrCodeImage();
        var user = this.currentUser();
        if (!img)
            return;
        var printWindow = window.open('', '_blank');
        printWindow === null || printWindow === void 0 ? void 0 : printWindow.document.write("\n      <!DOCTYPE html><html><head>\n        <title>QR Code \u2014 MediConnect</title>\n        <style>\n          body { font-family: Arial, sans-serif; display:flex; justify-content:center; align-items:center; min-height:100vh; margin:0; background:#f8fafc; }\n          .card { background:white; border-radius:16px; padding:32px; text-align:center; box-shadow:0 4px 24px rgba(0,0,0,.1); max-width:320px; }\n          .logo { font-size:22px; font-weight:bold; color:#0f172a; margin-bottom:4px; }\n          .subtitle { color:#64748b; font-size:12px; margin-bottom:24px; }\n          img { width:200px; height:200px; margin:0 auto 20px; display:block; border:1px solid #e2e8f0; border-radius:8px; padding:8px; }\n          .name { font-size:20px; font-weight:bold; color:#0f172a; margin-bottom:12px; }\n          .info { color:#475569; font-size:13px; margin:6px 0; }\n          .footer { margin-top:20px; font-size:11px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:12px; }\n        </style>\n      </head><body>\n        <div class=\"card\">\n          <div class=\"logo\">\uD83C\uDFE5 MediConnect</div>\n          <div class=\"subtitle\">Carte d'identification patient</div>\n          <img src=\"" + img + "\" alt=\"QR Code\" />\n          <div class=\"name\">" + ((user === null || user === void 0 ? void 0 : user.firstName) || '') + " " + ((user === null || user === void 0 ? void 0 : user.lastName) || '') + "</div>\n          <div class=\"info\">\uD83D\uDCE7 " + ((user === null || user === void 0 ? void 0 : user.email) || '') + "</div>\n          <div class=\"info\">" + this.qrDisplayId() + "</div>\n          <div class=\"footer\">Pr\u00E9sentez ce QR code lors de vos consultations<br><strong>Code personnel et confidentiel</strong></div>\n        </div>\n      </body></html>\n    ");
        printWindow === null || printWindow === void 0 ? void 0 : printWindow.document.close();
        setTimeout(function () { printWindow === null || printWindow === void 0 ? void 0 : printWindow.focus(); printWindow === null || printWindow === void 0 ? void 0 : printWindow.print(); }, 500);
    };
    PatientDashboardComponent = __decorate([
        core_1.Component({
            selector: "app-patient-dashboard",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink],
            templateUrl: "./patient-dashboard.component.html",
            styleUrls: ["./patient-dashboard.component.scss"]
        })
    ], PatientDashboardComponent);
    return PatientDashboardComponent;
}());
exports.PatientDashboardComponent = PatientDashboardComponent;
