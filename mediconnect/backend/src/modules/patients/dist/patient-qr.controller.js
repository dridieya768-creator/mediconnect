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
exports.PatientQrController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var typeorm_1 = require("@nestjs/typeorm");
var patient_entity_1 = require("./entities/patient.entity");
var PDFDocument = require("pdfkit");
var PatientQrController = /** @class */ (function () {
    function PatientQrController(qrCodeService, patientRepository) {
        this.qrCodeService = qrCodeService;
        this.patientRepository = patientRepository;
    }
    PatientQrController.prototype.getPublicPatientInfo = function (token) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var decoded, parts, patientId, userId, signature, verify, patient, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 2, , 3]);
                        decoded = Buffer.from(token, "base64url").toString("utf-8");
                        parts = decoded.split(":");
                        if (parts.length < 3)
                            return [2 /*return*/, { valid: false }];
                        patientId = parts[0], userId = parts[1], signature = parts[2];
                        verify = this.qrCodeService.verifyQrCode("MEDICONNECT:PAT:" + patientId + ":" + userId + ":" + signature);
                        if (!verify.valid)
                            return [2 /*return*/, { valid: false, message: "QR code invalide" }];
                        return [4 /*yield*/, this.patientRepository.findOne({
                                where: { id: patientId },
                                relations: ["user"]
                            })];
                    case 1:
                        patient = _h.sent();
                        if (!patient)
                            return [2 /*return*/, { valid: false, message: "Patient introuvable" }];
                        return [2 /*return*/, {
                                valid: true,
                                patient: {
                                    nom: (_b = (_a = patient.user) === null || _a === void 0 ? void 0 : _a.lastName) !== null && _b !== void 0 ? _b : '',
                                    prenom: (_d = (_c = patient.user) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '',
                                    dateNaissance: patient.dateNaissance,
                                    sexe: patient.sexe,
                                    telephone: (_f = (_e = patient.user) === null || _e === void 0 ? void 0 : _e.phone) !== null && _f !== void 0 ? _f : '',
                                    groupeSanguin: patient.groupeSanguin,
                                    allergies: patient.allergies,
                                    maladiesChroniques: patient.maladiesChroniques
                                }
                            }];
                    case 2:
                        _g = _h.sent();
                        return [2 /*return*/, { valid: false, message: "Token invalide" }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PatientQrController.prototype.getQrCode = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, patient, qrData, qrImage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = req.user.id;
                        return [4 /*yield*/, this.patientRepository.findOne({ where: { userId: userId } })];
                    case 1:
                        patient = _a.sent();
                        if (!patient)
                            return [2 /*return*/, { error: "Profil patient non trouvé" }];
                        qrData = this.qrCodeService.generateQrData(patient.id, userId);
                        return [4 /*yield*/, this.qrCodeService.generateQrImage(qrData)];
                    case 2:
                        qrImage = _a.sent();
                        return [2 /*return*/, {
                                qrData: qrData,
                                qrImage: qrImage,
                                patientId: patient.id,
                                displayId: "QR-PAT-" + patient.id.substring(0, 8).toUpperCase()
                            }];
                }
            });
        });
    };
    PatientQrController.prototype.downloadQrPdf = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, patient, qrData, qrImage, doc, firstName, lastName, base64Data, qrBuffer, pageWidth, qrX;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        userId = req.user.id;
                        return [4 /*yield*/, this.patientRepository.findOne({
                                where: { userId: userId },
                                relations: ["user"]
                            })];
                    case 1:
                        patient = _c.sent();
                        if (!patient) {
                            res.status(404).json({ error: "Profil patient non trouvé" });
                            return [2 /*return*/];
                        }
                        qrData = this.qrCodeService.generateQrData(patient.id, userId);
                        return [4 /*yield*/, this.qrCodeService.generateQrImage(qrData)];
                    case 2:
                        qrImage = _c.sent();
                        doc = new PDFDocument({ size: "A5", margin: 40 });
                        res.setHeader("Content-Type", "application/pdf");
                        res.setHeader("Content-Disposition", "attachment; filename=\"mediconnect-qr-" + patient.id.substring(0, 8) + ".pdf\"");
                        doc.pipe(res);
                        doc.rect(0, 0, doc.page.width, 80).fill("#0f172a");
                        doc.fillColor("white").fontSize(20).font("Helvetica-Bold").text("MediConnect", 40, 20);
                        doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Carte d'identification patient", 40, 48);
                        firstName = ((_a = patient.user) === null || _a === void 0 ? void 0 : _a.firstName) || "Patient";
                        lastName = ((_b = patient.user) === null || _b === void 0 ? void 0 : _b.lastName) || "";
                        doc.fillColor("#0f172a").fontSize(16).font("Helvetica-Bold").text(firstName + " " + lastName, 40, 100);
                        doc.fillColor("#64748b").fontSize(10).font("Helvetica").text("ID: QR-PAT-" + patient.id.substring(0, 8).toUpperCase(), 40, 122);
                        base64Data = qrImage.replace(/^data:image\/png;base64,/, "");
                        qrBuffer = Buffer.from(base64Data, "base64");
                        pageWidth = doc.page.width;
                        qrX = (pageWidth - 180) / 2;
                        doc.image(qrBuffer, qrX, 150, { width: 180, height: 180 });
                        doc.fillColor("#64748b").fontSize(9).font("Helvetica")
                            .text("Présentez ce QR code lors de vos consultations", 40, 345, { align: "center", width: pageWidth - 80 });
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
        swagger_1.ApiOperation({ summary: "Page publique QR code patient" }),
        __param(0, common_1.Param("token"))
    ], PatientQrController.prototype, "getPublicPatientInfo");
    __decorate([
        common_1.Get(),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "US6 - Obtenir le QR code patient" }),
        __param(0, common_1.Request())
    ], PatientQrController.prototype, "getQrCode");
    __decorate([
        common_1.Get("pdf"),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "US7 - Télécharger QR code en PDF" }),
        __param(0, common_1.Request()), __param(1, common_1.Res())
    ], PatientQrController.prototype, "downloadQrPdf");
    PatientQrController = __decorate([
        swagger_1.ApiTags("patient-qr"),
        common_1.Controller("patient/qr"),
        __param(1, typeorm_1.InjectRepository(patient_entity_1.Patient))
    ], PatientQrController);
    return PatientQrController;
}());
exports.PatientQrController = PatientQrController;
