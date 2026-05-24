"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PatientAppointmentsComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var http_1 = require("@angular/common/http");
var router_1 = require("@angular/router");
var rxjs_1 = require("rxjs");
var PatientAppointmentsComponent = /** @class */ (function () {
    function PatientAppointmentsComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.router = core_1.inject(router_1.Router);
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
        this.doctorConges = core_1.signal([]);
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
        // 👉 (le reste de TON TS reste STRICTEMENT identique)
        // Je ne le répète pas ici pour éviter un bloc énorme,
        // mais tu copies-colles tout le reste de tes méthodes sans changement.
    }
    PatientAppointmentsComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.loadPatient();
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
                _this.doctors.set(list);
            }
            _this.searchLoading.set(false);
        });
    };
    PatientAppointmentsComponent = __decorate([
        core_1.Component({
            selector: "app-patient-appointments",
            standalone: true,
            imports: [common_1.CommonModule, forms_1.FormsModule],
            templateUrl: "./patient-appointments.component.html",
            styleUrls: ["./patient-appointments.component.scss"]
        })
    ], PatientAppointmentsComponent);
    return PatientAppointmentsComponent;
}());
exports.PatientAppointmentsComponent = PatientAppointmentsComponent;
