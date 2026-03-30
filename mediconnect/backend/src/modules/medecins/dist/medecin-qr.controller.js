"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.MedecinQrController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var typeorm_1 = require("@nestjs/typeorm");
var user_entity_1 = require("../users/entities/user.entity");
var PDFDocument = require("pdfkit");
var MedecinQrController = /** @class */ (function () {
    function MedecinQrController(qrCodeService, userRepository) {
        this.qrCodeService = qrCodeService;
        this.userRepository = userRepository;
    }
    // ✅ PUBLIC — sans authentification — scan de la carte médecin
    MedecinQrController.prototype.getPublicMedecinInfo = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, parts, medecinId, userId, signature, verify, medecin, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        decoded = Buffer.from(token, "base64url").toString("utf-8");
                        parts = decoded.split(":");
                        if (parts.length < 3)
                            return [2 /*return*/, { valid: false }];
                        medecinId = parts[0], userId = parts[1], signature = parts[2];
                        verify = this.qrCodeService.verifyQrCode("MEDICONNECT:MED:" + medecinId + ":" + userId + ":" + signature);
                        if (!verify.valid)
                            return [2 /*return*/, { valid: false, message: "QR code invalide" }];
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: { id: medecinId }
                            })];
                    case 1:
                        medecin = _b.sent();
                        if (!medecin)
                            return [2 /*return*/, { valid: false, message: "Médecin introuvable" }];
                        return [2 /*return*/, {
                                valid: true,
                                medecin: {
                                    nom: medecin.lastName,
                                    prenom: medecin.firstName,
                                    email: medecin.email,
                                    telephone: medecin.phone,
                                    role: medecin.role
                                }
                            }];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, { valid: false, message: "Token invalide" }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 🔒 PROTÉGÉ — nécessite JWT — obtenir son propre QR code
    MedecinQrController.prototype.getQrCode = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, medecin, qrData, qrImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.user.id;
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                    case 1:
                        medecin = _a.sent();
                        if (!medecin)
                            return [2 /*return*/, { error: "Médecin introuvable" }];
                        qrData = this.qrCodeService.generateQrData(userId, userId);
                        return [4 /*yield*/, this.qrCodeService.generateQrImage(qrData)];
                    case 2:
                        qrImage = _a.sent();
                        return [2 /*return*/, {
                                qrData: qrData,
                                qrImage: qrImage,
                                medecinId: userId,
                                displayId: "QR-MED-" + userId.substring(0, 8).toUpperCase()
                            }];
                }
            });
        });
    };
    // 🔒 PROTÉGÉ — télécharger la carte médecin en PDF
    MedecinQrController.prototype.downloadQrPdf = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, medecin, qrData, qrImage, doc, base64Data, qrBuffer, pageWidth, qrX;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.user.id;
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                    case 1:
                        medecin = _a.sent();
                        if (!medecin) {
                            res.status(404).json({ error: "Médecin introuvable" });
                            return [2 /*return*/];
                        }
                        qrData = this.qrCodeService.generateQrData(userId, userId);
                        return [4 /*yield*/, this.qrCodeService.generateQrImage(qrData)];
                    case 2:
                        qrImage = _a.sent();
                        doc = new PDFDocument({ size: "A5", margin: 40 });
                        res.setHeader("Content-Type", "application/pdf");
                        res.setHeader("Content-Disposition", "attachment; filename=\"mediconnect-medecin-" + userId.substring(0, 8) + ".pdf\"");
                        doc.pipe(res);
                        // ── En-tête ──────────────────────────────────────────────
                        doc.rect(0, 0, doc.page.width, 80).fill("#0f172a");
                        doc.fillColor("white").fontSize(20).font("Helvetica-Bold")
                            .text("MediConnect", 40, 20);
                        doc.fillColor("#94a3b8").fontSize(10).font("Helvetica")
                            .text("Carte d'identification médecin", 40, 48);
                        // ── Infos médecin ─────────────────────────────────────────
                        doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold")
                            .text("Dr. " + medecin.firstName + " " + medecin.lastName, 40, 100);
                        doc.fillColor("#64748b").fontSize(10).font("Helvetica")
                            .text("R\u00F4le : " + medecin.role, 40, 122)
                            .text("Email : " + medecin.email, 40, 138)
                            .text("ID : QR-MED-" + userId.substring(0, 8).toUpperCase(), 40, 154);
                        base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
                        qrBuffer = Buffer.from(base64Data, "base64");
                        pageWidth = doc.page.width;
                        qrX = (pageWidth - 180) / 2;
                        doc.image(qrBuffer, qrX, 175, { width: 180, height: 180 });
                        // ── Sous-titre ────────────────────────────────────────────
                        doc.fillColor("#64748b").fontSize(9).font("Helvetica")
                            .text("Présentez ce QR code pour identifier votre identité professionnelle", 40, 365, { align: "center", width: pageWidth - 80 });
                        // ── Pied de page ──────────────────────────────────────────
                        doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill("#f8fafc");
                        doc.fillColor("#94a3b8").fontSize(8)
                            .text("G\u00E9n\u00E9r\u00E9 le " + new Date().toLocaleDateString("fr-FR") + " \u00B7 mediconnect.tn", 40, doc.page.height - 25, { align: "center", width: pageWidth - 80 });
                        doc.end();
                        return [2 /*return*/];
                }
            });
        });
    };
    __decorate([
        common_1.Get("public/:token"),
        swagger_1.ApiOperation({ summary: "Page publique QR code médecin" }),
        __param(0, common_1.Param("token"))
    ], MedecinQrController.prototype, "getPublicMedecinInfo");
    __decorate([
        common_1.Get(),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "Obtenir le QR code médecin" }),
        __param(0, common_1.Request())
    ], MedecinQrController.prototype, "getQrCode");
    __decorate([
        common_1.Get("pdf"),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "Télécharger la carte médecin en PDF" }),
        __param(0, common_1.Request()), __param(1, common_1.Res())
    ], MedecinQrController.prototype, "downloadQrPdf");
    MedecinQrController = __decorate([
        swagger_1.ApiTags("medecin-qr"),
        common_1.Controller("medecin/qr"),
        __param(1, typeorm_1.InjectRepository(user_entity_1.User))
    ], MedecinQrController);
    return MedecinQrController;
}());
exports.MedecinQrController = MedecinQrController;
