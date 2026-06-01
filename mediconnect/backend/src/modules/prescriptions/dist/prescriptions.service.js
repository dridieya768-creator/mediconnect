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
exports.PrescriptionsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var prescription_entity_1 = require("./entities/prescription.entity");
var fs_1 = require("fs");
var path_1 = require("path");
var crypto = require("crypto");
var PrescriptionsService = /** @class */ (function () {
    function PrescriptionsService(repo, dataSource, qrCodesService, interactionChecker, pdfService, emailService) {
        this.repo = repo;
        this.dataSource = dataSource;
        this.qrCodesService = qrCodesService;
        this.interactionChecker = interactionChecker;
        this.pdfService = pdfService;
        this.emailService = emailService;
    }
    PrescriptionsService.prototype.onModuleInit = function () {
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.dataSource.query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS signature_image TEXT;")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dataSource.query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS imaging_requests JSONB;")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.dataSource.query("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS analysis_requests JSONB;")];
                    case 3:
                        _a.sent();
                        console.log('[PrescriptionsService] Migrations OK');
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        console.warn('[PrescriptionsService] Migration warning:', err_1 === null || err_1 === void 0 ? void 0 : err_1.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    PrescriptionsService.prototype.regeneratePdf = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var prescription, pdfBuffer, dir, pdfUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        prescription = _a.sent();
                        return [4 /*yield*/, this.pdfService.generatePrescriptionPdf(prescription, 'Médecin', 'Patient')];
                    case 2:
                        pdfBuffer = _a.sent();
                        dir = path_1.join(process.cwd(), 'uploads', 'prescriptions');
                        if (!fs_1.existsSync(dir))
                            fs_1.mkdirSync(dir, { recursive: true });
                        fs_1.writeFileSync(path_1.join(dir, "prescription-" + id + ".pdf"), pdfBuffer);
                        pdfUrl = "/uploads/prescriptions/prescription-" + id + ".pdf";
                        return [4 /*yield*/, this.repo.update(id, { pdfUrl: pdfUrl })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { message: 'PDF régénéré', url: pdfUrl }];
                }
            });
        });
    };
    /////HMAC-SHA256 basée sur les données de l'ordonnance et un PIN secret
    PrescriptionsService.prototype.generateElectronicSignature = function (prescriptionId, doctorId, patientId, medications, pin, issuedAt) {
        var payload = JSON.stringify({
            prescriptionId: prescriptionId,
            doctorId: doctorId,
            patientId: patientId,
            medicationsHash: crypto
                .createHash("sha256")
                .update(JSON.stringify(medications))
                .digest("hex"),
            issuedAt: issuedAt.toISOString()
        });
        var secretKey = process.env.SIGNATURE_SECRET || "mediconnect-pfe-2026-secret-key";
        var signingKey = crypto
            .createHmac("sha256", secretKey)
            .update(pin + ":" + doctorId)
            .digest("hex");
        var signature = crypto
            .createHmac("sha256", signingKey)
            .update(payload)
            .digest("hex");
        return "HMAC-SHA256:" + signature.toUpperCase();
    };
    PrescriptionsService.prototype.verifySignature = function (prescription, pin) {
        if (!prescription.electronicSignature)
            return false;
        var expected = this.generateElectronicSignature(prescription.id, prescription.doctorId, prescription.patientId, prescription.medications, pin, prescription.issuedAt);
        return prescription.electronicSignature === expected;
    };
    PrescriptionsService.prototype.checkInteractions = function (medications) {
        return this.interactionChecker.checkInteractions(medications);
    };
    PrescriptionsService.prototype.create = function (dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, Promise, function () {
            var now, expiresAt, patientId, patientRow, tempCode, entity, saved, qrCode, realSignature, prescription, pdfBuffer, uploadsDir, filename, pdfUrl, pdfErr_1, qrErr_1, auditErr_1, err_2;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _o.trys.push([0, 18, , 19]);
                        now = new Date();
                        expiresAt = new Date(now);
                        expiresAt.setDate(expiresAt.getDate() + 90);
                        patientId = dto.patientId;
                        return [4 /*yield*/, this.dataSource.query("SELECT id FROM patients WHERE id = $1 OR user_id = $1 LIMIT 1", [patientId])];
                    case 1:
                        patientRow = _o.sent();
                        if ((patientRow === null || patientRow === void 0 ? void 0 : patientRow.length) > 0) {
                            patientId = patientRow[0].id;
                        }
                        else {
                            throw new Error("Patient introuvable pour l'ID: " + patientId);
                        }
                        tempCode = "PENDING-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6).toUpperCase();
                        entity = this.repo.create({
                            patientId: patientId,
                            doctorId: dto.doctorId,
                            medications: (_a = dto.medications) !== null && _a !== void 0 ? _a : [],
                            appointmentId: dto.appointmentId,
                            notes: dto.notes,
                            issuedAt: now,
                            expiresAt: expiresAt,
                            status: prescription_entity_1.PrescriptionStatus.ACTIVE,
                            qrCode: tempCode,
                            qrJwt: '',
                            signedAt: dto.pin ? now : undefined,
                            electronicSignature: dto.pin
                                ? this.generateElectronicSignature('PENDING', dto.doctorId, dto.patientId, (_b = dto.medications) !== null && _b !== void 0 ? _b : [], dto.pin, now)
                                : undefined,
                            signatureImage: dto.signatureImage || undefined,
                            imagingRequests: ((_c = dto.imagingRequests) === null || _c === void 0 ? void 0 : _c.length) ? dto.imagingRequests : undefined,
                            analysisRequests: ((_d = dto.analysisRequests) === null || _d === void 0 ? void 0 : _d.length) ? dto.analysisRequests : undefined
                        });
                        return [4 /*yield*/, this.repo.save(entity)];
                    case 2:
                        saved = (_o.sent());
                        _o.label = 3;
                    case 3:
                        _o.trys.push([3, 13, , 14]);
                        return [4 /*yield*/, this.qrCodesService.generateOrdonnanceQr(saved.id, {
                                patientId: patientId !== null && patientId !== void 0 ? patientId : '',
                                patientName: (_e = dto.patientName) !== null && _e !== void 0 ? _e : '',
                                patientNss: (_f = dto.patientNss) !== null && _f !== void 0 ? _f : '',
                                medecinRpps: (_g = dto.medecinRpps) !== null && _g !== void 0 ? _g : '',
                                medecinName: (_h = dto.medecinName) !== null && _h !== void 0 ? _h : ''
                            })];
                    case 4:
                        qrCode = _o.sent();
                        return [4 /*yield*/, this.repo.update(saved.id, { qrCode: qrCode })];
                    case 5:
                        _o.sent();
                        if (!dto.pin) return [3 /*break*/, 7];
                        realSignature = this.generateElectronicSignature(saved.id, dto.doctorId, dto.patientId, (_j = dto.medications) !== null && _j !== void 0 ? _j : [], dto.pin, now);
                        return [4 /*yield*/, this.repo.update(saved.id, {
                                electronicSignature: realSignature,
                                signatureImage: dto.signatureImage || undefined
                            })];
                    case 6:
                        _o.sent();
                        _o.label = 7;
                    case 7:
                        _o.trys.push([7, 11, , 12]);
                        return [4 /*yield*/, this.findOne(saved.id)];
                    case 8:
                        prescription = _o.sent();
                        console.log('[PrescriptionsService] Generating PDF for prescription:', saved.id);
                        return [4 /*yield*/, this.pdfService.generatePrescriptionPdf(prescription, dto.medecinName || 'Médecin', dto.patientName || 'Patient')];
                    case 9:
                        pdfBuffer = _o.sent();
                        console.log('[PrescriptionsService] PDF generated, size:', pdfBuffer.length, 'bytes');
                        uploadsDir = path_1.join(process.cwd(), 'uploads', 'prescriptions');
                        if (!fs_1.existsSync(uploadsDir))
                            fs_1.mkdirSync(uploadsDir, { recursive: true });
                        filename = "prescription-" + saved.id + ".pdf";
                        fs_1.writeFileSync(path_1.join(uploadsDir, filename), pdfBuffer);
                        pdfUrl = "/uploads/prescriptions/" + filename;
                        return [4 /*yield*/, this.repo.update(saved.id, { pdfUrl: pdfUrl })];
                    case 10:
                        _o.sent();
                        console.log('[PrescriptionsService] PDF saved at:', pdfUrl);
                        return [3 /*break*/, 12];
                    case 11:
                        pdfErr_1 = _o.sent();
                        console.error('[PrescriptionsService] PDF generation FAILED:', pdfErr_1 === null || pdfErr_1 === void 0 ? void 0 : pdfErr_1.message, (_k = pdfErr_1 === null || pdfErr_1 === void 0 ? void 0 : pdfErr_1.stack) === null || _k === void 0 ? void 0 : _k.substring(0, 300));
                        return [3 /*break*/, 12];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        qrErr_1 = _o.sent();
                        console.warn('[PrescriptionsService] QR generation failed:', qrErr_1 === null || qrErr_1 === void 0 ? void 0 : qrErr_1.message);
                        return [3 /*break*/, 14];
                    case 14:
                        _o.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, this.dataSource.query("INSERT INTO dossier_historique\n             (id, patient_id, modifie_par_id, role_auteur, champs_modifies, snapshot_avant, commentaire, created_at)\n           VALUES (gen_random_uuid(), $1, $2, 'MEDECIN', $3::jsonb, '{}'::jsonb, $4, NOW())", [
                                patientId,
                                dto.doctorId,
                                JSON.stringify({
                                    ordonnance_creee: {
                                        avant: null,
                                        apres: {
                                            prescriptionId: saved.id,
                                            medicaments: ((_l = dto.medications) !== null && _l !== void 0 ? _l : []).map(function (m) { return m.name; }),
                                            medecinName: dto.medecinName
                                        }
                                    }
                                }),
                                "Ordonnance cr\u00E9\u00E9e \u2014 " + ((_m = dto.medications) !== null && _m !== void 0 ? _m : []).map(function (m) { return m.name; }).join(', '),
                            ])];
                    case 15:
                        _o.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        auditErr_1 = _o.sent();
                        console.warn('[PrescriptionsService] Audit log failed:', auditErr_1 === null || auditErr_1 === void 0 ? void 0 : auditErr_1.message);
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/, this.findOne(saved.id)];
                    case 18:
                        err_2 = _o.sent();
                        console.error('[PrescriptionsService] create() error:', err_2 === null || err_2 === void 0 ? void 0 : err_2.message, err_2 === null || err_2 === void 0 ? void 0 : err_2.detail);
                        throw err_2;
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    PrescriptionsService.prototype.findOne = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.findOne({ where: { id: id } })];
                    case 1:
                        p = _a.sent();
                        if (!p)
                            throw new common_1.NotFoundException("Prescription introuvable");
                        return [2 /*return*/, p];
                }
            });
        });
    };
    //houni namil  SELECT * FROM prescriptions WHERE qr_code = '...' bi repo.findOne({ where: { qrCode } })
    PrescriptionsService.prototype.findByQrCode = function (qrCode) {
        return __awaiter(this, void 0, Promise, function () {
            var p;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.findOne({ where: { qrCode: qrCode } })];
                    case 1:
                        p = _a.sent();
                        if (!p)
                            throw new common_1.NotFoundException("Ordonnance introuvable");
                        return [2 /*return*/, p];
                }
            });
        });
    };
    PrescriptionsService.prototype.findByPatient = function (patientId) {
        return __awaiter(this, void 0, Promise, function () {
            var err_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 7]);
                        return [4 /*yield*/, this.repo.find({
                                where: { patientId: patientId },
                                order: { createdAt: 'DESC' },
                                select: [
                                    'id', 'patientId', 'doctorId', 'qrCode', 'status',
                                    'medications', 'notes', 'issuedAt', 'expiresAt',
                                    'signedAt', 'pdfUrl', 'emailSentAt', 'imagingRequests',
                                    'analysisRequests', 'createdAt', 'updatedAt',
                                ]
                            })];
                    case 1: 
                    // Exclure signatureImage (base64 lourd) de la liste disponible via findOne si besoin
                    return [2 /*return*/, _b.sent()];
                    case 2:
                        err_3 = _b.sent();
                        console.warn('[PrescriptionsService] findByPatient error:', err_3 === null || err_3 === void 0 ? void 0 : err_3.message);
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.repo.find({ where: { patientId: patientId }, order: { createdAt: 'DESC' } })];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        _a = _b.sent();
                        return [2 /*return*/, []];
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    PrescriptionsService.prototype.scanAtPharmacy = function (qrCode, dispensedQuantities) {
        return __awaiter(this, void 0, Promise, function () {
            var p, allDone;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.findOne({ where: { qrCode: qrCode } })];
                    case 1:
                        p = _a.sent();
                        if (!p)
                            throw new common_1.NotFoundException("Ordonnance introuvable");
                        if (p.status === prescription_entity_1.PrescriptionStatus.EXPIRED)
                            throw new common_1.BadRequestException("Ordonnance expirée");
                        if (p.status === prescription_entity_1.PrescriptionStatus.FULLY_USED)
                            throw new common_1.BadRequestException("Ordonnance déjà délivrée");
                        if (p.status === prescription_entity_1.PrescriptionStatus.REVOKED)
                            throw new common_1.BadRequestException("Ordonnance révoquée");
                        p.medications = p.medications.map(function (med) {
                            var _a, _b;
                            return (__assign(__assign({}, med), { quantityDelivered: ((_a = med.quantityDelivered) !== null && _a !== void 0 ? _a : 0) + ((_b = dispensedQuantities[med.cip]) !== null && _b !== void 0 ? _b : 0) }));
                        });
                        allDone = p.medications.every(function (m) { var _a; return ((_a = m.quantityDelivered) !== null && _a !== void 0 ? _a : 0) >= m.quantity; });
                        p.status = allDone ? prescription_entity_1.PrescriptionStatus.FULLY_USED : prescription_entity_1.PrescriptionStatus.PARTIALLY_USED;
                        return [2 /*return*/, this.repo.save(p)];
                }
            });
        });
    };
    PrescriptionsService.prototype.signPrescription = function (id, signature) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.update(id, { signedAt: new Date(), electronicSignature: signature })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.findOne(id)];
                }
            });
        });
    };
    PrescriptionsService.prototype.envoyerOrdonnance = function (id, patientEmail) {
        return __awaiter(this, void 0, Promise, function () {
            var prescription, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        prescription = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.emailService.sendPrescriptionEmail(patientEmail, prescription)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_4 = _a.sent();
                        console.warn('[PrescriptionsService] Envoi email ordonnance échoué:', err_4 === null || err_4 === void 0 ? void 0 : err_4.message);
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, this.repo.update(id, { emailSentAt: new Date() })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, this.findOne(id)];
                }
            });
        });
    };
    PrescriptionsService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(prescription_entity_1.Prescription)),
        __param(1, typeorm_1.InjectDataSource())
    ], PrescriptionsService);
    return PrescriptionsService;
}());
exports.PrescriptionsService = PrescriptionsService;
