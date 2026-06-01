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
exports.RevenusService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var appointment_entity_1 = require("../appointments/entities/appointment.entity");
var RevenusService = /** @class */ (function () {
    function RevenusService(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    RevenusService.prototype.getRevenus = function (doctorId, from, to) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var qb, appointments, TARIF, factures, totalRevenu, nbConsult, nbTeleconsult, nbPhysique, parMois, _i, factures_1, f, key;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        qb = this.appointmentRepo
                            .createQueryBuilder('a') // a hiya appointement 
                            .leftJoinAndSelect('a.patient', 'patient')
                            .where('a.doctorId = :doctorId', { doctorId: doctorId })
                            .andWhere('a.status IN (:...statuses)', {
                            statuses: [appointment_entity_1.AppointmentStatus.COMPLETED]
                        });
                        if (from) {
                            qb.andWhere('a.appointmentDate >= :from', {
                                from: new Date(from)
                            });
                        }
                        if (to) {
                            qb.andWhere('a.appointmentDate <= :to', {
                                to: new Date(to + 'T23:59:59')
                            });
                        }
                        qb.orderBy('a.appointmentDate', 'DESC');
                        return [4 /*yield*/, qb.getMany()];
                    case 1:
                        appointments = _b.sent();
                        TARIF = 50;
                        factures = appointments.map(function (a, idx) {
                            var _a, _b, _c, _d;
                            return ({
                                numero: "FAC-" + String(idx + 1).padStart(4, '0'),
                                date: a.appointmentDate,
                                patientNom: (((_b = (_a = a.patient) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : '') + " " + ((_d = (_c = a.patient) === null || _c === void 0 ? void 0 : _c.lastName) !== null && _d !== void 0 ? _d : '')).trim() ||
                                    'Patient',
                                type: a.consultationType,
                                statut: a.status,
                                montant: TARIF,
                                devise: 'TND'
                            });
                        });
                        totalRevenu = factures.reduce(function (s, f) { return s + f.montant; }, 0);
                        nbConsult = factures.length;
                        nbTeleconsult = factures.filter(function (f) { return f.type === 'TELECONSULTATION'; }).length;
                        nbPhysique = factures.filter(function (f) { return f.type === 'PHYSICAL'; }).length;
                        parMois = {};
                        for (_i = 0, factures_1 = factures; _i < factures_1.length; _i++) {
                            f = factures_1[_i];
                            key = new Date(f.date).toLocaleDateString('fr-FR', {
                                month: 'short',
                                year: 'numeric'
                            });
                            parMois[key] = ((_a = parMois[key]) !== null && _a !== void 0 ? _a : 0) + f.montant;
                        }
                        return [2 /*return*/, {
                                factures: factures,
                                stats: {
                                    totalRevenu: totalRevenu,
                                    nbConsult: nbConsult,
                                    nbTeleconsult: nbTeleconsult,
                                    nbPhysique: nbPhysique,
                                    tarif: TARIF
                                },
                                parMois: parMois
                            }];
                }
            });
        });
    };
    RevenusService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(appointment_entity_1.Appointment))
    ], RevenusService);
    return RevenusService;
}());
exports.RevenusService = RevenusService;
