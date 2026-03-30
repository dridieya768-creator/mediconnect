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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PatientAppointmentsComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var PatientAppointmentsComponent = /** @class */ (function () {
    function PatientAppointmentsComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.slotTakenError = core_1.signal(false);
        this.view = core_1.signal("list");
        this.filterTab = core_1.signal("upcoming");
        this.isLoading = core_1.signal(true);
        this.isCreating = core_1.signal(false);
        this.isCancelling = core_1.signal(false);
        this.isRating = core_1.signal(false);
        this.successMsg = core_1.signal(null);
        this.errorMsg = core_1.signal(null);
        this.patientId = core_1.signal(null);
        this.appointments = core_1.signal([]);
        this.doctors = core_1.signal([]);
        this.selectedAppt = core_1.signal(null);
        this.selectedDoctor = core_1.signal(null);
        this.selectedSlot = core_1.signal(null);
        this.searchQuery = "";
        this.searchSpecialty = "";
        this.searchLoading = core_1.signal(false);
        this.searchSubject = new rxjs_1.Subject();
        this.specialties = [
            "Cardiologue", "Dermatologue", "Urgentiste", "Médecin de famille",
            "Gynécologue", "Neurologue", "Ophtalmologue", "ORL", "Pédiatre",
            "Psychiatre", "Radiologue", "Rhumatologue", "Urologue"
        ];
        this.currentWeekStart = core_1.signal(this.getMonday(new Date()));
        this.newAppt = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
        this.cancelReason = "";
        this.cancelNote = "";
        this.rating = core_1.signal(0);
        this.hoverRating = core_1.signal(0);
        this.ratingComment = "";
        this.upcomingCount = core_1.computed(function () { return _this.appointments().filter(function (a) { return _this.isUpcoming(a); }).length; });
        this.pastCount = core_1.computed(function () { return _this.appointments().filter(function (a) { return !_this.isUpcoming(a); }).length; });
        this.filteredAppointments = core_1.computed(function () {
            var tab = _this.filterTab();
            var all = _this.appointments();
            if (tab === "upcoming")
                return all.filter(function (a) { return _this.isUpcoming(a); });
            if (tab === "past")
                return all.filter(function (a) { return !_this.isUpcoming(a); });
            return all;
        });
        this.slotDays = core_1.computed(function () {
            var start = new Date(_this.currentWeekStart());
            return Array.from({ length: 5 }, function (_, i) {
                var d = new Date(start);
                d.setDate(start.getDate() + i);
                return {
                    label: d.toLocaleDateString("fr-FR", { weekday: "short" }),
                    date: d.getDate().toString(),
                    slots: _this.generateSlots(d)
                };
            });
        });
    }
    PatientAppointmentsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadPatient();
        // FIX: Correct pipe implementation without nested pipe
        this.searchSubject.pipe(rxjs_1.debounceTime(300), rxjs_1.distinctUntilChanged(), rxjs_1.switchMap(function (q) {
            if (!q && !_this.searchSpecialty) {
                _this.doctors.set([]);
                return rxjs_1.of(null);
            }
            _this.searchLoading.set(true);
            var params = {};
            if (q)
                params["search"] = q;
            if (_this.searchSpecialty)
                params["specialite"] = _this.searchSpecialty;
            return _this.http.get("/api/v1/medecins", { params: params })
                .pipe(rxjs_1.catchError(function () { return rxjs_1.of({ data: [] }); }));
        })).subscribe(function (res) {
            var _a, _b, _c;
            if (res) {
                var list = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : (Array.isArray(res) ? res : []);
                var normalized = list.map(function (doc) {
                    var _a, _b, _c, _d, _e, _f;
                    return (__assign(__assign({}, doc), { firstName: doc.firstName || doc.first_name || '', lastName: doc.lastName || doc.last_name || '', ville: ((_a = doc.profile) === null || _a === void 0 ? void 0 : _a.ville) || doc.ville || '', specialite: ((_b = doc.profile) === null || _b === void 0 ? void 0 : _b.specialite) || doc.specialite || '', teleconsultation: (_e = (_d = (_c = doc.profile) === null || _c === void 0 ? void 0 : _c.disponTeleconsult) !== null && _d !== void 0 ? _d : doc.teleconsultation) !== null && _e !== void 0 ? _e : false, avatarUrl: ((_f = doc.profile) === null || _f === void 0 ? void 0 : _f.photoPro) || doc.avatarUrl || null }));
                });
                _this.doctors.set(normalized);
            }
            _this.searchLoading.set(false);
        });
    };
    // ─────────────────────────────────────────────────────────────────────────
    // FIX PRINCIPAL : normalisation robuste de la réponse API
    // L'API NestJS peut retourner :
    //   - un tableau direct           : [{ id, ... }, ...]
    //   - un objet wrappé             : { data: [{ id, ... }, ...] }
    //   - un objet doublement wrappé  : { data: { data: [...] } }
    // ─────────────────────────────────────────────────────────────────────────
    PatientAppointmentsComponent.prototype.normalizeList = function (res) {
        var _a;
        if (Array.isArray(res))
            return res;
        if (Array.isArray(res === null || res === void 0 ? void 0 : res.data))
            return res.data;
        if (Array.isArray((_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data))
            return res.data.data;
        return [];
    };
    PatientAppointmentsComponent.prototype.loadPatient = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/patients/me")
            .pipe(rxjs_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a;
            // FIX : accepte { id } direct OU { data: { id } }
            var patient = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
            if (!(patient === null || patient === void 0 ? void 0 : patient.id)) {
                console.warn("[Appointments] Impossible de récupérer le patient :", res);
                _this.isLoading.set(false);
                return;
            }
            _this.patientId.set(patient.id);
            _this.http.get("/api/v1/appointments/patient/" + patient.id)
                .pipe(rxjs_1.catchError(function (err) {
                console.error("[Appointments] Erreur chargement RDV :", err);
                return rxjs_1.of([]);
            }))
                .subscribe(function (appts) {
                // FIX : normalise quelle que soit la forme de la réponse
                var list = _this.normalizeList(appts);
                console.log("[Appointments] " + list.length + " RDV charg\u00E9s pour patient " + patient.id);
                _this.appointments.set(list.sort(function (a, b) {
                    return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
                }));
                _this.isLoading.set(false);
            });
        });
    };
    PatientAppointmentsComponent.prototype.showView = function (v) {
        this.view.set(v);
        this.successMsg.set(null);
        this.errorMsg.set(null);
        if (v === "new") {
            this.selectedDoctor.set(null);
            this.selectedSlot.set(null);
            this.newAppt = { consultationType: "PHYSICAL", durationMinutes: 30, reason: "" };
            this.searchQuery = "";
            this.searchSpecialty = "";
            this.doctors.set([]);
        }
    };
    PatientAppointmentsComponent.prototype.setFilter = function (f) { this.filterTab.set(f); };
    PatientAppointmentsComponent.prototype.openDetail = function (appt) { this.selectedAppt.set(appt); this.showView("detail"); };
    PatientAppointmentsComponent.prototype.openCancel = function (appt) { this.selectedAppt.set(appt); this.cancelReason = ""; this.cancelNote = ""; this.showView("cancel"); };
    PatientAppointmentsComponent.prototype.openRate = function (appt) { this.selectedAppt.set(appt); this.rating.set(0); this.ratingComment = ""; this.showView("rate"); };
    PatientAppointmentsComponent.prototype.onSearchChange = function (q) { this.searchSubject.next(q); };
    PatientAppointmentsComponent.prototype.searchDoctors = function () {
        if (!this.searchQuery && !this.searchSpecialty) {
            this.doctors.set([]);
            return;
        }
        this.searchSubject.next(this.searchQuery);
    };
    PatientAppointmentsComponent.prototype.selectDoctor = function (doc) {
        this.selectedDoctor.set(doc);
        this.selectedSlot.set(null);
        this.currentWeekStart.set(this.getMonday(new Date()));
    };
    PatientAppointmentsComponent.prototype.generateSlots = function (date) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today)
            return [];
        var times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
        return times.map(function (t) {
            var dt = new Date(date);
            var _a = t.split(":"), h = _a[0], m = _a[1];
            dt.setHours(+h, +m, 0, 0);
            return { time: t, datetime: dt.toISOString(), taken: Math.random() < 0.25 };
        });
    };
    PatientAppointmentsComponent.prototype.selectSlot = function (datetime) { this.selectedSlot.set(datetime); };
    PatientAppointmentsComponent.prototype.prevWeek = function () {
        var d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() - 7);
        if (d >= this.getMonday(new Date()))
            this.currentWeekStart.set(d);
    };
    PatientAppointmentsComponent.prototype.nextWeek = function () {
        var d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() + 7);
        this.currentWeekStart.set(d);
    };
    PatientAppointmentsComponent.prototype.createAppointment = function () {
        var _this = this;
        var doc = this.selectedDoctor();
        var slot = this.selectedSlot();
        var patientId = this.patientId();
        if (!doc || !slot || !patientId)
            return;
        this.isCreating.set(true);
        var payload = {
            patientId: patientId,
            doctorId: doc.userId || doc.id,
            appointmentDate: slot,
            durationMinutes: +this.newAppt.durationMinutes,
            consultationType: this.newAppt.consultationType,
            reason: this.newAppt.reason
        };
        this.http.post("/api/v1/appointments", payload).subscribe({
            next: function (res) {
                var _a;
                // FIX : le backend peut retourner { data: appt } ou l'objet directement
                var appt = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
                _this.appointments.update(function (list) {
                    return __spreadArrays([appt], list).sort(function (a, b) {
                        return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
                    });
                });
                _this.isCreating.set(false);
                _this.successMsg.set("Rendez-vous confirmé avec succès !");
                _this.showView("list");
                setTimeout(function () { return _this.successMsg.set(null); }, 4000);
            },
            error: function (err) {
                var _a;
                _this.isCreating.set(false);
                var raw = (_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message;
                var msg = typeof raw === 'string' ? raw
                    : Array.isArray(raw) ? raw[0]
                        : (err === null || err === void 0 ? void 0 : err.message) || '';
                var isSlotTaken = msg.toLowerCase().includes('conflict')
                    || msg.toLowerCase().includes('créneau')
                    || msg.toLowerCase().includes('déjà')
                    || msg.toLowerCase().includes('taken')
                    || (err === null || err === void 0 ? void 0 : err.status) === 409;
                _this.slotTakenError.set(isSlotTaken);
                if (!isSlotTaken) {
                    _this.errorMsg.set(msg || "Erreur lors de la création du RDV.");
                    setTimeout(function () { return _this.errorMsg.set(null); }, 5000);
                }
            }
        });
    };
    PatientAppointmentsComponent.prototype.confirmCancel = function () {
        var _this = this;
        var appt = this.selectedAppt();
        if (!appt || !this.cancelReason)
            return;
        this.isCancelling.set(true);
        var reason = this.cancelNote ? this.cancelReason + " \u2014 " + this.cancelNote : this.cancelReason;
        this.http.patch("/api/v1/appointments/" + appt.id + "/cancel", { reason: reason }).subscribe({
            next: function () {
                _this.appointments.update(function (list) {
                    return list.map(function (a) { return a.id === appt.id ? __assign(__assign({}, a), { status: "CANCELLED", cancellationReason: reason }) : a; });
                });
                _this.isCancelling.set(false);
                _this.successMsg.set("RDV annulé avec succès.");
                _this.showView("list");
                setTimeout(function () { return _this.successMsg.set(null); }, 4000);
            },
            error: function () {
                _this.isCancelling.set(false);
                _this.errorMsg.set("Erreur lors de l'annulation.");
                setTimeout(function () { return _this.errorMsg.set(null); }, 5000);
            }
        });
    };
    PatientAppointmentsComponent.prototype.submitRating = function () {
        var _this = this;
        var appt = this.selectedAppt();
        if (!appt || !this.rating())
            return;
        this.isRating.set(true);
        this.http.post("/api/v1/appointments/" + appt.id + "/rate", {
            rating: this.rating(),
            comment: this.ratingComment
        }).pipe(rxjs_1.catchError(function () { return rxjs_1.of(null); })).subscribe(function () {
            _this.appointments.update(function (list) {
                return list.map(function (a) { return a.id === appt.id ? __assign(__assign({}, a), { rated: true }) : a; });
            });
            _this.isRating.set(false);
            _this.successMsg.set("Merci pour votre évaluation !");
            _this.showView("list");
            setTimeout(function () { return _this.successMsg.set(null); }, 4000);
        });
    };
    PatientAppointmentsComponent.prototype.joinVideo = function (appt) {
        var roomId = appt.videoRoomId || "mediconnect-" + appt.id;
        window.open("https://meet.jit.si/" + roomId, "_blank");
    };
    PatientAppointmentsComponent.prototype.isUpcoming = function (a) {
        return new Date(a.appointmentDate) > new Date() && a.status !== "CANCELLED";
    };
    PatientAppointmentsComponent.prototype.canCancel = function (a) {
        var diff = new Date(a.appointmentDate).getTime() - Date.now();
        return (a.status === "CONFIRMED" || a.status === "REQUESTED") && diff >= 24 * 60 * 60 * 1000;
    };
    PatientAppointmentsComponent.prototype.isVideo = function (a) { return a.consultationType === "TELECONSULTATION"; };
    PatientAppointmentsComponent.prototype.getDoctorName = function (a) {
        var _a, _b, _c, _d;
        return ((_a = a.doctor) === null || _a === void 0 ? void 0 : _a.lastName) || ((_b = a.doctor) === null || _b === void 0 ? void 0 : _b.last_name) || ((_d = (_c = a.medecin) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.last_name) || "Médecin";
    };
    PatientAppointmentsComponent.prototype.getSpecialty = function (a) {
        var _a, _b;
        return ((_a = a.medecin) === null || _a === void 0 ? void 0 : _a.specialite) || ((_b = a.doctor) === null || _b === void 0 ? void 0 : _b.specialty) || "Médecin généraliste";
    };
    PatientAppointmentsComponent.prototype.getInitials = function (doc) {
        var f = (doc.firstName || doc.first_name || "")[0] || "";
        var l = (doc.lastName || doc.last_name || "")[0] || "";
        return (f + l).toUpperCase();
    };
    PatientAppointmentsComponent.prototype.formatDay = function (d) { return d ? new Date(d).getDate().toString().padStart(2, "0") : "--"; };
    PatientAppointmentsComponent.prototype.formatMonth = function (d) { return d ? new Date(d).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase() : "--"; };
    PatientAppointmentsComponent.prototype.formatYear = function (d) { return d ? new Date(d).getFullYear().toString() : ""; };
    PatientAppointmentsComponent.prototype.formatTime = function (d) { return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""; };
    PatientAppointmentsComponent.prototype.formatFullDate = function (d) {
        if (!d)
            return "";
        return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
            + " à " + this.formatTime(d);
    };
    PatientAppointmentsComponent.prototype.getStatusLabel = function (s) {
        return { CONFIRMED: "✓ Confirmé", REQUESTED: "⏳ En attente", CANCELLED: "✕ Annulé", COMPLETED: "✔ Terminé", NO_SHOW: "⚠ Absent" }[s] || s;
    };
    PatientAppointmentsComponent.prototype.getStatusClass = function (s) {
        return { CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed", NO_SHOW: "status-cancelled" }[s] || "status-pending";
    };
    PatientAppointmentsComponent.prototype.getTypeLabel = function (t) {
        return { PHYSICAL: "🏥 Présentiel", TELECONSULTATION: "💻 Téléconsultation", HOME_VISIT: "🏠 À domicile" }[t] || t;
    };
    PatientAppointmentsComponent.prototype.getRatingLabel = function () {
        return ["", "😞 Très déçu", "😐 Décevant", "🙂 Correct", "😊 Bien", "🌟 Excellent !"][this.hoverRating() || this.rating()] || "";
    };
    PatientAppointmentsComponent.prototype.getMonday = function (d) {
        var date = new Date(d);
        var day = date.getDay();
        date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
        date.setHours(0, 0, 0, 0);
        return date;
    };
    PatientAppointmentsComponent = __decorate([
        core_1.Component({
            selector: "app-patient-appointments",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            template: "\n    <div class=\"appt-page\">\n\n      <!-- \u2500\u2500 HEADER \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n      <div class=\"page-header\">\n        <div>\n          <h1 class=\"page-title\">\uD83D\uDCC5 Mes Rendez-vous</h1>\n          <p class=\"page-subtitle\">G\u00E9rez vos consultations et t\u00E9l\u00E9consultations</p>\n        </div>\n        <button class=\"btn-primary\" (click)=\"showView('new')\" *ngIf=\"view() !== 'new'\">\n          + Nouveau RDV\n        </button>\n      </div>\n\n      <!-- \u2500\u2500 MESSAGES \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n      <div class=\"alert-success\" *ngIf=\"successMsg()\">\u2705 {{ successMsg() }}</div>\n      <div class=\"alert-error\"   *ngIf=\"errorMsg()\">\u274C {{ errorMsg() }}</div>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE LISTE\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"view() === 'list'\">\n\n        <!-- Tabs -->\n        <div class=\"tabs-bar\">\n          <button class=\"tab-btn\" [class.active]=\"filterTab() === 'upcoming'\" (click)=\"setFilter('upcoming')\">\n            \uD83D\uDD1C \u00C0 venir <span class=\"tab-count\">{{ upcomingCount() }}</span>\n          </button>\n          <button class=\"tab-btn\" [class.active]=\"filterTab() === 'past'\" (click)=\"setFilter('past')\">\n            \uD83D\uDD50 Pass\u00E9s <span class=\"tab-count\">{{ pastCount() }}</span>\n          </button>\n          <button class=\"tab-btn\" [class.active]=\"filterTab() === 'all'\" (click)=\"setFilter('all')\">\n            \uD83D\uDCCB Tous <span class=\"tab-count\">{{ appointments().length }}</span>\n          </button>\n        </div>\n\n        <!-- Loading -->\n        <div class=\"loading-state\" *ngIf=\"isLoading()\">\n          <div class=\"spinner\"></div>\n          <p>Chargement de vos rendez-vous...</p>\n        </div>\n\n        <!-- Liste -->\n        <div class=\"appt-list\" *ngIf=\"!isLoading()\">\n          <div class=\"appt-card\" *ngFor=\"let appt of filteredAppointments()\" (click)=\"openDetail(appt)\">\n            <div class=\"appt-date-block\" [class.date-video]=\"isVideo(appt)\">\n              <div class=\"date-day\">{{ formatDay(appt.appointmentDate) }}</div>\n              <div class=\"date-month\">{{ formatMonth(appt.appointmentDate) }}</div>\n              <div class=\"date-year\">{{ formatYear(appt.appointmentDate) }}</div>\n            </div>\n            <div class=\"appt-body\">\n              <div class=\"appt-top\">\n                <div>\n                  <div class=\"appt-doctor\">Dr. {{ getDoctorName(appt) }}</div>\n                  <div class=\"appt-spec\">{{ getSpecialty(appt) }}</div>\n                </div>\n                <span class=\"status-pill\" [ngClass]=\"getStatusClass(appt.status)\">\n                  {{ getStatusLabel(appt.status) }}\n                </span>\n              </div>\n              <div class=\"appt-meta\">\n                <span>{{ isVideo(appt) ? '\uD83D\uDCBB T\u00E9l\u00E9consultation' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}</span>\n                <span>\uD83D\uDD59 {{ formatTime(appt.appointmentDate) }}</span>\n                <span *ngIf=\"appt.durationMinutes\">\u23F1 {{ appt.durationMinutes }} min</span>\n                <span *ngIf=\"appt.reason\" class=\"reason-badge\">\uD83D\uDCDD {{ appt.reason }}</span>\n              </div>\n              <div class=\"appt-actions\" (click)=\"$event.stopPropagation()\">\n                <button class=\"btn-sm btn-danger\"\n                        *ngIf=\"canCancel(appt)\"\n                        (click)=\"openCancel(appt)\">\u2715 Annuler</button>\n                <button class=\"btn-sm btn-video\"\n                        *ngIf=\"isVideo(appt) && appt.status === 'CONFIRMED'\"\n                        (click)=\"joinVideo(appt)\">\uD83D\uDCF9 Rejoindre</button>\n                <button class=\"btn-sm btn-rate\"\n                        *ngIf=\"appt.status === 'COMPLETED' && !appt.rated\"\n                        (click)=\"openRate(appt)\">\u2B50 \u00C9valuer</button>\n              </div>\n            </div>\n          </div>\n\n          <!-- Empty state -->\n          <div class=\"empty-state\" *ngIf=\"filteredAppointments().length === 0\">\n            <div style=\"font-size:56px\">\uD83D\uDCED</div>\n            <p>Aucun rendez-vous {{ filterTab() === 'upcoming' ? '\u00E0 venir' : filterTab() === 'past' ? 'pass\u00E9' : '' }}</p>\n            <button class=\"btn-primary\" (click)=\"showView('new')\">+ Prendre un RDV</button>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE NOUVEAU RDV\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"view() === 'new'\">\n        <div class=\"form-card\">\n          <div class=\"form-header\">\n            <button class=\"btn-back\" (click)=\"showView('list')\">\u2190 Retour</button>\n            <h2>Nouveau Rendez-vous</h2>\n          </div>\n\n          <!-- \u00C9tape 1 : Recherche m\u00E9decin -->\n          <div class=\"step-block\">\n            <div class=\"step-label\"><span class=\"step-num\">1</span> Trouver un m\u00E9decin</div>\n            <div class=\"search-bar\">\n              <input class=\"form-input\" type=\"text\" [(ngModel)]=\"searchQuery\"\n                     placeholder=\"\uD83D\uDD0D Nom du m\u00E9decin...\"\n                     (ngModelChange)=\"onSearchChange($event)\" />\n              <select class=\"form-select\" [(ngModel)]=\"searchSpecialty\" (change)=\"searchDoctors()\">\n                <option value=\"\">Toutes sp\u00E9cialit\u00E9s</option>\n                <option *ngFor=\"let s of specialties\" [value]=\"s\">{{ s }}</option>\n              </select>\n            </div>\n            <div class=\"doctors-grid\" *ngIf=\"doctors().length > 0\">\n              <div class=\"doctor-card\"\n                   *ngFor=\"let doc of doctors()\"\n                   [class.selected]=\"selectedDoctor()?.id === doc.id\"\n                   (click)=\"selectDoctor(doc)\">\n                <div class=\"doc-avatar\">{{ getInitials(doc) }}</div>\n                <div class=\"doc-info\">\n                  <div class=\"doc-name\">Dr. {{ doc.firstName || doc.first_name }} {{ doc.lastName || doc.last_name }}</div>\n                  <div class=\"doc-spec\">{{ doc.specialite || doc.specialty || 'M\u00E9decin g\u00E9n\u00E9raliste' }}</div>\n                  <div class=\"doc-meta\">\n                    <span *ngIf=\"doc.ville || doc.city\">\uD83D\uDCCD {{ doc.ville || doc.city }}</span>\n                    <span class=\"doc-badge video\" *ngIf=\"doc.teleconsultation\">\uD83D\uDCBB T\u00E9l\u00E9consult.</span>\n                  </div>\n                </div>\n                <div class=\"doc-check\" *ngIf=\"selectedDoctor()?.id === doc.id\">\u2713</div>\n              </div>\n            </div>\n            <div class=\"search-hint\" *ngIf=\"doctors().length === 0 && !searchLoading()\">\n              Tapez pour rechercher un m\u00E9decin disponible\n            </div>\n            <div class=\"search-hint\" *ngIf=\"searchLoading()\">\u23F3 Recherche en cours...</div>\n          </div>\n\n          <!-- \u00C9tape 2 : Cr\u00E9neaux -->\n          <div class=\"step-block\" *ngIf=\"selectedDoctor()\">\n            <div class=\"step-label\"><span class=\"step-num\">2</span> Choisir un cr\u00E9neau</div>\n            <div class=\"slot-picker\">\n              <div class=\"slot-date-nav\">\n                <button class=\"btn-nav\" (click)=\"prevWeek()\">\u2039</button>\n                <div class=\"slot-dates\">\n                  <div class=\"slot-day-col\" *ngFor=\"let day of slotDays()\">\n                    <div class=\"slot-day-label\">{{ day.label }}</div>\n                    <div class=\"slot-day-date\">{{ day.date }}</div>\n                    <div class=\"slot-time\"\n                         *ngFor=\"let slot of day.slots\"\n                         [class.selected]=\"selectedSlot() === slot.datetime\"\n                         [class.taken]=\"slot.taken\"\n                         (click)=\"!slot.taken && selectSlot(slot.datetime)\">{{ slot.time }}</div>\n                    <div class=\"slot-empty\" *ngIf=\"day.slots.length === 0\">\u2014</div>\n                  </div>\n                </div>\n                <button class=\"btn-nav\" (click)=\"nextWeek()\">\u203A</button>\n              </div>\n            </div>\n          </div>\n          <!-- Message cr\u00E9neau occup\u00E9 \u2014 centr\u00E9 dans l'\u00E9tape 2 -->\n<div class=\"slot-taken-overlay\" *ngIf=\"slotTakenError()\">\n  <div class=\"slot-taken-box\">\n    <div class=\"slot-taken-icon\">\u23F0</div>\n    <div class=\"slot-taken-title\">Ce cr\u00E9neau est d\u00E9j\u00E0 occup\u00E9</div>\n    <div class=\"slot-taken-sub\">Veuillez choisir un autre horaire disponible</div>\n    <button class=\"slot-taken-btn\" (click)=\"slotTakenError.set(false); selectedSlot.set(null)\">\n      Choisir un autre cr\u00E9neau\n    </button>\n  </div>\n</div>\n          <!-- \u00C9tape 3 : Confirmation -->\n          <div class=\"step-block\" *ngIf=\"selectedDoctor() && selectedSlot()\">\n            <div class=\"step-label\"><span class=\"step-num\">3</span> Confirmer le rendez-vous</div>\n            <div class=\"confirm-grid\">\n              <div class=\"form-group\">\n                <label class=\"form-label\">Type de consultation</label>\n                <select class=\"form-select\" [(ngModel)]=\"newAppt.consultationType\">\n                  <option value=\"PHYSICAL\">\uD83C\uDFE5 Pr\u00E9sentiel</option>\n                  <option value=\"TELECONSULTATION\">\uD83D\uDCBB T\u00E9l\u00E9consultation</option>\n                  <option value=\"HOME_VISIT\">\uD83C\uDFE0 \u00C0 domicile</option>\n                </select>\n              </div>\n              <div class=\"form-group\">\n                <label class=\"form-label\">Dur\u00E9e</label>\n                <select class=\"form-select\" [(ngModel)]=\"newAppt.durationMinutes\">\n                  <option [value]=\"15\">15 minutes</option>\n                  <option [value]=\"30\">30 minutes</option>\n                  <option [value]=\"45\">45 minutes</option>\n                  <option [value]=\"60\">1 heure</option>\n                </select>\n              </div>\n              <div class=\"form-group-full\">\n                <label class=\"form-label\">Motif de consultation</label>\n                <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"newAppt.reason\"\n                          placeholder=\"D\u00E9crivez bri\u00E8vement le motif de votre visite...\"></textarea>\n              </div>\n            </div>\n\n            <!-- R\u00E9capitulatif -->\n            <div class=\"recap-box\">\n              <div class=\"recap-row\">\n                <span>\uD83D\uDC68\u200D\u2695\uFE0F M\u00E9decin</span>\n                <strong>Dr. {{ selectedDoctor()?.firstName || selectedDoctor()?.first_name }}\n                        {{ selectedDoctor()?.lastName  || selectedDoctor()?.last_name }}</strong>\n              </div>\n              <div class=\"recap-row\">\n                <span>\uD83D\uDCC5 Date & heure</span>\n                <strong>{{ formatFullDate(selectedSlot()!) }}</strong>\n              </div>\n              <div class=\"recap-row\">\n                <span>\uD83C\uDFE5 Type</span>\n                <strong>{{ getTypeLabel(newAppt.consultationType) }}</strong>\n              </div>\n              <div class=\"recap-row\">\n                <span>\u23F1 Dur\u00E9e</span>\n                <strong>{{ newAppt.durationMinutes }} minutes</strong>\n              </div>\n            </div>\n\n            <button class=\"btn-primary btn-full\" (click)=\"createAppointment()\" [disabled]=\"isCreating()\">\n              {{ isCreating() ? '\u23F3 Confirmation...' : '\u2705 Confirmer le rendez-vous' }}\n            </button>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE D\u00C9TAIL\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"view() === 'detail' && selectedAppt()\">\n        <div class=\"form-card\">\n          <div class=\"form-header\">\n            <button class=\"btn-back\" (click)=\"showView('list')\">\u2190 Retour</button>\n            <h2>D\u00E9tail du Rendez-vous</h2>\n          </div>\n          <div class=\"detail-grid\">\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\uD83D\uDC68\u200D\u2695\uFE0F M\u00E9decin</span>\n              <span class=\"detail-value\">Dr. {{ getDoctorName(selectedAppt()!) }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\uD83E\uDE7A Sp\u00E9cialit\u00E9</span>\n              <span class=\"detail-value\">{{ getSpecialty(selectedAppt()!) }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\uD83D\uDCC5 Date</span>\n              <span class=\"detail-value\">{{ formatFullDate(selectedAppt()!.appointmentDate) }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\u23F1 Dur\u00E9e</span>\n              <span class=\"detail-value\">{{ selectedAppt()!.durationMinutes }} min</span>\n            </div>\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\uD83C\uDFE5 Type</span>\n              <span class=\"detail-value\">{{ getTypeLabel(selectedAppt()!.consultationType) }}</span>\n            </div>\n            <div class=\"detail-row\" *ngIf=\"selectedAppt()!.reason\">\n              <span class=\"detail-label\">\uD83D\uDCDD Motif</span>\n              <span class=\"detail-value\">{{ selectedAppt()!.reason }}</span>\n            </div>\n            <div class=\"detail-row\">\n              <span class=\"detail-label\">\uD83D\uDCCC Statut</span>\n              <span class=\"status-pill\" [ngClass]=\"getStatusClass(selectedAppt()!.status)\">\n                {{ getStatusLabel(selectedAppt()!.status) }}\n              </span>\n            </div>\n            <div class=\"detail-row\" *ngIf=\"selectedAppt()!.cancellationReason\">\n              <span class=\"detail-label\">\uD83D\uDCAC Motif annulation</span>\n              <span class=\"detail-value\">{{ selectedAppt()!.cancellationReason }}</span>\n            </div>\n            <div class=\"detail-row\" *ngIf=\"selectedAppt()!.notes\">\n              <span class=\"detail-label\">\uD83D\uDDD2 Notes m\u00E9decin</span>\n              <span class=\"detail-value\">{{ selectedAppt()!.notes }}</span>\n            </div>\n          </div>\n          <div class=\"detail-actions\">\n            <button class=\"btn-danger\"\n                    *ngIf=\"canCancel(selectedAppt()!)\"\n                    (click)=\"openCancel(selectedAppt()!)\">\u2715 Annuler ce RDV</button>\n            <button class=\"btn-video\"\n                    *ngIf=\"isVideo(selectedAppt()!) && selectedAppt()!.status === 'CONFIRMED'\"\n                    (click)=\"joinVideo(selectedAppt()!)\">\uD83D\uDCF9 Rejoindre la t\u00E9l\u00E9consultation</button>\n            <button class=\"btn-rate\"\n                    *ngIf=\"selectedAppt()!.status === 'COMPLETED' && !selectedAppt()!.rated\"\n                    (click)=\"openRate(selectedAppt()!)\">\u2B50 \u00C9valuer la consultation</button>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE ANNULATION\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"view() === 'cancel' && selectedAppt()\">\n        <div class=\"form-card\">\n          <div class=\"form-header\">\n            <button class=\"btn-back\" (click)=\"showView('list')\">\u2190 Retour</button>\n            <h2>Annuler le Rendez-vous</h2>\n          </div>\n          <div class=\"cancel-warning\">\n            <div style=\"font-size:32px\">\u26A0\uFE0F</div>\n            <div>\n              <strong>Vous \u00EAtes sur le point d'annuler votre RDV</strong><br>\n              Dr. {{ getDoctorName(selectedAppt()!) }} \u2014 {{ formatFullDate(selectedAppt()!.appointmentDate) }}<br>\n              <span style=\"color:#ef4444; font-size:13px;\">Un d\u00E9lai minimum de 24h est requis pour annuler.</span>\n            </div>\n          </div>\n          <div class=\"form-group\" style=\"margin-top:20px;\">\n            <label class=\"form-label\">Motif d'annulation *</label>\n            <select class=\"form-select\" [(ngModel)]=\"cancelReason\">\n              <option value=\"\">\u2014 S\u00E9lectionner un motif \u2014</option>\n              <option value=\"Emp\u00EAchement personnel\">Emp\u00EAchement personnel</option>\n              <option value=\"Probl\u00E8me de transport\">Probl\u00E8me de transport</option>\n              <option value=\"Gu\u00E9rison spontan\u00E9e\">Gu\u00E9rison spontan\u00E9e</option>\n              <option value=\"Changement de m\u00E9decin\">Changement de m\u00E9decin</option>\n              <option value=\"Autre\">Autre</option>\n            </select>\n          </div>\n          <div class=\"form-group\" style=\"margin-top:12px;\">\n            <label class=\"form-label\">Pr\u00E9cisions (optionnel)</label>\n            <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"cancelNote\"\n                      placeholder=\"Informations suppl\u00E9mentaires...\"></textarea>\n          </div>\n          <div style=\"display:flex; gap:12px; margin-top:20px;\">\n            <button class=\"btn-outline flex-1\" (click)=\"showView('list')\">Conserver le RDV</button>\n            <button class=\"btn-danger flex-1\"\n                    (click)=\"confirmCancel()\"\n                    [disabled]=\"!cancelReason || isCancelling()\">\n              {{ isCancelling() ? '\u23F3 Annulation...' : \"\u2715 Confirmer l'annulation\" }}\n            </button>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE \u00C9VALUATION\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"view() === 'rate' && selectedAppt()\">\n        <div class=\"form-card\">\n          <div class=\"form-header\">\n            <button class=\"btn-back\" (click)=\"showView('list')\">\u2190 Retour</button>\n            <h2>\u00C9valuer la Consultation</h2>\n          </div>\n          <div style=\"text-align:center; padding:16px 0 24px;\">\n            <div style=\"font-size:40px; margin-bottom:8px;\">\u2B50</div>\n            <p style=\"color:#64748b;\">Votre avis aide les autres patients \u00E0 choisir leur m\u00E9decin</p>\n            <p style=\"font-weight:600; color:#0f172a;\">Dr. {{ getDoctorName(selectedAppt()!) }}</p>\n          </div>\n          <div class=\"stars-row\">\n            <span *ngFor=\"let i of [1,2,3,4,5]\"\n                  class=\"star\"\n                  [class.filled]=\"i <= hoverRating() || (hoverRating() === 0 && i <= rating())\"\n                  (click)=\"rating.set(i)\"\n                  (mouseenter)=\"hoverRating.set(i)\"\n                  (mouseleave)=\"hoverRating.set(0)\">\u2605</span>\n          </div>\n          <div class=\"rating-label\">{{ getRatingLabel() }}</div>\n          <div class=\"form-group\" style=\"margin-top:20px;\">\n            <label class=\"form-label\">Votre commentaire</label>\n            <textarea class=\"form-input\" rows=\"4\" [(ngModel)]=\"ratingComment\"\n                      placeholder=\"Partagez votre exp\u00E9rience avec ce m\u00E9decin...\"></textarea>\n          </div>\n          <div style=\"display:flex; gap:12px; margin-top:20px;\">\n            <button class=\"btn-outline flex-1\" (click)=\"showView('list')\">Annuler</button>\n            <button class=\"btn-primary flex-1\"\n                    (click)=\"submitRating()\"\n                    [disabled]=\"!rating() || isRating()\">\n              {{ isRating() ? '\u23F3 Envoi...' : '\u2B50 Publier mon avis' }}\n            </button>\n          </div>\n        </div>\n      </ng-container>\n\n    </div>\n  ",
            styles: ["\n     .slot-taken-overlay {\n  display:flex; justify-content:center; margin-top:16px;\n}\n.slot-taken-box {\n  background:#fff7ed; border:2px solid #fed7aa;\n  border-radius:14px; padding:24px 32px;\n  text-align:center; max-width:340px;\n  box-shadow:0 4px 20px rgba(234,88,12,.12);\n  animation:fadeIn .25s ease;\n}\n@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }\n.slot-taken-icon  { font-size:36px; margin-bottom:8px; }\n.slot-taken-title { font-size:16px; font-weight:700; color:#c2410c; margin-bottom:4px; }\n.slot-taken-sub   { font-size:13px; color:#9a3412; margin-bottom:16px; }\n.slot-taken-btn {\n  padding:9px 20px; background:#ea580c; color:white;\n  border:none; border-radius:8px; font-size:13px;\n  font-weight:600; cursor:pointer;\n}\n.slot-taken-btn:hover { background:#c2410c; }\n    .appt-page { padding: 0; }\n    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; }\n    .page-title { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }\n    .page-subtitle { color:#64748b; font-size:14px; margin:0; }\n\n    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n\n    .tabs-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }\n    .tab-btn { padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:24px; background:white; font-size:13px; cursor:pointer; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }\n    .tab-btn.active { border-color:#0d9488; color:#0d9488; background:#f0fdfa; font-weight:600; }\n    .tab-count { background:#e2e8f0; color:#64748b; border-radius:10px; padding:1px 7px; font-size:11px; }\n    .tab-btn.active .tab-count { background:#0d9488; color:white; }\n\n    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }\n    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#0d9488; border-radius:50%; animation:spin .8s linear infinite; }\n    @keyframes spin { to { transform:rotate(360deg); } }\n\n    .appt-list { display:flex; flex-direction:column; gap:12px; }\n    .appt-card { display:flex; background:white; border-radius:14px; border:1.5px solid #e2e8f0; overflow:hidden; cursor:pointer; transition:all .2s; }\n    .appt-card:hover { border-color:#0d9488; box-shadow:0 4px 16px rgba(13,148,136,.12); transform:translateY(-1px); }\n    .appt-date-block { min-width:72px; background:#0d9488; color:white; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px 8px; }\n    .appt-date-block.date-video { background:#3b82f6; }\n    .date-day   { font-size:26px; font-weight:700; line-height:1; }\n    .date-month { font-size:11px; text-transform:uppercase; opacity:.85; margin-top:2px; }\n    .date-year  { font-size:10px; opacity:.7; }\n    .appt-body  { flex:1; padding:16px 20px; }\n    .appt-top   { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; gap:12px; }\n    .appt-doctor { font-size:16px; font-weight:700; color:#0f172a; }\n    .appt-spec  { font-size:12px; color:#64748b; margin-top:2px; }\n    .appt-meta  { display:flex; flex-wrap:wrap; gap:12px; font-size:12px; color:#475569; margin-bottom:12px; }\n    .reason-badge { max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }\n    .appt-actions { display:flex; gap:8px; }\n\n    .status-pill       { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; white-space:nowrap; }\n    .status-confirmed  { background:#f0fdf4; color:#16a34a; }\n    .status-pending    { background:#fffbeb; color:#d97706; }\n    .status-cancelled  { background:#fef2f2; color:#dc2626; }\n    .status-completed  { background:#f8fafc; color:#64748b; }\n\n    .btn-primary  { padding:10px 20px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; }\n    .btn-primary:hover { background:#0f766e; }\n    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }\n    .btn-outline  { padding:10px 20px; background:white; color:#0d9488; border:2px solid #0d9488; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-danger   { padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-danger:disabled { opacity:.6; cursor:not-allowed; }\n    .btn-video    { padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-rate     { padding:10px 20px; background:#f59e0b; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-back     { background:none; border:none; color:#0d9488; cursor:pointer; font-size:14px; font-weight:600; padding:0; }\n    .btn-full     { width:100%; }\n    .btn-nav      { background:white; border:1.5px solid #e2e8f0; border-radius:8px; padding:8px 14px; cursor:pointer; font-size:16px; }\n    .btn-sm       { padding:5px 12px; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; }\n    .btn-sm.btn-danger { background:#ef4444; color:white; }\n    .btn-sm.btn-video  { background:#3b82f6; color:white; }\n    .btn-sm.btn-rate   { background:#f59e0b; color:white; }\n    .flex-1 { flex:1; }\n\n    .form-card    { background:white; border-radius:16px; padding:28px; box-shadow:0 2px 16px rgba(0,0,0,.06); max-width:800px; }\n    .form-header  { display:flex; align-items:center; gap:16px; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #f1f5f9; }\n    .form-header h2 { font-size:20px; font-weight:700; color:#0f172a; margin:0; }\n\n    .step-block  { margin-bottom:28px; padding:20px; background:#f8fafc; border-radius:12px; border:1px solid #e2e8f0; }\n    .step-label  { display:flex; align-items:center; gap:10px; font-size:15px; font-weight:700; color:#0f172a; margin-bottom:16px; }\n    .step-num    { width:28px; height:28px; background:#0d9488; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }\n\n    .search-bar  { display:flex; gap:10px; margin-bottom:16px; }\n    .search-hint { text-align:center; color:#94a3b8; font-size:13px; padding:20px; }\n    .doctors-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px,1fr)); gap:12px; }\n    .doctor-card  { background:white; border:1.5px solid #e2e8f0; border-radius:10px; padding:14px; cursor:pointer; display:flex; align-items:flex-start; gap:12px; transition:all .15s; position:relative; }\n    .doctor-card:hover  { border-color:#0d9488; }\n    .doctor-card.selected { border-color:#0d9488; background:#f0fdfa; }\n    .doc-avatar   { width:40px; height:40px; background:#0d9488; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; }\n    .doc-info     { flex:1; min-width:0; }\n    .doc-name     { font-size:13px; font-weight:700; color:#0f172a; }\n    .doc-spec     { font-size:11px; color:#64748b; margin:2px 0; }\n    .doc-meta     { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }\n    .doc-badge    { font-size:10px; padding:2px 6px; border-radius:6px; font-weight:600; }\n    .doc-badge.video { background:#eff6ff; color:#3b82f6; }\n    .doc-check    { position:absolute; top:10px; right:10px; color:#0d9488; font-size:16px; font-weight:700; }\n\n    .slot-picker       { overflow-x:auto; }\n    .slot-date-nav     { display:flex; align-items:flex-start; gap:8px; }\n    .slot-dates        { display:flex; gap:8px; flex:1; overflow-x:auto; }\n    .slot-day-col      { flex:1; min-width:70px; }\n    .slot-day-label    { font-size:11px; color:#64748b; text-align:center; font-weight:600; text-transform:uppercase; }\n    .slot-day-date     { font-size:16px; font-weight:700; color:#0f172a; text-align:center; margin:4px 0 8px; }\n    .slot-time         { background:white; border:1.5px solid #e2e8f0; border-radius:6px; padding:6px; text-align:center; font-size:12px; cursor:pointer; margin-bottom:4px; transition:all .15s; }\n    .slot-time:hover:not(.taken) { border-color:#0d9488; color:#0d9488; }\n    .slot-time.selected { background:#0d9488; color:white; border-color:#0d9488; }\n    .slot-time.taken   { background:#f1f5f9; color:#cbd5e1; cursor:not-allowed; text-decoration:line-through; }\n    .slot-empty        { text-align:center; color:#cbd5e1; font-size:20px; padding:10px; }\n\n    .confirm-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:20px; }\n    .recap-box    { background:#f0fdfa; border:1px solid #99f6e4; border-radius:10px; padding:16px; margin-bottom:20px; }\n    .recap-row    { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #ccfbf1; font-size:13px; }\n    .recap-row:last-child { border:none; }\n    .recap-row span { color:#64748b; }\n\n    .detail-grid    { margin-bottom:24px; }\n    .detail-row     { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }\n    .detail-label   { color:#64748b; }\n    .detail-value   { font-weight:600; color:#0f172a; text-align:right; }\n    .detail-actions { display:flex; gap:12px; flex-wrap:wrap; }\n\n    .cancel-warning { display:flex; gap:16px; align-items:flex-start; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px; margin-bottom:8px; font-size:14px; line-height:1.6; }\n\n    .stars-row    { display:flex; justify-content:center; gap:8px; margin:8px 0 4px; }\n    .star         { font-size:40px; cursor:pointer; transition:transform .1s; color:#e2e8f0; position:relative; z-index:1; }\n    .star.filled  { color:#f59e0b; }\n    .star:hover   { transform:scale(1.15); }\n    .rating-label { text-align:center; color:#64748b; font-size:14px; margin-bottom:8px; min-height:24px; }\n\n    .form-group      { display:flex; flex-direction:column; gap:6px; }\n    .form-group-full { grid-column:1/-1; display:flex; flex-direction:column; gap:6px; }\n    .form-label      { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }\n    .form-input      { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; }\n    .form-input:focus { border-color:#0d9488; }\n    .form-select     { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; background:white; width:100%; font-family:inherit; }\n    .form-select:focus { border-color:#0d9488; }\n\n    .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px; background:white; border-radius:14px; }\n\n    @media (max-width:640px) {\n      .confirm-grid  { grid-template-columns:1fr; }\n      .doctors-grid  { grid-template-columns:1fr; }\n      .detail-actions { flex-direction:column; }\n      .search-bar    { flex-direction:column; }\n    }\n  "]
        })
    ], PatientAppointmentsComponent);
    return PatientAppointmentsComponent;
}());
exports.PatientAppointmentsComponent = PatientAppointmentsComponent;
