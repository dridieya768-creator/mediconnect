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
var _a;
exports.__esModule = true;
exports.DossierAccesService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var dossier_acces_medecin_entity_1 = require("./entities/dossier-acces-medecin.entity");
var HIERARCHIE = (_a = {},
    _a[dossier_acces_medecin_entity_1.NiveauAcces.LECTURE] = 1,
    _a[dossier_acces_medecin_entity_1.NiveauAcces.LECTURE_ECRITURE] = 2,
    _a[dossier_acces_medecin_entity_1.NiveauAcces.ACCES_COMPLET] = 3,
    _a);
var DossierAccesService = /** @class */ (function () {
    function DossierAccesService(accesRepo) {
        this.accesRepo = accesRepo;
    }
    DossierAccesService.prototype.accorderAcces = function (patientId, accordeParId, dto) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var existing, acces;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.accesRepo.findOne({
                            where: { patientId: patientId, medecinId: dto.medecinId }
                        })];
                    case 1:
                        existing = _b.sent();
                        if (existing)
                            throw new common_1.ConflictException('Un accès existe déjà pour ce médecin');
                        acces = this.accesRepo.create({
                            patientId: patientId,
                            medecinId: dto.medecinId,
                            niveauAcces: dto.niveauAcces,
                            accordeParId: accordeParId,
                            dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : null,
                            actif: true,
                            permissions: (_a = dto.permissions) !== null && _a !== void 0 ? _a : null
                        });
                        return [2 /*return*/, this.accesRepo.save(acces)];
                }
            });
        });
    };
    DossierAccesService.prototype.modifierAcces = function (accesId, patientId, dto) {
        return __awaiter(this, void 0, Promise, function () {
            var acces;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accesRepo.findOne({ where: { id: accesId, patientId: patientId } })];
                    case 1:
                        acces = _a.sent();
                        if (!acces)
                            throw new common_1.NotFoundException('Accès introuvable');
                        if (dto.niveauAcces !== undefined)
                            acces.niveauAcces = dto.niveauAcces;
                        if (dto.dateExpiration !== undefined)
                            acces.dateExpiration = dto.dateExpiration ? new Date(dto.dateExpiration) : null;
                        if (dto.actif !== undefined)
                            acces.actif = dto.actif;
                        if (dto.permissions !== undefined)
                            acces.permissions = dto.permissions;
                        return [2 /*return*/, this.accesRepo.save(acces)];
                }
            });
        });
    };
    DossierAccesService.prototype.revoquerAcces = function (accesId, patientId) {
        return __awaiter(this, void 0, Promise, function () {
            var acces;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accesRepo.findOne({ where: { id: accesId, patientId: patientId } })];
                    case 1:
                        acces = _a.sent();
                        if (!acces)
                            throw new common_1.NotFoundException('Accès introuvable');
                        acces.actif = false;
                        return [4 /*yield*/, this.accesRepo.save(acces)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DossierAccesService.prototype.getPermissionsMedecin = function (patientId, medecinId) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var acces;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.accesRepo.findOne({
                            where: { patientId: patientId, medecinId: medecinId, actif: true }
                        })];
                    case 1:
                        acces = _b.sent();
                        if (!acces) {
                            return [2 /*return*/, { permissions: { allergies: false, documents: false, observations: false }, niveauAcces: null }];
                        }
                        return [2 /*return*/, {
                                permissions: (_a = acces.permissions) !== null && _a !== void 0 ? _a : { allergies: true, documents: true, observations: true },
                                niveauAcces: acces.niveauAcces
                            }];
                }
            });
        });
    };
    DossierAccesService.prototype.listerAcces = function (patientId) {
        return __awaiter(this, void 0, Promise, function () {
            var list, err_1, list;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.accesRepo.find({
                                where: { patientId: patientId },
                                relations: ['medecin']
                            })];
                    case 1:
                        list = _a.sent();
                        return [2 /*return*/, list.map(function (a) {
                                var _a, _b, _c;
                                return ({
                                    id: a.id,
                                    patientId: a.patientId,
                                    medecinId: a.medecinId,
                                    medecinNom: a.medecin ? (((_a = a.medecin.firstName) !== null && _a !== void 0 ? _a : '') + " " + ((_b = a.medecin.lastName) !== null && _b !== void 0 ? _b : '')).trim() : null,
                                    niveauAcces: a.niveauAcces,
                                    permissions: (_c = a.permissions) !== null && _c !== void 0 ? _c : null,
                                    actif: a.actif,
                                    dateExpiration: a.dateExpiration,
                                    createdAt: a.createdAt
                                });
                            })];
                    case 2:
                        err_1 = _a.sent();
                        console.warn('[listerAcces] error:', err_1 === null || err_1 === void 0 ? void 0 : err_1.message);
                        return [4 /*yield*/, this.accesRepo.find({ where: { patientId: patientId } })];
                    case 3:
                        list = _a.sent();
                        return [2 /*return*/, list.map(function (a) { return ({
                                id: a.id,
                                patientId: a.patientId,
                                medecinId: a.medecinId,
                                medecinNom: null,
                                niveauAcces: a.niveauAcces,
                                permissions: null,
                                actif: a.actif,
                                dateExpiration: a.dateExpiration,
                                createdAt: a.createdAt
                            }); })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DossierAccesService.prototype.verifierAcces = function (patientId, medecinId, niveauRequis) {
        return __awaiter(this, void 0, Promise, function () {
            var acces;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.accesRepo.findOne({
                            where: { patientId: patientId, medecinId: medecinId }
                        })];
                    case 1:
                        acces = _a.sent();
                        if (!acces || !acces.actif) {
                            throw new common_1.ForbiddenException('Accès non autorisé');
                        }
                        if (acces.dateExpiration && acces.dateExpiration < new Date()) {
                            throw new common_1.ForbiddenException('Accès expiré');
                        }
                        if (HIERARCHIE[acces.niveauAcces] < HIERARCHIE[niveauRequis]) {
                            throw new common_1.ForbiddenException('Niveau d\'accès insuffisant');
                        }
                        return [2 /*return*/, acces];
                }
            });
        });
    };
    DossierAccesService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(dossier_acces_medecin_entity_1.DossierAccesMedecin))
    ], DossierAccesService);
    return DossierAccesService;
}());
exports.DossierAccesService = DossierAccesService;
