"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MedecinDashboardComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
var MedecinDashboardComponent = /** @class */ (function () {
    function MedecinDashboardComponent() {
        var _this = this;
        this.http = core_1.inject(http_1.HttpClient);
        this.cdr = core_1.inject(core_1.ChangeDetectorRef);
        this.medecin = core_1.signal(null);
        this.appointments = core_1.signal([]);
        this.isLoading = core_1.signal(true);
        this.qrLoading = core_1.signal(true);
        this.qrError = core_1.signal(null);
        this.profileUrl = core_1.signal("");
        this.copied = core_1.signal(false);
        this.doctorId = null;
        this.pendingQrUrl = null; // URL en attente si AfterViewInit pas encore passé
        // ── Computed ────────────────────────────────────────────────────────────
        this.upcomingAppointments = core_1.computed(function () {
            var now = new Date();
            return _this.appointments()
                .filter(function (a) { return new Date(a.appointmentDate) >= now
                && (a.status === "CONFIRMED" || a.status === "REQUESTED"); })
                .sort(function (a, b) { return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(); })
                .slice(0, 8);
        });
        this.pendingCount = core_1.computed(function () {
            return _this.appointments().filter(function (a) { return a.status === "REQUESTED"; }).length;
        });
        this.stats = core_1.computed(function () {
            var appts = _this.appointments();
            var today = new Date();
            var todayStr = today.toDateString();
            var todayCount = appts.filter(function (a) {
                return new Date(a.appointmentDate).toDateString() === todayStr;
            }).length;
            var weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay() + 1);
            var weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            var weekCount = appts.filter(function (a) {
                var d = new Date(a.appointmentDate);
                return d >= weekStart && d <= weekEnd;
            }).length;
            var completedTotal = appts.filter(function (a) { return a.status === "COMPLETED"; }).length;
            var pending = appts.filter(function (a) { return a.status === "REQUESTED"; }).length;
            return [
                { icon: "📅", label: "RDV aujourd'hui", value: todayCount, trend: 0 },
                { icon: "📆", label: "RDV cette semaine", value: weekCount, trend: 0 },
                { icon: "✅", label: "Consultations total", value: completedTotal, trend: 0 },
                { icon: "⏳", label: "En attente", value: pending, trend: pending > 0 ? pending : 0 },
            ];
        });
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    MedecinDashboardComponent.prototype.ngOnInit = function () { this.loadData(); };
    MedecinDashboardComponent.prototype.ngAfterViewInit = function () {
        // Si loadData a déjà résolu l'URL avant qu'on arrive ici, on génère maintenant
        if (this.pendingQrUrl) {
            this.generateQr(this.pendingQrUrl);
            this.pendingQrUrl = null;
        }
    };
    MedecinDashboardComponent.prototype.loadData = function () {
        var _this = this;
        this.isLoading.set(true);
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c, _d, _e, _f, _g;
            console.log("🔍 medecins/me:", JSON.stringify(res, null, 2));
            // ✅ Structure confirmée : res.data.id OU res.data.data.id
            var medecinData = (_c = (_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) !== null && _b !== void 0 ? _b : res === null || res === void 0 ? void 0 : res.data) !== null && _c !== void 0 ? _c : res;
            if (medecinData)
                _this.medecin.set(medecinData);
            var id = ((_e = (_d = res === null || res === void 0 ? void 0 : res.data) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.id) || ((_f = res === null || res === void 0 ? void 0 : res.data) === null || _f === void 0 ? void 0 : _f.id) || (res === null || res === void 0 ? void 0 : res.id) || null;
            if (!id) {
                _this.isLoading.set(false);
                _this.qrLoading.set(false);
                _this.qrError.set("Identifiant médecin introuvable.");
                return;
            }
            _this.doctorId = id;
            var url = window.location.origin + "/medecin/scan/" + id;
            _this.profileUrl.set(url);
            // Charger les RDV
            _this.http.get("/api/v1/appointments/doctor/" + id)
                .pipe(operators_1.catchError(function () { return rxjs_1.of([]); }))
                .subscribe(function (appts) {
                var _a;
                var list = Array.isArray(appts) ? appts :
                    Array.isArray(appts === null || appts === void 0 ? void 0 : appts.data) ? appts.data :
                        Array.isArray((_a = appts === null || appts === void 0 ? void 0 : appts.data) === null || _a === void 0 ? void 0 : _a.data) ? appts.data.data : [];
                _this.appointments.set(list);
                _this.isLoading.set(false);
            });
            // ✅ Générer le QR — canvas toujours dans le DOM (static: true)
            if ((_g = _this.canvasRef) === null || _g === void 0 ? void 0 : _g.nativeElement) {
                _this.generateQr(url);
            }
            else {
                _this.pendingQrUrl = url;
            }
        });
    };
    // ── QR Generation ────────────────────────────────────────────────────────
    MedecinDashboardComponent.prototype.generateQr = function (url) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var QRCode, canvas, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.qrLoading.set(true);
                        this.qrError.set(null);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("qrcode"); })];
                    case 2:
                        QRCode = (_b.sent())["default"];
                        canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
                        if (!canvas) {
                            this.qrError.set("Canvas introuvable.");
                            this.qrLoading.set(false);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, QRCode.toCanvas(canvas, url, {
                                width: 190,
                                margin: 2,
                                errorCorrectionLevel: "H",
                                color: { dark: "#0f172a", light: "#ffffff" }
                            })];
                    case 3:
                        _b.sent();
                        this.qrLoading.set(false);
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        this.qrError.set("Erreur génération QR. Vérifiez que 'qrcode' est installé.");
                        this.qrLoading.set(false);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ── QR Actions ───────────────────────────────────────────────────────────
    MedecinDashboardComponent.prototype.downloadQr = function () {
        var _a;
        var canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!canvas)
            return;
        var a = document.createElement("a");
        a.download = "qrcode-medecin-" + this.doctorId + ".png";
        a.href = canvas.toDataURL("image/png");
        a.click();
    };
    MedecinDashboardComponent.prototype.copyUrl = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, navigator.clipboard.writeText(this.profileUrl())];
                    case 1:
                        _b.sent();
                        this.copied.set(true);
                        setTimeout(function () { return _this.copied.set(false); }, 2500);
                        return [3 /*break*/, 3];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MedecinDashboardComponent.prototype.printQr = function () {
        var _a, _b, _c, _d, _e;
        var canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!canvas)
            return;
        var data = canvas.toDataURL("image/png");
        var win = window.open("", "_blank");
        if (!win)
            return;
        win.document.write("<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"utf-8\"/>\n      <title>QR Code \u2014 MediConnect</title>\n      <style>body{font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;padding:40px;color:#0f172a}\n      h1{font-size:20px;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:20px}\n      img{width:220px;height:220px;border:1px solid #e2e8f0;border-radius:12px;padding:8px}\n      .url{margin-top:12px;font-size:11px;color:#4f46e5;word-break:break-all;max-width:280px;text-align:center}\n      .note{margin-top:20px;font-size:11px;color:#94a3b8;text-align:center;max-width:280px}</style>\n      </head><body>\n      <h1>\uD83C\uDFE5 MediConnect</h1>\n      <p>Profil M\u00E9decin V\u00E9rifi\u00E9 \u2014 " + ((_c = (_b = this.medecin()) === null || _b === void 0 ? void 0 : _b.firstName) !== null && _c !== void 0 ? _c : '') + " " + ((_e = (_d = this.medecin()) === null || _d === void 0 ? void 0 : _d.lastName) !== null && _e !== void 0 ? _e : '') + "</p>\n      <img src=\"" + data + "\" alt=\"QR Code\"/>\n      <div class=\"url\">" + this.profileUrl() + "</div>\n      <div class=\"note\">Scannez pour acc\u00E9der au profil v\u00E9rifi\u00E9 du m\u00E9decin</div>\n      <script>window.onload=()=>{window.print();window.close();}</script>\n      </body></html>");
        win.document.close();
    };
    // ── Helpers ──────────────────────────────────────────────────────────────
    MedecinDashboardComponent.prototype.getInitials = function () {
        var _a, _b, _c, _d;
        var m = this.medecin();
        if (!m)
            return "M";
        return ("" + ((_b = (_a = m.firstName) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "") + ((_d = (_c = m.lastName) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : "")).toUpperCase();
    };
    MedecinDashboardComponent.prototype.getPatientName = function (a) {
        var p = a.patient;
        if (!p)
            return "Patient";
        var prenom = p.prenom || p.firstName || p.first_name || "";
        var nom = p.nom || p.lastName || p.last_name || "";
        return (prenom + " " + nom).trim() || "Patient";
    };
    MedecinDashboardComponent.prototype.formatTime = function (d) {
        return d ? new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
    };
    MedecinDashboardComponent.prototype.formatShortDate = function (d) {
        if (!d)
            return "";
        return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    };
    MedecinDashboardComponent.prototype.getStatusLabel = function (s) {
        return { CONFIRMED: "Confirmé", REQUESTED: "En attente", CANCELLED: "Annulé", COMPLETED: "Terminé" }[s] || s;
    };
    MedecinDashboardComponent.prototype.getStatusClass = function (s) {
        return { CONFIRMED: "status-confirmed", REQUESTED: "status-pending", CANCELLED: "status-cancelled", COMPLETED: "status-completed" }[s] || "status-pending";
    };
    MedecinDashboardComponent.prototype.today = function () {
        return new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };
    __decorate([
        core_1.ViewChild("qrCanvas", { static: true })
    ], MedecinDashboardComponent.prototype, "canvasRef");
    MedecinDashboardComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-dashboard",
            standalone: true,
            imports: [common_1.CommonModule, router_1.RouterLink],
            template: "\n    <div class=\"dash\">\n\n      <!-- \u2550\u2550 HEADER \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <div class=\"dash-header\">\n        <div class=\"dash-greeting\">\n          <div class=\"greeting-avatar\">{{ getInitials() }}</div>\n          <div>\n            <h1 class=\"dash-title\">\n              Bonjour, {{ medecin()?.firstName ?? 'Docteur' }} \uD83D\uDC4B\n            </h1>\n            <p class=\"dash-sub\">{{ today() }}</p>\n          </div>\n        </div>\n        <div class=\"dash-header-actions\">\n          <a routerLink=\"/medecin/planning\" class=\"btn-primary\">\uD83D\uDCC5 Mon Planning</a>\n        </div>\n      </div>\n\n      <!-- \u2550\u2550 STATS CARDS \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <div class=\"stats-row\">\n        <div class=\"stat-card\" *ngFor=\"let s of stats()\">\n          <div class=\"stat-icon\">{{ s.icon }}</div>\n          <div class=\"stat-body\">\n            <div class=\"stat-val\">{{ s.value }}</div>\n            <div class=\"stat-label\">{{ s.label }}</div>\n          </div>\n          <div class=\"stat-trend\" [class.up]=\"s.trend > 0\" [class.down]=\"s.trend < 0\" *ngIf=\"s.trend !== 0\">\n            {{ s.trend > 0 ? '\u2191' : '\u2193' }} {{ s.trend > 0 ? '+' : '' }}{{ s.trend }}\n          </div>\n        </div>\n      </div>\n\n      <!-- \u2550\u2550 MAIN GRID \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 -->\n      <div class=\"main-grid\">\n\n        <!-- \u2500\u2500 Prochains RDV \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n        <div class=\"card card-appts\">\n          <div class=\"card-head\">\n            <h2>\uD83D\uDCC6 Prochains rendez-vous</h2>\n            <a routerLink=\"/medecin/planning\" class=\"link-more\">Voir tout \u2192</a>\n          </div>\n\n          <div class=\"loading-state\" *ngIf=\"isLoading()\">\n            <div class=\"spinner\"></div>\n          </div>\n\n          <div class=\"appts-list\" *ngIf=\"!isLoading()\">\n            <div class=\"appt-item\" *ngFor=\"let a of upcomingAppointments()\"\n                 [class.appt-confirmed]=\"a.status === 'CONFIRMED'\"\n                 [class.appt-pending]  =\"a.status === 'REQUESTED'\">\n              <div class=\"appt-time\">\n                <div class=\"appt-hour\">{{ formatTime(a.appointmentDate) }}</div>\n                <div class=\"appt-date-sm\">{{ formatShortDate(a.appointmentDate) }}</div>\n              </div>\n              <div class=\"appt-sep\"></div>\n              <div class=\"appt-info\">\n                <div class=\"appt-name\">{{ getPatientName(a) }}</div>\n                <div class=\"appt-meta\">\n                  <span class=\"appt-type-badge\">\n                    {{ a.consultationType === 'TELECONSULTATION' ? '\uD83D\uDCBB T\u00E9l\u00E9consult.' : '\uD83C\uDFE5 Pr\u00E9sentiel' }}\n                  </span>\n                  <span class=\"appt-dur\">{{ a.durationMinutes }} min</span>\n                </div>\n              </div>\n              <div class=\"appt-status-pill\" [ngClass]=\"getStatusClass(a.status)\">\n                {{ getStatusLabel(a.status) }}\n              </div>\n            </div>\n\n            <div class=\"empty-mini\" *ngIf=\"upcomingAppointments().length === 0\">\n              <span>\uD83C\uDF89</span>\n              <p>Aucun RDV \u00E0 venir aujourd'hui</p>\n            </div>\n          </div>\n\n          <div class=\"pending-bar\" *ngIf=\"pendingCount() > 0\">\n            <span>\u23F3 {{ pendingCount() }} demande(s) en attente</span>\n            <a routerLink=\"/medecin/planning\" class=\"link-more\">Traiter \u2192</a>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 QR Code \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n        <div class=\"card card-qr\">\n          <div class=\"card-head\">\n            <h2>\uD83D\uDD16 Mon QR Code</h2>\n          </div>\n\n          <div class=\"qr-section\">\n\n            <!-- \u2705 Le canvas est TOUJOURS dans le DOM, juste cach\u00E9 par CSS -->\n            <!-- Cela permet \u00E0 ViewChild de toujours le trouver -->\n            <div class=\"qr-loading\" [class.hidden]=\"!qrLoading()\">\n              <div class=\"spinner\"></div>\n              <span>G\u00E9n\u00E9ration\u2026</span>\n            </div>\n\n            <div class=\"qr-error\" *ngIf=\"qrError()\">\n              \u26A0\uFE0F {{ qrError() }}\n            </div>\n\n            <!-- Canvas toujours pr\u00E9sent dans le DOM -->\n            <div class=\"qr-canvas-wrap\" [class.hidden]=\"qrLoading() || !!qrError()\">\n              <canvas #qrCanvas></canvas>\n              <div class=\"qr-logo\">\uD83C\uDFE5</div>\n            </div>\n\n            <div class=\"qr-url\" [class.hidden]=\"qrLoading() || !!qrError()\">\n              <span class=\"qr-url-label\">\uD83D\uDD17 Lien de profil</span>\n              <span class=\"qr-url-val\">{{ profileUrl() }}</span>\n            </div>\n\n            <div class=\"qr-actions\" [class.hidden]=\"qrLoading() || !!qrError()\">\n              <button class=\"btn-qr-dl\"    (click)=\"downloadQr()\">\u2B07\uFE0F T\u00E9l\u00E9charger</button>\n              <button class=\"btn-qr-copy\"  (click)=\"copyUrl()\">\n                {{ copied() ? '\u2705 Copi\u00E9 !' : '\uD83D\uDCCB Copier' }}\n              </button>\n              <button class=\"btn-qr-print\" (click)=\"printQr()\">\uD83D\uDDA8\uFE0F Imprimer</button>\n            </div>\n\n            <p class=\"qr-hint\">\n              Affichez ce code dans votre cabinet pour que vos patients v\u00E9rifient votre profil MediConnect.\n            </p>\n          </div>\n        </div>\n\n        <!-- \u2500\u2500 Acc\u00E8s rapides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 -->\n        <div class=\"card card-quick\">\n          <div class=\"card-head\">\n            <h2>\u26A1 Acc\u00E8s rapides</h2>\n          </div>\n          <div class=\"quick-grid\">\n            <a routerLink=\"/medecin/planning\"      class=\"quick-btn\">\n              <span>\uD83D\uDCC5</span><span>Planning</span>\n            </a>\n            <a routerLink=\"/medecin/patients\"      class=\"quick-btn\">\n              <span>\uD83D\uDC65</span><span>Patients</span>\n            </a>\n            <a routerLink=\"/medecin/prescriptions\" class=\"quick-btn\">\n              <span>\uD83D\uDC8A</span><span>Prescriptions</span>\n            </a>\n            <a routerLink=\"/medecin/profil\"        class=\"quick-btn\">\n              <span>\uD83D\uDC68\u200D\u2695\uFE0F</span><span>Mon Profil</span>\n            </a>\n          </div>\n        </div>\n\n      </div>\n    </div>\n  ",
            styles: ["\n    .hidden { display: none !important; }\n\n    /* \u2500\u2500 Page \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .dash { padding: 0; display: flex; flex-direction: column; gap: 24px; }\n\n    /* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .dash-header {\n      display: flex; justify-content: space-between; align-items: center;\n      flex-wrap: wrap; gap: 12px;\n    }\n    .dash-greeting { display: flex; align-items: center; gap: 14px; }\n    .greeting-avatar {\n      width: 52px; height: 52px; border-radius: 50%;\n      background: linear-gradient(135deg, #4f46e5, #7c3aed);\n      color: white; font-size: 18px; font-weight: 700;\n      display: flex; align-items: center; justify-content: center;\n      flex-shrink: 0;\n    }\n    .dash-title  { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 2px; }\n    .dash-sub    { font-size: 13px; color: #94a3b8; margin: 0; }\n    .btn-primary {\n      padding: 10px 20px; background: #4f46e5; color: white;\n      border: none; border-radius: 8px; font-size: 14px; font-weight: 600;\n      cursor: pointer; text-decoration: none; display: inline-block;\n      transition: opacity .15s;\n    }\n    .btn-primary:hover { opacity: .88; }\n\n    /* \u2500\u2500 Stats \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .stats-row {\n      display: grid;\n      grid-template-columns: repeat(4, 1fr);\n      gap: 14px;\n    }\n    .stat-card {\n      background: white; border-radius: 14px;\n      border: 1.5px solid #e2e8f0; padding: 16px 20px;\n      display: flex; align-items: center; gap: 14px;\n      position: relative; overflow: hidden;\n      transition: box-shadow .15s;\n    }\n    .stat-card:hover { box-shadow: 0 4px 20px rgba(79,70,229,.1); }\n    .stat-icon { font-size: 28px; flex-shrink: 0; }\n    .stat-val   { font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1; }\n    .stat-label { font-size: 12px; color: #64748b; margin-top: 3px; }\n    .stat-trend {\n      position: absolute; top: 10px; right: 12px;\n      font-size: 11px; font-weight: 700; padding: 2px 8px;\n      border-radius: 20px;\n    }\n    .stat-trend.up   { background: #f0fdf4; color: #16a34a; }\n    .stat-trend.down { background: #fef2f2; color: #dc2626; }\n\n    /* \u2500\u2500 Main grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .main-grid {\n      display: grid;\n      grid-template-columns: 1fr 320px;\n      grid-template-rows: auto auto;\n      gap: 20px;\n    }\n    .card {\n      background: white; border-radius: 16px;\n      border: 1.5px solid #e2e8f0; overflow: hidden;\n    }\n    .card-appts { grid-row: 1 / 3; }\n    .card-qr    { grid-column: 2; grid-row: 1; }\n    .card-quick { grid-column: 2; grid-row: 2; }\n\n    .card-head {\n      display: flex; justify-content: space-between; align-items: center;\n      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;\n      background: #f8fafc;\n    }\n    .card-head h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0; }\n    .link-more { font-size: 12px; color: #4f46e5; text-decoration: none; font-weight: 600; }\n    .link-more:hover { text-decoration: underline; }\n\n    /* \u2500\u2500 Appointments list \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .loading-state { display: flex; justify-content: center; padding: 40px; }\n    .spinner {\n      width: 32px; height: 32px; border: 3px solid #e2e8f0;\n      border-top-color: #4f46e5; border-radius: 50%;\n      animation: spin .8s linear infinite;\n    }\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    .appts-list { padding: 8px 0; }\n    .appt-item {\n      display: flex; align-items: center; gap: 14px;\n      padding: 12px 20px; border-bottom: 1px solid #f8fafc;\n      transition: background .1s;\n    }\n    .appt-item:hover { background: #fafbff; }\n    .appt-item.appt-confirmed { border-left: 3px solid #16a34a; }\n    .appt-item.appt-pending   { border-left: 3px solid #d97706; }\n\n    .appt-time  { text-align: center; min-width: 48px; }\n    .appt-hour  { font-size: 14px; font-weight: 700; color: #0f172a; }\n    .appt-date-sm { font-size: 10px; color: #94a3b8; margin-top: 2px; }\n    .appt-sep   { width: 1px; height: 36px; background: #e2e8f0; flex-shrink: 0; }\n    .appt-info  { flex: 1; }\n    .appt-name  { font-size: 14px; font-weight: 600; color: #0f172a; }\n    .appt-meta  { display: flex; gap: 8px; margin-top: 3px; align-items: center; }\n    .appt-type-badge {\n      font-size: 11px; color: #64748b;\n      background: #f1f5f9; border-radius: 6px; padding: 2px 8px;\n    }\n    .appt-dur { font-size: 11px; color: #94a3b8; }\n    .appt-status-pill {\n      font-size: 11px; font-weight: 600; padding: 3px 10px;\n      border-radius: 20px; white-space: nowrap; flex-shrink: 0;\n    }\n    .status-confirmed { background: #f0fdf4; color: #16a34a; }\n    .status-pending   { background: #fffbeb; color: #d97706; }\n    .status-cancelled { background: #fef2f2; color: #dc2626; }\n    .status-completed { background: #f8fafc; color: #64748b; }\n\n    .pending-bar {\n      display: flex; justify-content: space-between; align-items: center;\n      padding: 10px 20px; background: #fffbeb;\n      border-top: 1px solid #fde68a;\n      font-size: 13px; font-weight: 600; color: #92400e;\n    }\n\n    .empty-mini {\n      display: flex; flex-direction: column; align-items: center;\n      padding: 40px 20px; gap: 8px; color: #94a3b8; font-size: 13px;\n    }\n    .empty-mini span { font-size: 32px; }\n\n    /* \u2500\u2500 QR Code \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-section {\n      padding: 20px; display: flex; flex-direction: column;\n      align-items: center; gap: 14px;\n    }\n    .qr-loading {\n      display: flex; align-items: center; gap: 10px;\n      color: #64748b; font-size: 13px; padding: 30px 0;\n    }\n    .qr-error {\n      background: #fef2f2; color: #dc2626;\n      border: 1px solid #fecaca; border-radius: 8px;\n      padding: 10px 14px; font-size: 12px; width: 100%; box-sizing: border-box;\n    }\n    .qr-canvas-wrap {\n      position: relative; display: inline-flex;\n      align-items: center; justify-content: center;\n      padding: 10px; background: white;\n      border: 2px solid #e2e8f0; border-radius: 14px;\n      box-shadow: 0 4px 20px rgba(79,70,229,.1);\n    }\n    .qr-canvas-wrap canvas { display: block; border-radius: 6px; }\n    .qr-logo {\n      position: absolute; top: 50%; left: 50%;\n      transform: translate(-50%, -50%);\n      width: 32px; height: 32px; background: white;\n      border-radius: 6px; display: flex; align-items: center;\n      justify-content: center; font-size: 18px;\n      box-shadow: 0 2px 6px rgba(0,0,0,.12);\n      pointer-events: none;\n    }\n    .qr-url {\n      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;\n      padding: 8px 12px; width: 100%; box-sizing: border-box;\n      display: flex; flex-direction: column; gap: 3px;\n    }\n    .qr-url-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .04em; }\n    .qr-url-val   { font-size: 11px; color: #4f46e5; font-weight: 600; word-break: break-all; }\n    .qr-actions   { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }\n    .btn-qr-dl, .btn-qr-copy, .btn-qr-print {\n      padding: 7px 13px; border-radius: 7px;\n      font-size: 12px; font-weight: 600; cursor: pointer;\n      border: none; transition: opacity .15s;\n    }\n    .btn-qr-dl    { background: #4f46e5; color: white; }\n    .btn-qr-copy  { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }\n    .btn-qr-print { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }\n    .btn-qr-dl:hover, .btn-qr-copy:hover, .btn-qr-print:hover { opacity: .82; }\n    .qr-hint {\n      font-size: 11px; color: #94a3b8; text-align: center;\n      line-height: 1.5; margin: 0;\n    }\n\n    /* \u2500\u2500 Quick actions \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .quick-grid {\n      display: grid; grid-template-columns: 1fr 1fr;\n      gap: 10px; padding: 16px;\n    }\n    .quick-btn {\n      display: flex; flex-direction: column; align-items: center;\n      gap: 6px; padding: 16px 8px;\n      background: #f8fafc; border: 1.5px solid #e2e8f0;\n      border-radius: 10px; text-decoration: none;\n      font-size: 12px; font-weight: 600; color: #334155;\n      transition: all .15s; cursor: pointer;\n    }\n    .quick-btn span:first-child { font-size: 22px; }\n    .quick-btn:hover { border-color: #4f46e5; color: #4f46e5; background: #eef2ff; }\n\n    /* \u2500\u2500 Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    @media (max-width: 1024px) {\n      .stats-row { grid-template-columns: repeat(2, 1fr); }\n      .main-grid { grid-template-columns: 1fr; }\n      .card-appts { grid-row: auto; }\n      .card-qr    { grid-column: 1; grid-row: auto; }\n      .card-quick { grid-column: 1; grid-row: auto; }\n    }\n    @media (max-width: 600px) {\n      .stats-row { grid-template-columns: 1fr 1fr; }\n    }\n  "]
        })
    ], MedecinDashboardComponent);
    return MedecinDashboardComponent;
}());
exports.MedecinDashboardComponent = MedecinDashboardComponent;
