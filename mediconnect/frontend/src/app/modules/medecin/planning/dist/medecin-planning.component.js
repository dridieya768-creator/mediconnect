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
exports.MedecinPlanningComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MedecinPlanningComponent = /** @class */ (function () {
    function MedecinPlanningComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.activeView = core_1.signal("calendar");
        this.isLoading = core_1.signal(true);
        this.isProcessing = core_1.signal(false);
        this.isSavingSlots = core_1.signal(false);
        this.processingId = core_1.signal(null);
        this.successMsg = core_1.signal(null);
        this.errorMsg = core_1.signal(null);
        // ── FIX : stocker l'ID utilisé pour recharger si besoin ──────────────────
        this.medecinDoctorId = core_1.signal(null);
        this.appointments = core_1.signal([]);
        this.modalAppt = core_1.signal(null);
        this.refuseTarget = core_1.signal(null);
        this.refuseReason = "";
        this.refuseNote = "";
        this.currentWeekStart = core_1.signal(this.getMonday(new Date()));
        this.defaultDuration = 30;
        this.acceptsTeleconsultation = true;
        this.workDays = [
            { name: "Lundi", active: true, morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
            { name: "Mardi", active: true, morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
            { name: "Mercredi", active: true, morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "17:00" },
            { name: "Jeudi", active: true, morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "18:00" },
            { name: "Vendredi", active: true, morningStart: "08:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "17:00" },
            { name: "Samedi", active: false, morningStart: "09:00", morningEnd: "13:00", afternoonStart: "14:00", afternoonEnd: "16:00" },
            { name: "Dimanche", active: false, morningStart: "09:00", morningEnd: "12:00", afternoonStart: "14:00", afternoonEnd: "16:00" },
        ];
        this.morningTimes = ["07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
        this.afternoonTimes = ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];
        // ── Computed ──────────────────────────────────────────────────────────────
        this.pendingAppointments = core_1.computed(function () {
            return _this.appointments().filter(function (a) { return a.status === "REQUESTED"; });
        });
        this.pendingCount = core_1.computed(function () { return _this.pendingAppointments().length; });
        this.calendarDays = core_1.computed(function () {
            var start = new Date(_this.currentWeekStart());
            var appts = _this.appointments();
            return Array.from({ length: 5 }, function (_, i) {
                var d = new Date(start);
                d.setDate(start.getDate() + i);
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                return {
                    name: d.toLocaleDateString("fr-FR", { weekday: "short" }).toUpperCase(),
                    num: d.getDate(),
                    isToday: d.getTime() === today.getTime(),
                    appointments: appts.filter(function (a) {
                        var ad = new Date(a.appointmentDate);
                        return ad.getFullYear() === d.getFullYear()
                            && ad.getMonth() === d.getMonth()
                            && ad.getDate() === d.getDate();
                    })
                };
            });
        });
        this.weekRangeLabel = core_1.computed(function () {
            var start = new Date(_this.currentWeekStart());
            var end = new Date(start);
            end.setDate(end.getDate() + 4);
            return start.toLocaleDateString("fr-FR", { day: "2-digit", month: "long" }) + " \u2013 " + end.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
        });
    }
    // ── Lifecycle ─────────────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.ngOnInit = function () {
        this.loadAppointments();
        this.loadAvailability();
    };
    MedecinPlanningComponent.prototype.loadAvailability = function () {
        var _this = this;
        this.http.get('/api/v1/medecins/availability')
            .pipe(operators_1.catchError(function (err) {
            console.error('[Availability] ERREUR:', err);
            return rxjs_1.of(null);
        }))
            .subscribe(function (res) {
            var _a;
            console.log('[Availability] réponse brute:', JSON.stringify(res));
            // Le backend retourne { workDays, defaultDuration, acceptsTeleconsultation }
            // mais peut-être wrappé dans { data: ... } ou { success: true, data: ... }
            var raw = (_a = res === null || res === void 0 ? void 0 : res.data) !== null && _a !== void 0 ? _a : res;
            // Si workDays encore null, essayer de lire depuis tarifs (fallback)
            var data = ((raw === null || raw === void 0 ? void 0 : raw.workDays) !== null && (raw === null || raw === void 0 ? void 0 : raw.workDays) !== undefined)
                ? raw
                : (function () {
                    try {
                        var t = typeof (raw === null || raw === void 0 ? void 0 : raw.tarifs) === 'string' ? JSON.parse(raw.tarifs) : raw === null || raw === void 0 ? void 0 : raw.tarifs;
                        return (t === null || t === void 0 ? void 0 : t.workDays) ? __assign(__assign({}, raw), t) : raw;
                    }
                    catch (_a) {
                        return raw;
                    }
                })();
            console.log('[Availability] data extraite:', JSON.stringify(data));
            if (!data)
                return;
            if (Array.isArray(data.workDays) && data.workDays.length > 0) {
                _this.workDays = _this.workDays.map(function (defaultDay) {
                    var saved = data.workDays.find(function (d) { return d.name === defaultDay.name; });
                    return saved ? __assign(__assign({}, defaultDay), saved) : defaultDay;
                });
                console.log('[Availability] workDays restaurés:', _this.workDays);
            }
            if (data.defaultDuration) {
                _this.defaultDuration = data.defaultDuration;
            }
            if (data.acceptsTeleconsultation !== undefined) {
                _this.acceptsTeleconsultation = data.acceptsTeleconsultation;
            }
        });
    };
    MedecinPlanningComponent.prototype.loadAppointments = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            console.log("[Planning] doctorId résolu:", (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.id);
            // ── Réponse brute confirmée : { success: true, data: { id, userId, ... } }
            // On lit directement res.data.userId (confirmé par les logs)
            var doctorId = ((_d = (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.id) || // ← AJOUTER EN PREMIER
             ((_f = (_e = res === null || res === void 0 ? void 0 : res.data) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.userId) || // ← AJOUTER
             ((_g = res === null || res === void 0 ? void 0 : res.data) === null || _g === void 0 ? void 0 : _g.userId) || ((_h = res === null || res === void 0 ? void 0 : res.data) === null || _h === void 0 ? void 0 : _h.id) || (res === null || res === void 0 ? void 0 : res.userId) || (res === null || res === void 0 ? void 0 : res.id) ||
                null;
            if (!doctorId) {
                console.error("[Planning] Aucun doctorId trouvé. Réponse brute :", res);
                _this.isLoading.set(false);
                return;
            }
            _this.medecinDoctorId.set(doctorId);
            _this.http.get("/api/v1/appointments/doctor/" + doctorId)
                .pipe(operators_1.catchError(function (err) {
                console.error("[Planning] Erreur chargement appointments :", err);
                return rxjs_1.of([]);
            }))
                .subscribe(function (appts) {
                var _a;
                // Normalise : tableau direct OU { data: [...] } OU { data: { data: [...] } }
                var list = Array.isArray(appts) ? appts :
                    Array.isArray(appts === null || appts === void 0 ? void 0 : appts.data) ? appts.data :
                        Array.isArray((_a = appts === null || appts === void 0 ? void 0 : appts.data) === null || _a === void 0 ? void 0 : _a.data) ? appts.data.data :
                            [];
                _this.appointments.set(list);
                _this.isLoading.set(false);
            });
        });
    };
    // ── Calendar navigation ────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.prevWeek = function () {
        var d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() - 7);
        this.currentWeekStart.set(d);
    };
    MedecinPlanningComponent.prototype.nextWeek = function () {
        var d = new Date(this.currentWeekStart());
        d.setDate(d.getDate() + 7);
        this.currentWeekStart.set(d);
    };
    MedecinPlanningComponent.prototype.goToday = function () { this.currentWeekStart.set(this.getMonday(new Date())); };
    // ── Modal ──────────────────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.openApptModal = function (appt) { this.modalAppt.set(appt); };
    MedecinPlanningComponent.prototype.closeModal = function () { this.modalAppt.set(null); };
    // ── Accept / Refuse ────────────────────────────────────────────────────────
    // Remplacez la méthode acceptRequest par celle-ci :
    MedecinPlanningComponent.prototype.acceptRequest = function (req) {
        var _this = this;
        this.processingId.set(req.id);
        // ✅ Utiliser le bon endpoint avec PATCH
        this.http.patch("/api/v1/medecins/appointments/" + req.id + "/accept", {}).subscribe({
            next: function (response) {
                console.log('✅ Rendez-vous accepté:', response);
                // Mettre à jour le statut du rendez-vous
                _this.appointments.update(function (list) {
                    return list.map(function (a) { return a.id === req.id ? __assign(__assign({}, a), { status: "CONFIRMED" }) : a; });
                });
                _this.processingId.set(null);
                _this.showSuccess("✅ Rendez-vous confirmé ! Le patient a été ajouté à votre liste.");
                // Optionnel: recharger la liste des patients dans le composant patients
                // Vous pouvez émettre un événement ou recharger les données
            },
            error: function (err) {
                var _a;
                _this.processingId.set(null);
                console.error('❌ Erreur lors de l\'acceptation:', err);
                // Extraire le message d'erreur correctement
                var errorMessage = "Erreur lors de la confirmation du rendez-vous.";
                if ((_a = err === null || err === void 0 ? void 0 : err.error) === null || _a === void 0 ? void 0 : _a.message) {
                    var rawMsg = err.error.message;
                    if (typeof rawMsg === 'string') {
                        errorMessage = rawMsg;
                    }
                    else if (Array.isArray(rawMsg)) {
                        errorMessage = rawMsg[0];
                    }
                    else if (typeof rawMsg === 'object') {
                        errorMessage = JSON.stringify(rawMsg);
                    }
                }
                else if (err === null || err === void 0 ? void 0 : err.message) {
                    errorMessage = err.message;
                }
                // Message personnalisé pour conflit de créneau
                if (errorMessage.includes('déjà réservé') ||
                    errorMessage.includes('créneau') ||
                    errorMessage.includes('conflict') ||
                    errorMessage.includes('occupé')) {
                    _this.showError('⏰ Ce créneau est déjà occupé. Veuillez choisir un autre horaire.');
                }
                else {
                    _this.showError(errorMessage);
                }
            }
        });
    };
    MedecinPlanningComponent.prototype.acceptFromModal = function () {
        var appt = this.modalAppt();
        if (appt) {
            this.acceptRequest(appt);
            this.closeModal();
        }
    };
    MedecinPlanningComponent.prototype.openRefuse = function (req) {
        this.refuseTarget.set(req);
        this.refuseReason = "";
        this.refuseNote = "";
    };
    MedecinPlanningComponent.prototype.refuseFromModal = function () {
        var appt = this.modalAppt();
        if (appt) {
            this.closeModal();
            this.openRefuse(appt);
        }
    };
    MedecinPlanningComponent.prototype.confirmRefuse = function () {
        var _this = this;
        var req = this.refuseTarget();
        if (!req || !this.refuseReason)
            return;
        this.isProcessing.set(true);
        var reason = this.refuseNote
            ? this.refuseReason + " \u2014 " + this.refuseNote
            : this.refuseReason;
        this.http.patch("/api/v1/appointments/" + req.id + "/cancel", { reason: reason }).subscribe({
            next: function () {
                _this.appointments.update(function (list) {
                    return list.map(function (a) { return a.id === req.id ? __assign(__assign({}, a), { status: "CANCELLED", cancellationReason: reason }) : a; });
                });
                _this.isProcessing.set(false);
                _this.refuseTarget.set(null);
                _this.showSuccess("Demande refusée. Le patient a été notifié.");
            },
            error: function () {
                _this.isProcessing.set(false);
                _this.showError("Erreur lors du refus.");
            }
        });
    };
    // ── Complete ───────────────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.completeAppt = function (appt) {
        var _this = this;
        this.http.patch("/api/v1/appointments/" + appt.id + "/complete", {}).subscribe({
            next: function () {
                _this.appointments.update(function (list) {
                    return list.map(function (a) { return a.id === appt.id ? __assign(__assign({}, a), { status: "COMPLETED" }) : a; });
                });
                _this.closeModal();
                _this.showSuccess("Consultation marquée comme terminée.");
            },
            error: function () { return _this.showError("Erreur."); }
        });
    };
    // ── Join video ─────────────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.joinVideo = function (appt) {
        var roomId = appt.videoRoomId || "mediconnect-" + appt.id;
        window.open("https://meet.jit.si/" + roomId, "_blank");
    };
    // ── Save availability ──────────────────────────────────────────────────────
    // ── Save availability ──────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.saveAvailability = function () {
        var _this = this;
        this.isSavingSlots.set(true);
        var payload = {
            workDays: this.workDays,
            defaultDuration: this.defaultDuration,
            acceptsTeleconsultation: this.acceptsTeleconsultation,
            disponTeleconsult: this.acceptsTeleconsultation,
            connexionVideoIntegree: this.acceptsTeleconsultation
        };
        this.http.put('/api/v1/medecins/availability', payload)
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            _this.isSavingSlots.set(false);
            _this.showSuccess('Disponibilités enregistrées !');
        });
    };
    // ── Helpers ────────────────────────────────────────────────────────────────
    MedecinPlanningComponent.prototype.getPatientName = function (a) {
        var p = a.patient;
        if (!p)
            return "Patient";
        var prenom = p.prenom || p.firstName || p.first_name || "";
        var nom = p.nom || p.lastName || p.last_name || "";
        return (prenom + " " + nom).trim() || "Patient";
    };
    MedecinPlanningComponent.prototype.getPatientInitials = function (a) {
        var _a;
        var name = this.getPatientName(a);
        var parts = name.split(" ").filter(Boolean);
        return parts.length >= 2
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : (((_a = parts[0]) === null || _a === void 0 ? void 0 : _a[0]) || "P").toUpperCase();
    };
    MedecinPlanningComponent.prototype.formatTime = function (d) {
        return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
    };
    MedecinPlanningComponent.prototype.formatFullDate = function (d) {
        if (!d)
            return "";
        return new Date(d).toLocaleDateString("fr-FR", {
            weekday: "long", day: "2-digit", month: "long", year: "numeric"
        }) + " à " + this.formatTime(d);
    };
    MedecinPlanningComponent.prototype.getTypeLabel = function (t) {
        return { PHYSICAL: "🏥 Présentiel", TELECONSULTATION: "💻 Téléconsultation", HOME_VISIT: "🏠 À domicile" }[t] || t;
    };
    MedecinPlanningComponent.prototype.getStatusLabel = function (s) {
        return { CONFIRMED: "✓ Confirmé", REQUESTED: "⏳ En attente", CANCELLED: "✕ Annulé", COMPLETED: "✔ Terminé", NO_SHOW: "⚠ Absent" }[s] || s;
    };
    MedecinPlanningComponent.prototype.getStatusClass = function (s) {
        return { CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed" }[s] || "status-pending";
    };
    MedecinPlanningComponent.prototype.getApptClass = function (s) {
        return { CONFIRMED: "appt-confirmed", REQUESTED: "appt-requested", COMPLETED: "appt-completed", CANCELLED: "appt-cancelled" }[s] || "appt-requested";
    };
    MedecinPlanningComponent.prototype.getMonday = function (d) {
        var date = new Date(d);
        var day = date.getDay();
        date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
        date.setHours(0, 0, 0, 0);
        return date;
    };
    MedecinPlanningComponent.prototype.showSuccess = function (msg) {
        var _this = this;
        this.successMsg.set(msg);
        setTimeout(function () { return _this.successMsg.set(null); }, 4000);
    };
    MedecinPlanningComponent.prototype.showError = function (msg) {
        var _this = this;
        this.errorMsg.set(msg);
        setTimeout(function () { return _this.errorMsg.set(null); }, 5000);
    };
    MedecinPlanningComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-planning",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            template: "\n    <div class=\"planning-page\">\n\n      <!-- HEADER -->\n      <div class=\"page-header\">\n        <div>\n          <h1 class=\"page-title\">\uD83D\uDCC5 Mon Planning</h1>\n          <p class=\"page-subtitle\">G\u00E9rez vos disponibilit\u00E9s et demandes de RDV</p>\n        </div>\n        <div class=\"header-actions\">\n          <button class=\"btn-outline\" (click)=\"activeView.set('slots')\">\n            \u2699\uFE0F G\u00E9rer disponibilit\u00E9s\n          </button>\n          <div class=\"notif-badge\" *ngIf=\"pendingCount() > 0\">\n            {{ pendingCount() }} demande(s) en attente\n          </div>\n        </div>\n      </div>\n\n      <!-- MESSAGES -->\n      <div class=\"alert-success\" *ngIf=\"successMsg()\">\u2705 {{ successMsg() }}</div>\n      <div class=\"alert-error\"   *ngIf=\"errorMsg()\">\u274C {{ errorMsg() }}</div>\n\n      <!-- NAV TABS -->\n      <div class=\"tabs-bar\">\n        <button class=\"tab-btn\" [class.active]=\"activeView() === 'calendar'\" (click)=\"activeView.set('calendar')\">\n          \uD83D\uDCC6 Calendrier\n        </button>\n        <button class=\"tab-btn\" [class.active]=\"activeView() === 'requests'\" (click)=\"activeView.set('requests')\">\n          \uD83D\uDCE5 Demandes\n          <span class=\"tab-count pending\" *ngIf=\"pendingCount() > 0\">{{ pendingCount() }}</span>\n        </button>\n        <button class=\"tab-btn\" [class.active]=\"activeView() === 'slots'\" (click)=\"activeView.set('slots')\">\n          \uD83D\uDD50 Disponibilit\u00E9s\n        </button>\n      </div>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE CALENDRIER\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"activeView() === 'calendar'\">\n        <div class=\"calendar-card\">\n\n          <!-- Week navigation -->\n          <div class=\"cal-nav\">\n            <button class=\"btn-nav\" (click)=\"prevWeek()\">\u2039</button>\n            <span class=\"cal-title\">{{ weekRangeLabel() }}</span>\n            <button class=\"btn-nav\" (click)=\"nextWeek()\">\u203A</button>\n            <button class=\"btn-today\" (click)=\"goToday()\">Aujourd'hui</button>\n          </div>\n\n          <!-- Loading -->\n          <div class=\"loading-state\" *ngIf=\"isLoading()\">\n            <div class=\"spinner\"></div>\n            <p>Chargement...</p>\n          </div>\n\n          <!-- Calendar grid -->\n          <div class=\"cal-grid\" *ngIf=\"!isLoading()\">\n            <div class=\"cal-day-col\" *ngFor=\"let day of calendarDays()\">\n              <div class=\"cal-day-header\" [class.today]=\"day.isToday\">\n                <div class=\"cal-day-name\">{{ day.name }}</div>\n                <div class=\"cal-day-num\" [class.today-num]=\"day.isToday\">{{ day.num }}</div>\n              </div>\n              <div class=\"cal-day-body\">\n                <div class=\"cal-appt\"\n                     *ngFor=\"let appt of day.appointments\"\n                     [ngClass]=\"getApptClass(appt.status)\"\n                     (click)=\"openApptModal(appt)\">\n                  <div class=\"cal-appt-time\">{{ formatTime(appt.appointmentDate) }}</div>\n                  <div class=\"cal-appt-name\">{{ getPatientName(appt) }}</div>\n                  <div class=\"cal-appt-type\">{{ appt.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB' : '\uD83C\uDFE5' }}</div>\n                </div>\n                <div class=\"cal-empty-day\" *ngIf=\"day.appointments.length === 0\">\n                  <span>\u2014</span>\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <!-- Legend -->\n          <div class=\"cal-legend\">\n            <span class=\"legend-item confirmed\">\u2713 Confirm\u00E9</span>\n            <span class=\"legend-item pending\">\u23F3 En attente</span>\n            <span class=\"legend-item completed\">\u2714 Termin\u00E9</span>\n            <span class=\"legend-item cancelled\">\u2715 Annul\u00E9</span>\n          </div>\n        </div>\n\n        <!-- Modal d\u00E9tail RDV -->\n        <div class=\"modal-overlay\" *ngIf=\"modalAppt()\" (click)=\"closeModal()\">\n          <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n            <div class=\"modal-header\">\n              <h3>D\u00E9tail du Rendez-vous</h3>\n              <button class=\"btn-close\" (click)=\"closeModal()\">\u2715</button>\n            </div>\n            <div class=\"modal-body\">\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDC64 Patient</span>\n                <span class=\"detail-value\">{{ getPatientName(modalAppt()!) }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDCC5 Date</span>\n                <span class=\"detail-value\">{{ formatFullDate(modalAppt()!.appointmentDate) }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\u23F1 Dur\u00E9e</span>\n                <span class=\"detail-value\">{{ modalAppt()!.durationMinutes }} min</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83C\uDFE5 Type</span>\n                <span class=\"detail-value\">{{ getTypeLabel(modalAppt()!.consultationType) }}</span>\n              </div>\n              <div class=\"detail-row\" *ngIf=\"modalAppt()!.reason\">\n                <span class=\"detail-label\">\uD83D\uDCDD Motif</span>\n                <span class=\"detail-value\">{{ modalAppt()!.reason }}</span>\n              </div>\n              <div class=\"detail-row\">\n                <span class=\"detail-label\">\uD83D\uDCCC Statut</span>\n                <span class=\"status-pill\" [ngClass]=\"getStatusClass(modalAppt()!.status)\">\n                  {{ getStatusLabel(modalAppt()!.status) }}\n                </span>\n              </div>\n            </div>\n            <div class=\"modal-actions\" *ngIf=\"modalAppt()!.status === 'REQUESTED'\">\n              <button class=\"btn-danger\" (click)=\"refuseFromModal()\">\u2715 Refuser</button>\n              <button class=\"btn-primary\" (click)=\"acceptFromModal()\">\u2713 Confirmer</button>\n            </div>\n            <div class=\"modal-actions\" *ngIf=\"modalAppt()!.status === 'CONFIRMED'\">\n              <button class=\"btn-video\" *ngIf=\"modalAppt()!.consultationType === 'TELECONSULTATION'\"\n                      (click)=\"joinVideo(modalAppt()!)\">\uD83D\uDCF9 D\u00E9marrer t\u00E9l\u00E9consult.</button>\n              <button class=\"btn-complete\" (click)=\"completeAppt(modalAppt()!)\">\u2714 Marquer termin\u00E9</button>\n            </div>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE DEMANDES EN ATTENTE\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"activeView() === 'requests'\">\n        <div class=\"section-title\">\n          \uD83D\uDCE5 Demandes de rendez-vous en attente\n          <span class=\"badge-count\">{{ pendingAppointments().length }}</span>\n        </div>\n\n        <div class=\"loading-state\" *ngIf=\"isLoading()\">\n          <div class=\"spinner\"></div>\n          <p>Chargement...</p>\n        </div>\n\n        <div class=\"requests-list\" *ngIf=\"!isLoading()\">\n          <div class=\"request-card\" *ngFor=\"let req of pendingAppointments()\">\n            <div class=\"req-left\">\n              <div class=\"req-avatar\">{{ getPatientInitials(req) }}</div>\n              <div class=\"req-info\">\n                <div class=\"req-name\">{{ getPatientName(req) }}</div>\n                <div class=\"req-meta\">\n                  <span>\uD83D\uDCC5 {{ formatFullDate(req.appointmentDate) }}</span>\n                  <span>\u23F1 {{ req.durationMinutes }} min</span>\n                  <span>{{ req.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9consultation' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}</span>\n                </div>\n                <div class=\"req-reason\" *ngIf=\"req.reason\">\uD83D\uDCDD {{ req.reason }}</div>\n              </div>\n            </div>\n            <div class=\"req-actions\">\n              <button class=\"btn-refuse\" (click)=\"openRefuse(req)\">\u2715 Refuser</button>\n              <button class=\"btn-accept\" (click)=\"acceptRequest(req)\" [disabled]=\"processingId() === req.id\">\n                {{ processingId() === req.id ? '\u23F3' : '\u2713 Confirmer' }}\n              </button>\n            </div>\n          </div>\n\n          <!-- Refus modal -->\n          <div class=\"modal-overlay\" *ngIf=\"refuseTarget()\" (click)=\"refuseTarget.set(null)\">\n            <div class=\"modal-card\" (click)=\"$event.stopPropagation()\">\n              <div class=\"modal-header\">\n                <h3>Refuser le rendez-vous</h3>\n                <button class=\"btn-close\" (click)=\"refuseTarget.set(null)\">\u2715</button>\n              </div>\n              <div class=\"modal-body\">\n                <p style=\"color:#64748b; margin:0 0 16px;\">\n                  Patient : <strong>{{ getPatientName(refuseTarget()!) }}</strong><br>\n                  Date : <strong>{{ formatFullDate(refuseTarget()!.appointmentDate) }}</strong>\n                </p>\n                <div class=\"form-group\">\n                  <label class=\"form-label\">Motif de refus *</label>\n                  <select class=\"form-select\" [(ngModel)]=\"refuseReason\">\n                    <option value=\"\">\u2014 S\u00E9lectionner \u2014</option>\n                    <option value=\"Agenda complet\">Agenda complet</option>\n                    <option value=\"Hors comp\u00E9tence\">Hors comp\u00E9tence m\u00E9dicale</option>\n                    <option value=\"Cr\u00E9neau non disponible\">Cr\u00E9neau non disponible</option>\n                    <option value=\"Urgence prioritaire\">Urgence prioritaire</option>\n                    <option value=\"Autre\">Autre</option>\n                  </select>\n                </div>\n                <div class=\"form-group\" style=\"margin-top:12px;\">\n                  <label class=\"form-label\">Message au patient (optionnel)</label>\n                  <textarea class=\"form-input\" rows=\"3\" [(ngModel)]=\"refuseNote\"\n                            placeholder=\"Expliquez bri\u00E8vement...\"></textarea>\n                </div>\n              </div>\n              <div class=\"modal-actions\">\n                <button class=\"btn-outline\" (click)=\"refuseTarget.set(null)\">Annuler</button>\n                <button class=\"btn-danger\" (click)=\"confirmRefuse()\" [disabled]=\"!refuseReason || isProcessing()\">\n                  {{ isProcessing() ? '\u23F3' : '\u2715 Confirmer le refus' }}\n                </button>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"empty-state\" *ngIf=\"pendingAppointments().length === 0\">\n            <div style=\"font-size:48px\">\u2705</div>\n            <p>Aucune demande en attente</p>\n          </div>\n        </div>\n      </ng-container>\n\n      <!-- \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n           VUE DISPONIBILIT\u00C9S\n           \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <ng-container *ngIf=\"activeView() === 'slots'\">\n        <div class=\"form-card\">\n          <h2 class=\"section-title\">\uD83D\uDD50 G\u00E9rer mes disponibilit\u00E9s</h2>\n          <p style=\"color:#64748b; font-size:14px; margin-bottom:24px;\">\n            D\u00E9finissez vos plages horaires de travail. Les cr\u00E9neaux seront automatiquement propos\u00E9s aux patients.\n          </p>\n\n          <div class=\"slots-grid\">\n            <div class=\"slot-day-row\" *ngFor=\"let day of workDays\">\n              <div class=\"slot-day-name\">\n                <label class=\"toggle-label\">\n                  <input type=\"checkbox\" [(ngModel)]=\"day.active\" class=\"toggle-input\">\n                  <span class=\"toggle-switch\"></span>\n                  {{ day.name }}\n                </label>\n              </div>\n              <div class=\"slot-time-inputs\" *ngIf=\"day.active\">\n                <div class=\"time-range\">\n                  <span>Matin :</span>\n                  <select class=\"form-select-sm\" [(ngModel)]=\"day.morningStart\">\n                    <option *ngFor=\"let t of morningTimes\" [value]=\"t\">{{ t }}</option>\n                  </select>\n                  <span>\u2192</span>\n                  <select class=\"form-select-sm\" [(ngModel)]=\"day.morningEnd\">\n                    <option *ngFor=\"let t of morningTimes\" [value]=\"t\">{{ t }}</option>\n                  </select>\n                </div>\n                <div class=\"time-range\">\n                  <span>Apr\u00E8s-midi :</span>\n                  <select class=\"form-select-sm\" [(ngModel)]=\"day.afternoonStart\">\n                    <option *ngFor=\"let t of afternoonTimes\" [value]=\"t\">{{ t }}</option>\n                  </select>\n                  <span>\u2192</span>\n                  <select class=\"form-select-sm\" [(ngModel)]=\"day.afternoonEnd\">\n                    <option *ngFor=\"let t of afternoonTimes\" [value]=\"t\">{{ t }}</option>\n                  </select>\n                </div>\n              </div>\n              <div class=\"slot-day-off\" *ngIf=\"!day.active\">\n                <span>Jour de repos</span>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"form-group\" style=\"margin-top:24px; max-width:300px;\">\n            <label class=\"form-label\">Dur\u00E9e par d\u00E9faut d'une consultation</label>\n            <select class=\"form-select\" [(ngModel)]=\"defaultDuration\">\n              <option [value]=\"15\">15 minutes</option>\n              <option [value]=\"20\">20 minutes</option>\n              <option [value]=\"30\">30 minutes</option>\n              <option [value]=\"45\">45 minutes</option>\n              <option [value]=\"60\">1 heure</option>\n            </select>\n          </div>\n\n          <div class=\"form-group\" style=\"margin-top:16px;\">\n            <label class=\"toggle-label\">\n              <input type=\"checkbox\" [(ngModel)]=\"acceptsTeleconsultation\" class=\"toggle-input\">\n              <span class=\"toggle-switch\"></span>\n              <span style=\"font-size:14px; font-weight:600;\">Accepter les t\u00E9l\u00E9consultations (Jitsi Meet)</span>\n            </label>\n          </div>\n\n          <button class=\"btn-primary\" style=\"margin-top:28px;\" (click)=\"saveAvailability()\" [disabled]=\"isSavingSlots()\">\n            {{ isSavingSlots() ? '\u23F3 Enregistrement...' : '\uD83D\uDCBE Enregistrer les disponibilit\u00E9s' }}\n          </button>\n        </div>\n      </ng-container>\n\n    </div>\n  ",
            styles: ["\n    .planning-page { padding:0; }\n    .page-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; flex-wrap:wrap; gap:12px; }\n    .page-title  { font-size:26px; font-weight:700; color:#0f172a; margin:0 0 4px; }\n    .page-subtitle { color:#64748b; font-size:14px; margin:0; }\n    .header-actions { display:flex; align-items:center; gap:12px; }\n\n    .notif-badge { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:8px; padding:6px 12px; font-size:12px; font-weight:600; }\n\n    .alert-success { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n    .alert-error   { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; font-size:14px; }\n\n    .tabs-bar { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }\n    .tab-btn { padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:24px; background:white; font-size:13px; cursor:pointer; color:#64748b; display:flex; align-items:center; gap:6px; transition:all .15s; }\n    .tab-btn.active { border-color:#4f46e5; color:#4f46e5; background:#eef2ff; font-weight:600; }\n    .tab-count { background:#e2e8f0; color:#64748b; border-radius:10px; padding:1px 7px; font-size:11px; }\n    .tab-count.pending { background:#fef2f2; color:#dc2626; }\n    .tab-btn.active .tab-count { background:#4f46e5; color:white; }\n\n    .calendar-card { background:white; border-radius:16px; padding:24px; box-shadow:0 2px 16px rgba(0,0,0,.06); overflow:hidden; }\n    .cal-nav { display:flex; align-items:center; gap:12px; margin-bottom:20px; }\n    .cal-title { font-size:16px; font-weight:700; color:#0f172a; flex:1; text-align:center; }\n    .btn-nav  { background:white; border:1.5px solid #e2e8f0; border-radius:8px; padding:6px 14px; cursor:pointer; font-size:16px; }\n    .btn-today { padding:6px 14px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }\n    .cal-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; }\n    .cal-day-col { min-width:0; }\n    .cal-day-header { text-align:center; padding:8px 4px; border-radius:8px 8px 0 0; }\n    .cal-day-header.today { background:#eef2ff; }\n    .cal-day-name { font-size:11px; color:#64748b; text-transform:uppercase; font-weight:600; }\n    .cal-day-num  { font-size:20px; font-weight:700; color:#0f172a; }\n    .cal-day-num.today-num { color:#4f46e5; }\n    .cal-day-body { min-height:120px; border:1px solid #f1f5f9; border-radius:0 0 8px 8px; padding:4px; }\n    .cal-appt { padding:4px 6px; border-radius:6px; margin-bottom:4px; cursor:pointer; transition:opacity .15s; }\n    .cal-appt:hover { opacity:.85; }\n    .cal-appt-time { font-size:10px; font-weight:700; }\n    .cal-appt-name { font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }\n    .cal-appt-type { font-size:10px; }\n    .cal-appt.appt-confirmed  { background:#dcfce7; color:#166534; }\n    .cal-appt.appt-requested  { background:#fef9c3; color:#854d0e; }\n    .cal-appt.appt-completed  { background:#f1f5f9; color:#475569; }\n    .cal-appt.appt-cancelled  { background:#fef2f2; color:#dc2626; opacity:.6; }\n    .cal-empty-day { display:flex; align-items:center; justify-content:center; height:60px; color:#e2e8f0; font-size:20px; }\n    .cal-legend { display:flex; gap:16px; margin-top:16px; flex-wrap:wrap; padding-top:12px; border-top:1px solid #f1f5f9; }\n    .legend-item { font-size:12px; display:flex; align-items:center; gap:6px; }\n    .legend-item::before { content:''; width:12px; height:12px; border-radius:3px; }\n    .legend-item.confirmed::before { background:#dcfce7; }\n    .legend-item.pending::before   { background:#fef9c3; }\n    .legend-item.completed::before { background:#f1f5f9; }\n    .legend-item.cancelled::before { background:#fef2f2; }\n\n    .section-title { font-size:16px; font-weight:700; color:#0f172a; margin-bottom:16px; display:flex; align-items:center; gap:10px; }\n    .badge-count   { background:#4f46e5; color:white; border-radius:10px; padding:2px 10px; font-size:12px; }\n    .requests-list { display:flex; flex-direction:column; gap:12px; }\n    .request-card  { background:white; border-radius:12px; border:1.5px solid #e2e8f0; padding:16px 20px; display:flex; align-items:center; justify-content:space-between; gap:16px; transition:border-color .15s; }\n    .request-card:hover { border-color:#4f46e5; }\n    .req-left   { display:flex; gap:14px; align-items:flex-start; flex:1; }\n    .req-avatar { width:44px; height:44px; background:#4f46e5; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; flex-shrink:0; }\n    .req-info   { flex:1; }\n    .req-name   { font-size:15px; font-weight:700; color:#0f172a; }\n    .req-meta   { display:flex; flex-wrap:wrap; gap:10px; font-size:12px; color:#64748b; margin:4px 0; }\n    .req-reason { font-size:12px; color:#475569; background:#f8fafc; padding:4px 8px; border-radius:6px; margin-top:4px; }\n    .req-actions { display:flex; gap:8px; flex-shrink:0; }\n    .btn-accept { padding:8px 18px; background:#16a34a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }\n    .btn-accept:disabled { opacity:.6; cursor:not-allowed; }\n    .btn-refuse { padding:8px 18px; background:white; color:#dc2626; border:1.5px solid #dc2626; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }\n\n    .form-card { background:white; border-radius:16px; padding:28px; box-shadow:0 2px 16px rgba(0,0,0,.06); }\n    .slots-grid { display:flex; flex-direction:column; gap:12px; }\n    .slot-day-row { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px 18px; display:flex; align-items:flex-start; gap:16px; flex-wrap:wrap; }\n    .slot-day-name { min-width:120px; }\n    .slot-time-inputs { display:flex; flex-direction:column; gap:8px; flex:1; }\n    .slot-day-off { color:#94a3b8; font-size:13px; flex:1; padding-top:6px; }\n    .time-range { display:flex; align-items:center; gap:8px; font-size:13px; color:#64748b; flex-wrap:wrap; }\n    .form-select-sm { padding:5px 8px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:13px; background:white; cursor:pointer; }\n\n    .toggle-label  { display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; font-weight:600; color:#0f172a; }\n    .toggle-input  { display:none; }\n    .toggle-switch { width:40px; height:22px; background:#e2e8f0; border-radius:11px; position:relative; transition:background .2s; flex-shrink:0; }\n    .toggle-switch::after { content:''; position:absolute; top:3px; left:3px; width:16px; height:16px; background:white; border-radius:50%; transition:transform .2s; }\n    .toggle-input:checked + .toggle-switch { background:#4f46e5; }\n    .toggle-input:checked + .toggle-switch::after { transform:translateX(18px); }\n\n    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:999; padding:20px; }\n    .modal-card    { background:white; border-radius:16px; padding:24px; width:100%; max-width:480px; box-shadow:0 20px 60px rgba(0,0,0,.2); }\n    .modal-header  { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }\n    .modal-header h3 { font-size:18px; font-weight:700; color:#0f172a; margin:0; }\n    .btn-close     { background:none; border:none; font-size:20px; cursor:pointer; color:#64748b; }\n    .modal-body    { margin-bottom:20px; }\n    .modal-actions { display:flex; gap:12px; }\n\n    .detail-row   { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; font-size:14px; }\n    .detail-label { color:#64748b; }\n    .detail-value { font-weight:600; color:#0f172a; }\n\n    .status-pill      { padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; }\n    .status-confirmed { background:#f0fdf4; color:#16a34a; }\n    .status-pending   { background:#fffbeb; color:#d97706; }\n    .status-cancelled { background:#fef2f2; color:#dc2626; }\n    .status-completed { background:#f8fafc; color:#64748b; }\n\n    .btn-primary  { padding:10px 20px; background:#4f46e5; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-primary:disabled { opacity:.6; cursor:not-allowed; }\n    .btn-outline  { padding:9px 18px; background:white; color:#4f46e5; border:1.5px solid #4f46e5; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-danger   { padding:10px 20px; background:#ef4444; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-danger:disabled { opacity:.6; cursor:not-allowed; }\n    .btn-video    { padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n    .btn-complete { padding:10px 20px; background:#0d9488; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; }\n\n    .loading-state { display:flex; flex-direction:column; align-items:center; padding:60px; color:#64748b; gap:12px; }\n    .spinner { width:40px; height:40px; border:3px solid #e2e8f0; border-top-color:#4f46e5; border-radius:50%; animation:spin .8s linear infinite; }\n    @keyframes spin { to { transform:rotate(360deg); } }\n\n    .empty-state { text-align:center; padding:60px 20px; color:#94a3b8; display:flex; flex-direction:column; align-items:center; gap:16px; background:white; border-radius:14px; }\n\n    .form-group  { display:flex; flex-direction:column; gap:6px; }\n    .form-label  { font-size:12px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }\n    .form-input  { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; outline:none; width:100%; box-sizing:border-box; resize:vertical; font-family:inherit; }\n    .form-input:focus { border-color:#4f46e5; }\n    .form-select { padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; color:#0f172a; background:white; outline:none; width:100%; font-family:inherit; }\n    .form-select:focus { border-color:#4f46e5; }\n\n    @media (max-width:640px) {\n      .cal-grid { grid-template-columns:repeat(3,1fr); }\n      .req-actions { flex-direction:column; }\n      .request-card { flex-direction:column; }\n    }\n  "]
        })
    ], MedecinPlanningComponent);
    return MedecinPlanningComponent;
}());
exports.MedecinPlanningComponent = MedecinPlanningComponent;
