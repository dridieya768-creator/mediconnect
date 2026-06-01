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
exports.PaymentsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var appointment_entity_1 = require("../appointments/entities/appointment.entity");
var PaymentsService = /** @class */ (function () {
    function PaymentsService(config, appointmentRepo) {
        this.config = config;
        this.appointmentRepo = appointmentRepo;
        this.flouciPublicKey = this.config.get('FLOUCI_PUBLIC_KEY', '');
        this.flouciPrivateKey = this.config.get('FLOUCI_PRIVATE_KEY', '');
        this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:4200');
    }
    PaymentsService.prototype.createCheckoutSession = function (appointmentId, patientId) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var appointment, amountMillimes, response, data, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.appointmentRepo.findOne({
                            where: { id: appointmentId },
                            relations: ['doctor']
                        })];
                    case 1:
                        appointment = _c.sent();
                        if (!appointment)
                            throw new common_1.NotFoundException('Rendez-vous introuvable');
                        if (appointment.patientId !== patientId && ((_a = appointment.patient) === null || _a === void 0 ? void 0 : _a.id) !== patientId) {
                            throw new common_1.BadRequestException('Accès non autorisé');
                        }
                        if (appointment.status === appointment_entity_1.AppointmentStatus.CANCELLED) {
                            throw new common_1.BadRequestException('Ce rendez-vous est annulé');
                        }
                        if (appointment.status === appointment_entity_1.AppointmentStatus.COMPLETED) {
                            throw new common_1.BadRequestException('Ce rendez-vous est déjà terminé');
                        }
                        amountMillimes = 50000;
                        if (!this.flouciPublicKey || !this.flouciPrivateKey) {
                            return [2 /*return*/, {
                                    paymentId: "sim_" + appointmentId,
                                    checkoutUrl: this.frontendUrl + "/patient/paiement?payment=simulated&appointmentId=" + appointmentId,
                                    amount: 50,
                                    currency: 'TND'
                                }];
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, fetch('https://developers.flouci.com/api/v2/generate_payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer " + this.flouciPublicKey + ":" + this.flouciPrivateKey
                                },
                                body: JSON.stringify({
                                    amount: amountMillimes,
                                    success_link: this.frontendUrl + "/patient/paiement?payment=success&appointmentId=" + appointmentId,
                                    fail_link: this.frontendUrl + "/patient/paiement?payment=cancelled",
                                    developer_tracking_id: appointmentId
                                })
                            })];
                    case 3:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _c.sent();
                        if (!response.ok || !((_b = data === null || data === void 0 ? void 0 : data.result) === null || _b === void 0 ? void 0 : _b.link)) {
                            throw new common_1.BadRequestException((data === null || data === void 0 ? void 0 : data.message) || 'Erreur Flouci');
                        }
                        return [2 /*return*/, {
                                paymentId: data.result.payment_id,
                                checkoutUrl: data.result.link,
                                amount: 50,
                                currency: 'TND'
                            }];
                    case 5:
                        err_1 = _c.sent();
                        throw new common_1.BadRequestException('Impossible de créer le lien de paiement : ' + err_1.message);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PaymentsService.prototype.verifyPayment = function (paymentId, appointmentId) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var response, data, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(!this.flouciPublicKey || paymentId.startsWith('sim_'))) return [3 /*break*/, 2];
                        // Mode simulé : confirmer directement
                        return [4 /*yield*/, this.appointmentRepo.update(appointmentId, {
                                status: appointment_entity_1.AppointmentStatus.CONFIRMED
                            })];
                    case 1:
                        // Mode simulé : confirmer directement
                        _c.sent();
                        return [2 /*return*/];
                    case 2:
                        _c.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, fetch("https://developers.flouci.com/api/v2/verify_payment/" + paymentId, {
                                headers: {
                                    'Authorization': "Bearer " + this.flouciPublicKey + ":" + this.flouciPrivateKey
                                }
                            })];
                    case 3:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 4:
                        data = _c.sent();
                        if (!(((_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.status) === 'SUCCESS')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.appointmentRepo.update(appointmentId, {
                                status: appointment_entity_1.AppointmentStatus.CONFIRMED
                            })];
                    case 5:
                        _c.sent();
                        _c.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        _b = _c.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    PaymentsService.prototype.getPaymentHistory = function (patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appointmentRepo.find({
                            where: { patientId: patientId },
                            relations: ['doctor'],
                            order: { appointmentDate: 'DESC' }
                        })];
                    case 1:
                        appointments = _a.sent();
                        return [2 /*return*/, appointments.map(function (a) {
                                var _a, _b;
                                return ({
                                    appointmentId: a.id,
                                    date: a.appointmentDate,
                                    doctorName: a.doctor
                                        ? ("Dr. " + ((_a = a.doctor.firstName) !== null && _a !== void 0 ? _a : '') + " " + ((_b = a.doctor.lastName) !== null && _b !== void 0 ? _b : '')).trim()
                                        : '—',
                                    status: a.status,
                                    consultationType: a.consultationType,
                                    amount: 50,
                                    currency: 'TND',
                                    paid: a.status === appointment_entity_1.AppointmentStatus.COMPLETED,
                                    payable: a.status === appointment_entity_1.AppointmentStatus.REQUESTED
                                });
                            })];
                }
            });
        });
    };
    PaymentsService = __decorate([
        common_1.Injectable(),
        __param(1, typeorm_1.InjectRepository(appointment_entity_1.Appointment))
    ], PaymentsService);
    return PaymentsService;
}());
exports.PaymentsService = PaymentsService;
