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
exports.PartageLienService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var patient_entity_1 = require("../patients/entities/patient.entity");
var PartageLienService = /** @class */ (function () {
    function PartageLienService(jwtService, patientRepo, emailService) {
        this.jwtService = jwtService;
        this.patientRepo = patientRepo;
        this.emailService = emailService;
    }
    PartageLienService.prototype.genererEtEnvoyerLien = function (patientId, patientNom, medecinEmail, permissions, dureeHeures) {
        return __awaiter(this, void 0, Promise, function () {
            var result, emailEnvoye;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = this.genererLien(patientId, permissions, dureeHeures);
                        return [4 /*yield*/, this.emailService.sendPartageEmail(medecinEmail, patientNom, result.lien, result.expiresAt)];
                    case 1:
                        emailEnvoye = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { emailEnvoye: emailEnvoye })];
                }
            });
        });
    };
    PartageLienService.prototype.genererLien = function (patientId, permissions, dureeHeures) {
        var _a, _b;
        var expiresAt = new Date(Date.now() + dureeHeures * 60 * 60 * 1000).toISOString();
        var payload = {
            type: 'PARTAGE_DOSSIER',
            patientId: patientId,
            permissions: permissions,
            expiresAt: expiresAt
        };
        ///////JWT est signé avec la clé secrète du serveur 
        var token = this.jwtService.sign(payload, {
            expiresIn: dureeHeures + "h",
            secret: process.env.JWT_SECRET
        });
        var lien = ((_b = (_a = process.env.FRONTEND_URL) !== null && _a !== void 0 ? _a : process.env.APP_URL) !== null && _b !== void 0 ? _b : 'http://localhost:4200') + "/partage-dossier?token=" + token;
        return { token: token, lien: lien, expiresAt: expiresAt };
    };
    ////méthode est exécutée lorsqu'un médecin ouvre le lien
    PartageLienService.prototype.accederVieLien = function (token) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, Promise, function () {
            var payload, patient, dossierFiltre;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        try {
                            payload = this.jwtService.verify(token, {
                                secret: process.env.JWT_SECRET
                            });
                        }
                        catch (_f) {
                            throw new common_1.BadRequestException('Lien invalide ou expiré');
                        }
                        if (payload.type !== 'PARTAGE_DOSSIER') {
                            throw new common_1.BadRequestException('Type de lien invalide');
                        }
                        if (new Date(payload.expiresAt) < new Date()) {
                            throw new common_1.BadRequestException('Ce lien de partage a expiré');
                        }
                        return [4 /*yield*/, this.patientRepo.findOne({
                                where: { id: payload.patientId },
                                relations: ['user']
                            })];
                    case 1:
                        patient = _e.sent();
                        if (!patient)
                            throw new common_1.NotFoundException('Patient introuvable');
                        dossierFiltre = {
                            id: patient.id,
                            nom: (_b = (_a = patient.user) === null || _a === void 0 ? void 0 : _a.lastName) !== null && _b !== void 0 ? _b : '',
                            prenom: (_d = (_c = patient.user) === null || _c === void 0 ? void 0 : _c.firstName) !== null && _d !== void 0 ? _d : '',
                            dateNaissance: patient.dateNaissance,
                            sexe: patient.sexe,
                            groupeSanguin: patient.groupeSanguin
                        };
                        if (payload.permissions.allergies) {
                            dossierFiltre.allergies = patient.allergies;
                        }
                        if (payload.permissions.maladiesChroniques) {
                            dossierFiltre.maladiesChroniques = patient.maladiesChroniques;
                        }
                        if (payload.permissions.medicamentsActuels) {
                            dossierFiltre.medicamentsActuels = patient.medicamentsActuels;
                        }
                        if (payload.permissions.documents) {
                            dossierFiltre.documents = patient.documents;
                        }
                        return [2 /*return*/, {
                                patient: dossierFiltre,
                                permissions: payload.permissions,
                                expiresAt: payload.expiresAt
                            }];
                }
            });
        });
    };
    PartageLienService = __decorate([
        common_1.Injectable(),
        __param(1, typeorm_1.InjectRepository(patient_entity_1.Patient))
    ], PartageLienService);
    return PartageLienService;
}());
exports.PartageLienService = PartageLienService;
