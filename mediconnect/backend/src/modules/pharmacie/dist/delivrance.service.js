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
exports.DelivranceService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var uuid_1 = require("uuid");
var prescription_entity_1 = require("../prescriptions/entities/prescription.entity");
var dossier_historique_entity_1 = require("../dossier-medical/entities/dossier-historique.entity");
var user_entity_1 = require("../users/entities/user.entity");
var DelivranceService = /** @class */ (function () {
    function DelivranceService(dataSource, qrCodesService, ticketPdfService, prescriptionRepo) {
        this.dataSource = dataSource;
        this.qrCodesService = qrCodesService;
        this.ticketPdfService = ticketPdfService;
        this.prescriptionRepo = prescriptionRepo;
    }
    DelivranceService.prototype.scanQrOrd = function (dto, pharmacienId) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var result, _c, entityId, prescription;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.qrCodesService.scanQr(dto.qrCode, pharmacienId)];
                    case 1:
                        ////namil vérification la signature JWT du QR
                        result = _d.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _c = _d.sent();
                        throw new common_1.BadRequestException('Signature QR invalide');
                    case 3:
                        if (!result.valid) {
                            throw new common_1.BadRequestException('Signature QR invalide');
                        }
                        entityId = (_b = (_a = result.data.prescription_id) !== null && _a !== void 0 ? _a : result.data.entityId) !== null && _b !== void 0 ? _b : result.data.entity_id;
                        return [4 /*yield*/, this.prescriptionRepo.findOne({
                                where: { id: entityId },
                                relations: ['patient', 'patient.user', 'doctor']
                            })];
                    case 4:
                        prescription = _d.sent();
                        if (!prescription) {
                            throw new common_1.NotFoundException('Ordonnance introuvable');
                        }
                        if (!(prescription.expiresAt < new Date())) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.prescriptionRepo.update(prescription.id, {
                                status: prescription_entity_1.PrescriptionStatus.EXPIRED
                            })];
                    case 5:
                        _d.sent();
                        throw new common_1.BadRequestException('Ordonnance expirée');
                    case 6:
                        switch (prescription.status) {
                            case prescription_entity_1.PrescriptionStatus.FULLY_USED:
                                throw new common_1.BadRequestException('Ordonnance déjà entièrement délivrée');
                            case prescription_entity_1.PrescriptionStatus.EXPIRED:
                                throw new common_1.BadRequestException('Ordonnance expirée');
                            case prescription_entity_1.PrescriptionStatus.REVOKED:
                                throw new common_1.BadRequestException('Ordonnance révoquée');
                        }
                        return [2 /*return*/, this.mapToPrescriptionDetailDto(prescription)];
                }
            });
        });
    };
    DelivranceService.prototype.scanMedCip = function (dto, sessionCounts) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var prescription, cip, parsed, med, isTempKey, medWithoutCip, idx, quantiteSession, alreadyDelivered;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.prescriptionRepo.findOne({
                            where: { id: dto.prescriptionId }
                        })];
                    case 1:
                        prescription = _c.sent();
                        if (!prescription) {
                            throw new common_1.NotFoundException('Ordonnance introuvable');
                        }
                        try {
                            parsed = JSON.parse(dto.qrMedCip);
                            cip = parsed.cip;
                        }
                        catch (_d) {
                            cip = dto.qrMedCip;
                        }
                        med = prescription.medications.find(function (m) { return m.cip === cip; });
                        if (!!med) return [3 /*break*/, 3];
                        isTempKey = /^MED_\d+$/.test(cip);
                        medWithoutCip = void 0;
                        if (isTempKey) {
                            idx = parseInt(cip.replace('MED_', ''), 10);
                            medWithoutCip = prescription.medications[idx];
                        }
                        else {
                            medWithoutCip = prescription.medications.find(function (m) { return !m.cip || m.cip.trim() === '' || /^MED_\d+$/.test(m.cip); });
                        }
                        if (!medWithoutCip) return [3 /*break*/, 3];
                        medWithoutCip.cip = cip;
                        return [4 /*yield*/, this.prescriptionRepo.save(prescription)];
                    case 2:
                        _c.sent();
                        med = medWithoutCip;
                        _c.label = 3;
                    case 3:
                        if (!med) {
                            throw new common_1.BadRequestException("M\u00E9dicament non prescrit : CIP " + cip);
                        }
                        quantiteSession = ((_a = sessionCounts[cip]) !== null && _a !== void 0 ? _a : 0) + 1;
                        alreadyDelivered = (_b = med.quantityDelivered) !== null && _b !== void 0 ? _b : 0;
                        if (alreadyDelivered + quantiteSession > med.quantity) {
                            throw new common_1.BadRequestException("Quantit\u00E9 d\u00E9pass\u00E9e pour " + med.name);
                        }
                        return [2 /*return*/, { cip: cip, nom: med.name, quantiteSession: quantiteSession }];
                }
            });
        });
    };
    DelivranceService.prototype.calculerFinancier = function (medicaments) {
        var lignes = medicaments.map(function (med) {
            var montantTotal = med.prixUnitaire * med.quantiteDelivree;
            var partCnam = montantTotal * med.tauxCnam;
            var partPatient = montantTotal - partCnam;
            return {
                cip: med.cip,
                nom: med.cip,
                quantite: med.quantiteDelivree,
                prixUnitaire: med.prixUnitaire,
                montantTotal: montantTotal,
                partCnam: partCnam,
                partPatient: partPatient
            };
        });
        var totalCnam = lignes.reduce(function (sum, l) { return sum + l.partCnam; }, 0);
        var totalPatient = lignes.reduce(function (sum, l) { return sum + l.partPatient; }, 0);
        var totalGeneral = lignes.reduce(function (sum, l) { return sum + l.montantTotal; }, 0);
        return { lignes: lignes, totalCnam: totalCnam, totalPatient: totalPatient, totalGeneral: totalGeneral };
    };
    DelivranceService.prototype.confirmerDelivrance = function (dto, pharmacienId) {
        return __awaiter(this, void 0, Promise, function () {
            var prescription, delivranceId, delivreAt, result, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prescriptionRepo.findOne({
                            where: { id: dto.prescriptionId },
                            relations: ['patient', 'patient.user', 'doctor']
                        })];
                    case 1:
                        prescription = _a.sent();
                        if (!prescription) {
                            throw new common_1.NotFoundException('Ordonnance introuvable');
                        }
                        delivranceId = uuid_1.v4();
                        delivreAt = new Date();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.dataSource.transaction(function (em) { return __awaiter(_this, void 0, void 0, function () {
                                var _loop_1, _i, _a, medDelivre, allFull, financierLignes, totalCnam, totalPatient, totalGeneral, patientNom, patientPrenom, patientNss, pharmacienUser, pharmacienNom, pharmacienPrenom, ticketUrl, financierDto, medicamentsDelivresResult;
                                var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                                return __generator(this, function (_o) {
                                    switch (_o.label) {
                                        case 0:
                                            _loop_1 = function (medDelivre) {
                                                var med = prescription.medications.find(function (m) { return m.cip === medDelivre.cip; });
                                                if (med) {
                                                    med.quantityDelivered = ((_b = med.quantityDelivered) !== null && _b !== void 0 ? _b : 0) + medDelivre.quantiteDelivree;
                                                }
                                            };
                                            for (_i = 0, _a = dto.medicamentsDelivres; _i < _a.length; _i++) {
                                                medDelivre = _a[_i];
                                                _loop_1(medDelivre);
                                            }
                                            allFull = prescription.medications.every(function (m) { var _a; return ((_a = m.quantityDelivered) !== null && _a !== void 0 ? _a : 0) >= m.quantity; });
                                            prescription.status = allFull
                                                ? prescription_entity_1.PrescriptionStatus.FULLY_USED
                                                : prescription_entity_1.PrescriptionStatus.PARTIALLY_USED;
                                            return [4 /*yield*/, em.save(prescription_entity_1.Prescription, prescription)];
                                        case 1:
                                            _o.sent();
                                            financierLignes = dto.medicamentsDelivres.map(function (medDelivre) {
                                                var _a;
                                                var med = prescription.medications.find(function (m) { return m.cip === medDelivre.cip; });
                                                var nom = (_a = med === null || med === void 0 ? void 0 : med.name) !== null && _a !== void 0 ? _a : medDelivre.cip;
                                                var montantTotal = medDelivre.prixUnitaire * medDelivre.quantiteDelivree;
                                                var partCnam = montantTotal * medDelivre.tauxCnam;
                                                var partPatient = montantTotal - partCnam;
                                                return {
                                                    cip: medDelivre.cip,
                                                    nom: nom,
                                                    quantite: medDelivre.quantiteDelivree,
                                                    prixUnitaire: medDelivre.prixUnitaire,
                                                    montantTotal: montantTotal,
                                                    partCnam: partCnam,
                                                    partPatient: partPatient,
                                                    dosage: med === null || med === void 0 ? void 0 : med.dosage,
                                                    posologie: med === null || med === void 0 ? void 0 : med.posology,
                                                    duree: (med === null || med === void 0 ? void 0 : med.durationDays) ? med.durationDays + " jours" : undefined
                                                };
                                            });
                                            totalCnam = financierLignes.reduce(function (s, l) { return s + l.partCnam; }, 0);
                                            totalPatient = financierLignes.reduce(function (s, l) { return s + l.partPatient; }, 0);
                                            totalGeneral = financierLignes.reduce(function (s, l) { return s + l.montantTotal; }, 0);
                                            patientNom = (_e = (_d = (_c = prescription.patient) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.lastName) !== null && _e !== void 0 ? _e : '';
                                            patientPrenom = (_h = (_g = (_f = prescription.patient) === null || _f === void 0 ? void 0 : _f.user) === null || _g === void 0 ? void 0 : _g.firstName) !== null && _h !== void 0 ? _h : '';
                                            patientNss = (_k = (_j = prescription.patient) === null || _j === void 0 ? void 0 : _j.nss) !== null && _k !== void 0 ? _k : '';
                                            return [4 /*yield*/, em.findOne(user_entity_1.User, { where: { id: pharmacienId } })];
                                        case 2:
                                            pharmacienUser = _o.sent();
                                            pharmacienNom = (_l = pharmacienUser === null || pharmacienUser === void 0 ? void 0 : pharmacienUser.lastName) !== null && _l !== void 0 ? _l : '';
                                            pharmacienPrenom = (_m = pharmacienUser === null || pharmacienUser === void 0 ? void 0 : pharmacienUser.firstName) !== null && _m !== void 0 ? _m : '';
                                            return [4 /*yield*/, this.ticketPdfService.generateTicket({
                                                    delivranceId: delivranceId,
                                                    delivreAt: delivreAt,
                                                    patient: { nom: patientNom, prenom: patientPrenom, nss: patientNss },
                                                    pharmacien: { nom: pharmacienNom, prenom: pharmacienPrenom },
                                                    qrOrdCode: prescription.qrCode,
                                                    medicaments: financierLignes.map(function (l) { return ({
                                                        cip: l.cip,
                                                        nom: l.nom,
                                                        dosage: l.dosage,
                                                        posologie: l.posologie,
                                                        duree: l.duree,
                                                        quantiteDelivree: l.quantite,
                                                        prixUnitaire: l.prixUnitaire,
                                                        partCnam: l.partCnam,
                                                        partPatient: l.partPatient
                                                    }); }),
                                                    financier: { totalCnam: totalCnam, totalPatient: totalPatient, totalGeneral: totalGeneral }
                                                })];
                                        case 3:
                                            ticketUrl = _o.sent();
                                            return [4 /*yield*/, em.save(dossier_historique_entity_1.DossierHistorique, {
                                                    patientId: prescription.patientId,
                                                    modifieParId: pharmacienId,
                                                    roleAuteur: 'PHARMACIEN',
                                                    champsModifies: {
                                                        delivrance_pharmacie: {
                                                            avant: null,
                                                            apres: {
                                                                prescriptionId: prescription.id,
                                                                delivranceId: delivranceId,
                                                                medicaments: dto.medicamentsDelivres.map(function (m) {
                                                                    var _a, _b;
                                                                    return ({
                                                                        cip: m.cip,
                                                                        nom: (_b = (_a = prescription.medications.find(function (med) { return med.cip === m.cip; })) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : m.cip,
                                                                        quantiteDelivree: m.quantiteDelivree
                                                                    });
                                                                }),
                                                                pharmacienId: pharmacienId,
                                                                delivreAt: delivreAt.toISOString()
                                                            }
                                                        }
                                                    },
                                                    snapshotAvant: { prescriptionStatus: prescription_entity_1.PrescriptionStatus.ACTIVE },
                                                    commentaire: "D\u00E9livrance pharmacie \u2014 " + prescription.qrCode
                                                })];
                                        case 4:
                                            _o.sent();
                                            financierDto = {
                                                lignes: financierLignes.map(function (l) { return ({
                                                    cip: l.cip,
                                                    nom: l.nom,
                                                    quantite: l.quantite,
                                                    prixUnitaire: l.prixUnitaire,
                                                    montantTotal: l.montantTotal,
                                                    partCnam: l.partCnam,
                                                    partPatient: l.partPatient
                                                }); }),
                                                totalCnam: totalCnam,
                                                totalPatient: totalPatient,
                                                totalGeneral: totalGeneral
                                            };
                                            medicamentsDelivresResult = dto.medicamentsDelivres.map(function (m) {
                                                var ligne = financierLignes.find(function (l) { return l.cip === m.cip; });
                                                return {
                                                    cip: m.cip,
                                                    nom: ligne.nom,
                                                    quantiteDelivree: m.quantiteDelivree,
                                                    prixUnitaire: m.prixUnitaire,
                                                    partCnam: ligne.partCnam,
                                                    partPatient: ligne.partPatient
                                                };
                                            });
                                            return [2 /*return*/, {
                                                    delivranceId: delivranceId,
                                                    prescriptionId: prescription.id,
                                                    status: prescription.status,
                                                    medicamentsDelivres: medicamentsDelivresResult,
                                                    financier: financierDto,
                                                    ticketUrl: ticketUrl,
                                                    delivreAt: delivreAt
                                                }];
                                    }
                                });
                            }); })];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        if (error_1 instanceof common_1.BadRequestException ||
                            error_1 instanceof common_1.NotFoundException) {
                            throw error_1;
                        }
                        throw new common_1.InternalServerErrorException("Erreur lors de l'enregistrement de la délivrance");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DelivranceService.prototype.mapToPrescriptionDetailDto = function (prescription) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var patient = prescription.patient;
        var doctor = prescription.doctor;
        return {
            id: prescription.id,
            qrCode: prescription.qrCode,
            status: prescription.status,
            issuedAt: prescription.issuedAt,
            expiresAt: prescription.expiresAt,
            patient: {
                id: (_a = patient === null || patient === void 0 ? void 0 : patient.id) !== null && _a !== void 0 ? _a : prescription.patientId,
                nom: (_c = (_b = patient === null || patient === void 0 ? void 0 : patient.user) === null || _b === void 0 ? void 0 : _b.lastName) !== null && _c !== void 0 ? _c : '',
                prenom: (_e = (_d = patient === null || patient === void 0 ? void 0 : patient.user) === null || _d === void 0 ? void 0 : _d.firstName) !== null && _e !== void 0 ? _e : '',
                nss: (_f = patient === null || patient === void 0 ? void 0 : patient.nss) !== null && _f !== void 0 ? _f : ''
            },
            medecin: {
                id: (_g = doctor === null || doctor === void 0 ? void 0 : doctor.id) !== null && _g !== void 0 ? _g : prescription.doctorId,
                nom: (_h = doctor === null || doctor === void 0 ? void 0 : doctor.lastName) !== null && _h !== void 0 ? _h : '',
                prenom: (_j = doctor === null || doctor === void 0 ? void 0 : doctor.firstName) !== null && _j !== void 0 ? _j : '',
                rpps: null
            },
            medications: ((_k = prescription.medications) !== null && _k !== void 0 ? _k : []).map(function (m) {
                var _a;
                return ({
                    cip: m.cip,
                    name: m.name,
                    dosage: m.dosage,
                    posology: m.posology,
                    durationDays: m.durationDays,
                    quantity: m.quantity,
                    quantityDelivered: (_a = m.quantityDelivered) !== null && _a !== void 0 ? _a : 0,
                    isSubstitutable: m.isSubstitutable
                });
            }),
            notes: (_l = prescription.notes) !== null && _l !== void 0 ? _l : undefined
        };
    };
    DelivranceService = __decorate([
        common_1.Injectable(),
        __param(3, typeorm_1.InjectRepository(prescription_entity_1.Prescription))
    ], DelivranceService);
    return DelivranceService;
}());
exports.DelivranceService = DelivranceService;
