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
exports.MedecinQrcodeComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var http_1 = require("@angular/common/http");
var operators_1 = require("rxjs/operators");
var rxjs_1 = require("rxjs");
/**
 * MedecinQrcodeComponent
 * ─────────────────────────────────────────────────────────────
 * Affiche un QR code pour le médecin connecté.
 * Le QR code encode l'URL publique de son profil :
 *   https://<domaine>/medecin/scan/<doctorId>
 *
 * Usage dans medecin-profile.component.ts :
 *   <app-medecin-qrcode />
 *
 * Dépendances :
 *   npm install qrcode   (types inclus dans @types/qrcode)
 *   npm install @types/qrcode --save-dev
 *
 * Le package QRCode est chargé dynamiquement (import()) pour
 * éviter d'alourdir le bundle si la page profil n'est pas visitée.
 * ─────────────────────────────────────────────────────────────
 */
var MedecinQrcodeComponent = /** @class */ (function () {
    function MedecinQrcodeComponent() {
        this.http = core_1.inject(http_1.HttpClient);
        this.isLoading = core_1.signal(true);
        this.errorMsg = core_1.signal(null);
        this.profileUrl = core_1.signal("");
        this.copied = core_1.signal(false);
        this.resolvedId = null;
    }
    // ── Lifecycle ──────────────────────────────────────────────────────────────
    MedecinQrcodeComponent.prototype.ngOnInit = function () {
        if (this.doctorId) {
            this.resolvedId = this.doctorId;
            this.profileUrl.set(this.buildUrl(this.doctorId));
            // Le canvas n'est pas encore disponible ici, on génère dans ngAfterViewInit
        }
        else {
            this.fetchDoctorId();
        }
    };
    MedecinQrcodeComponent.prototype.ngAfterViewInit = function () {
        // Si l'ID était déjà connu (passé en @Input), on peut dessiner maintenant
        if (this.resolvedId) {
            this.generateQr(this.profileUrl());
        }
    };
    // ── Fetch ID depuis /api/v1/medecins/me ────────────────────────────────────
    MedecinQrcodeComponent.prototype.fetchDoctorId = function () {
        var _this = this;
        this.http.get("/api/v1/medecins/me")
            .pipe(operators_1.catchError(function () { return rxjs_1.of(null); }))
            .subscribe(function (res) {
            var _a, _b, _c, _d, _e, _f;
            var id = ((_b = (_a = res === null || res === void 0 ? void 0 : res.data) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.id) || ((_d = (_c = res === null || res === void 0 ? void 0 : res.data) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.userId) || ((_e = res === null || res === void 0 ? void 0 : res.data) === null || _e === void 0 ? void 0 : _e.userId) || ((_f = res === null || res === void 0 ? void 0 : res.data) === null || _f === void 0 ? void 0 : _f.id) || (res === null || res === void 0 ? void 0 : res.userId) || (res === null || res === void 0 ? void 0 : res.id) ||
                null;
            if (!id) {
                _this.errorMsg.set("Impossible de récupérer votre identifiant médecin.");
                _this.isLoading.set(false);
                return;
            }
            _this.resolvedId = id;
            var url = _this.buildUrl(id);
            _this.profileUrl.set(url);
            _this.generateQr(url);
        });
    };
    // ── Génère le QR code dans le canvas ──────────────────────────────────────
    MedecinQrcodeComponent.prototype.generateQr = function (url) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var QRCode, canvas, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.isLoading.set(true);
                        this.errorMsg.set(null);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return require("qrcode"); })];
                    case 2:
                        QRCode = (_b.sent())["default"];
                        // Petit délai pour que le canvas soit dans le DOM après le signal update
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 50); })];
                    case 3:
                        // Petit délai pour que le canvas soit dans le DOM après le signal update
                        _b.sent();
                        canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
                        if (!canvas) {
                            this.errorMsg.set("Canvas introuvable.");
                            this.isLoading.set(false);
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, QRCode.toCanvas(canvas, url, {
                                width: 220,
                                margin: 2,
                                errorCorrectionLevel: "H",
                                color: {
                                    dark: "#0f172a",
                                    light: "#ffffff"
                                }
                            })];
                    case 4:
                        _b.sent();
                        this.isLoading.set(false);
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _b.sent();
                        console.error("[QRCode] Erreur génération :", err_1);
                        this.errorMsg.set("Erreur lors de la génération du QR code. Vérifiez que le package 'qrcode' est installé.");
                        this.isLoading.set(false);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // ── Téléchargement PNG ─────────────────────────────────────────────────────
    MedecinQrcodeComponent.prototype.downloadQr = function () {
        var _a, _b;
        var canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!canvas)
            return;
        var link = document.createElement("a");
        link.download = "qrcode-medecin-" + ((_b = this.resolvedId) !== null && _b !== void 0 ? _b : "profil") + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
    };
    // ── Copier l'URL ───────────────────────────────────────────────────────────
    MedecinQrcodeComponent.prototype.copyUrl = function () {
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
                        this.errorMsg.set("Impossible d'accéder au presse-papiers.");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ── Impression ─────────────────────────────────────────────────────────────
    MedecinQrcodeComponent.prototype.printQr = function () {
        var _a;
        var canvas = (_a = this.canvasRef) === null || _a === void 0 ? void 0 : _a.nativeElement;
        if (!canvas)
            return;
        var dataUrl = canvas.toDataURL("image/png");
        var win = window.open("", "_blank");
        if (!win)
            return;
        win.document.write("\n      <!DOCTYPE html>\n      <html lang=\"fr\">\n      <head>\n        <meta charset=\"utf-8\" />\n        <title>QR Code M\u00E9decin \u2014 MediConnect</title>\n        <style>\n          body {\n            font-family: system-ui, sans-serif;\n            display: flex;\n            flex-direction: column;\n            align-items: center;\n            padding: 40px;\n            color: #0f172a;\n          }\n          h1 { font-size: 22px; margin-bottom: 4px; }\n          p  { color: #64748b; font-size: 13px; margin-bottom: 24px; }\n          img { width: 240px; height: 240px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; }\n          .url { margin-top: 16px; font-size: 12px; color: #4f46e5; word-break: break-all; max-width: 300px; text-align: center; }\n          .note { margin-top: 24px; font-size: 11px; color: #94a3b8; text-align: center; max-width: 300px; }\n        </style>\n      </head>\n      <body>\n        <h1>\uD83C\uDFE5 MediConnect</h1>\n        <p>Profil M\u00E9decin V\u00E9rifi\u00E9</p>\n        <img src=\"" + dataUrl + "\" alt=\"QR Code\" />\n        <div class=\"url\">" + this.profileUrl() + "</div>\n        <div class=\"note\">Scannez ce QR code pour acc\u00E9der au profil v\u00E9rifi\u00E9 du m\u00E9decin</div>\n        <script>window.onload = () => { window.print(); window.close(); }</script>\n      </body>\n      </html>\n    ");
        win.document.close();
    };
    // ── Helper URL ─────────────────────────────────────────────────────────────
    MedecinQrcodeComponent.prototype.buildUrl = function (id) {
        // En production, remplacez window.location.origin par votre domaine fixe
        return window.location.origin + "/medecin/scan/" + id;
    };
    __decorate([
        core_1.ViewChild("qrCanvas")
    ], MedecinQrcodeComponent.prototype, "canvasRef");
    __decorate([
        core_1.Input()
    ], MedecinQrcodeComponent.prototype, "doctorId");
    MedecinQrcodeComponent = __decorate([
        core_1.Component({
            selector: "app-medecin-qrcode",
            standalone: true,
            imports: [common_1.CommonModule],
            template: "\n    <div class=\"qr-wrapper\">\n\n      <!-- \u2500\u2500 En-t\u00EAte \u2500\u2500 -->\n      <div class=\"qr-header\">\n        <div class=\"qr-icon\">\uD83D\uDD16</div>\n        <div>\n          <h3 class=\"qr-title\">Mon QR Code Profil</h3>\n          <p class=\"qr-subtitle\">\n            Partagez ce code pour que vos patients puissent v\u00E9rifier votre identit\u00E9 m\u00E9dicale\n          </p>\n        </div>\n      </div>\n\n      <!-- \u2500\u2500 Chargement \u2500\u2500 -->\n      <div class=\"qr-loading\" *ngIf=\"isLoading()\">\n        <div class=\"spinner\"></div>\n        <span>G\u00E9n\u00E9ration en cours\u2026</span>\n      </div>\n\n      <!-- \u2500\u2500 Erreur \u2500\u2500 -->\n      <div class=\"qr-error\" *ngIf=\"!isLoading() && errorMsg()\">\n        \u26A0\uFE0F {{ errorMsg() }}\n      </div>\n\n      <!-- \u2500\u2500 QR Code \u2500\u2500 -->\n      <div class=\"qr-body\" *ngIf=\"!isLoading() && !errorMsg()\">\n\n        <!-- Canvas QR -->\n        <div class=\"qr-canvas-wrap\">\n          <canvas #qrCanvas class=\"qr-canvas\"></canvas>\n          <!-- Logo centr\u00E9 par-dessus le canvas -->\n          <div class=\"qr-logo-overlay\">\uD83C\uDFE5</div>\n        </div>\n\n        <!-- URL encod\u00E9e -->\n        <div class=\"qr-url-box\">\n          <span class=\"qr-url-label\">\uD83D\uDD17 Lien de profil</span>\n          <span class=\"qr-url-text\">{{ profileUrl() }}</span>\n        </div>\n\n        <!-- Actions -->\n        <div class=\"qr-actions\">\n          <button class=\"btn-download\" (click)=\"downloadQr()\">\n            \u2B07\uFE0F T\u00E9l\u00E9charger PNG\n          </button>\n          <button class=\"btn-copy\" (click)=\"copyUrl()\">\n            {{ copied() ? \"\u2705 Copi\u00E9 !\" : \"\uD83D\uDCCB Copier le lien\" }}\n          </button>\n          <button class=\"btn-print\" (click)=\"printQr()\">\n            \uD83D\uDDA8\uFE0F Imprimer\n          </button>\n        </div>\n\n        <!-- Message copi\u00E9 -->\n        <div class=\"copy-toast\" *ngIf=\"copied()\">\n          \u2705 Lien copi\u00E9 dans le presse-papiers !\n        </div>\n\n      </div>\n\n      <!-- \u2500\u2500 Note informative \u2500\u2500 -->\n      <div class=\"qr-note\" *ngIf=\"!isLoading() && !errorMsg()\">\n        <strong>\uD83D\uDCA1 Conseil :</strong> Imprimez ce QR code et affichez-le dans votre cabinet.\n        Vos patients pourront scanner le code pour v\u00E9rifier instantan\u00E9ment vos informations.\n      </div>\n\n    </div>\n  ",
            styles: ["\n    /* \u2500\u2500 Wrapper \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-wrapper {\n      background: white;\n      border-radius: 16px;\n      padding: 24px;\n      box-shadow: 0 2px 16px rgba(0,0,0,.06);\n      display: flex;\n      flex-direction: column;\n      gap: 20px;\n    }\n\n    /* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-header {\n      display: flex;\n      align-items: flex-start;\n      gap: 14px;\n    }\n    .qr-icon {\n      font-size: 28px;\n      line-height: 1;\n      flex-shrink: 0;\n    }\n    .qr-title {\n      font-size: 16px;\n      font-weight: 700;\n      color: #0f172a;\n      margin: 0 0 4px;\n    }\n    .qr-subtitle {\n      font-size: 13px;\n      color: #64748b;\n      margin: 0;\n      line-height: 1.5;\n    }\n\n    /* \u2500\u2500 Loading \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-loading {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n      color: #64748b;\n      font-size: 14px;\n      justify-content: center;\n      padding: 24px 0;\n    }\n    .spinner {\n      width: 28px;\n      height: 28px;\n      border: 3px solid #e2e8f0;\n      border-top-color: #4f46e5;\n      border-radius: 50%;\n      animation: spin .8s linear infinite;\n    }\n    @keyframes spin { to { transform: rotate(360deg); } }\n\n    /* \u2500\u2500 Error \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-error {\n      background: #fef2f2;\n      color: #dc2626;\n      border: 1px solid #fecaca;\n      border-radius: 10px;\n      padding: 12px 16px;\n      font-size: 13px;\n    }\n\n    /* \u2500\u2500 QR Body \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-body {\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 16px;\n    }\n\n    /* Canvas wrapper avec logo centr\u00E9 */\n    .qr-canvas-wrap {\n      position: relative;\n      display: inline-flex;\n      align-items: center;\n      justify-content: center;\n      padding: 12px;\n      background: white;\n      border: 2px solid #e2e8f0;\n      border-radius: 16px;\n      box-shadow: 0 4px 20px rgba(79,70,229,.1);\n    }\n    .qr-canvas {\n      display: block;\n      border-radius: 8px;\n    }\n    .qr-logo-overlay {\n      position: absolute;\n      top: 50%;\n      left: 50%;\n      transform: translate(-50%, -50%);\n      width: 36px;\n      height: 36px;\n      background: white;\n      border-radius: 8px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      font-size: 20px;\n      box-shadow: 0 2px 8px rgba(0,0,0,.12);\n      pointer-events: none;\n    }\n\n    /* URL box */\n    .qr-url-box {\n      background: #f8fafc;\n      border: 1px solid #e2e8f0;\n      border-radius: 10px;\n      padding: 10px 14px;\n      display: flex;\n      flex-direction: column;\n      gap: 4px;\n      width: 100%;\n      max-width: 380px;\n      box-sizing: border-box;\n    }\n    .qr-url-label {\n      font-size: 11px;\n      font-weight: 600;\n      color: #94a3b8;\n      text-transform: uppercase;\n      letter-spacing: .04em;\n    }\n    .qr-url-text {\n      font-size: 12px;\n      color: #4f46e5;\n      font-weight: 600;\n      word-break: break-all;\n    }\n\n    /* Actions */\n    .qr-actions {\n      display: flex;\n      gap: 8px;\n      flex-wrap: wrap;\n      justify-content: center;\n    }\n    .btn-download,\n    .btn-copy,\n    .btn-print {\n      padding: 8px 16px;\n      border-radius: 8px;\n      font-size: 13px;\n      font-weight: 600;\n      cursor: pointer;\n      border: none;\n      transition: opacity .15s, transform .1s;\n    }\n    .btn-download,\n    .btn-copy,\n    .btn-print {\n      &:hover { opacity: .85; transform: translateY(-1px); }\n      &:active { transform: translateY(0); }\n    }\n    .btn-download { background: #4f46e5; color: white; }\n    .btn-copy     { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }\n    .btn-print    { background: #f1f5f9; color: #475569; border: 1.5px solid #e2e8f0; }\n\n    /* Toast copi\u00E9 */\n    .copy-toast {\n      background: #f0fdf4;\n      color: #16a34a;\n      border: 1px solid #bbf7d0;\n      border-radius: 8px;\n      padding: 8px 14px;\n      font-size: 13px;\n      font-weight: 600;\n      animation: fadeIn .2s ease;\n    }\n    @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }\n\n    /* \u2500\u2500 Note \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */\n    .qr-note {\n      background: #fffbeb;\n      border: 1px solid #fde68a;\n      border-radius: 10px;\n      padding: 12px 14px;\n      font-size: 13px;\n      color: #92400e;\n      line-height: 1.6;\n    }\n  "]
        })
    ], MedecinQrcodeComponent);
    return MedecinQrcodeComponent;
}());
exports.MedecinQrcodeComponent = MedecinQrcodeComponent;
