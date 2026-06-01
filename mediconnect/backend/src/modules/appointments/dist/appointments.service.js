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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AppointmentsService = void 0;
// appointments.service.ts 
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var typeorm_2 = require("typeorm");
var appointment_entity_1 = require("./entities/appointment.entity");
var notification_entity_1 = require("../notifications/notification.entity");
var uuid_1 = require("uuid");
var AppointmentsService = /** @class */ (function () {
    function AppointmentsService(repo, notificationsService, smsService) {
        this.repo = repo;
        this.notificationsService = notificationsService;
        this.smsService = smsService;
    }
    //// fonction create pour créer un nouveau rendez-vous avec vérification de conflit de créneau w notification du médecin
    AppointmentsService.prototype.create = function (dto) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, Promise, function () {
            var apptDate, endDate, conflict, appt, saved, e_1;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        apptDate = new Date(dto.appointmentDate);
                        endDate = new Date(apptDate.getTime() + ((_a = dto.durationMinutes) !== null && _a !== void 0 ? _a : 30) * 60000);
                        console.log("[Appointments] create \u2192 doctorId=" + dto.doctorId + " patientId=" + dto.patientId + " date=" + apptDate);
                        return [4 /*yield*/, this.repo
                                .createQueryBuilder("a")
                                .where("a.doctorId = :doctorId", { doctorId: dto.doctorId })
                                .andWhere("a.status IN (:...statuses)", {
                                statuses: [appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.REQUESTED]
                            })
                                .andWhere("a.appointmentDate < :end AND a.appointmentDate >= :start", {
                                start: apptDate, end: endDate
                            })
                                .getOne()];
                    case 1:
                        conflict = _f.sent();
                        if (conflict) {
                            throw new common_1.BadRequestException("Ce créneau est déjà réservé pour ce médecin.");
                        }
                        appt = this.repo.create({
                            patientId: dto.patientId,
                            doctorId: dto.doctorId,
                            appointmentDate: apptDate,
                            durationMinutes: (_b = dto.durationMinutes) !== null && _b !== void 0 ? _b : 30,
                            consultationType: dto.consultationType,
                            reason: dto.reason,
                            status: appointment_entity_1.AppointmentStatus.REQUESTED,
                            reminderSent: false,
                            beneficiaryId: (_c = dto.beneficiaryId) !== null && _c !== void 0 ? _c : null,
                            beneficiaryNom: (_d = dto.beneficiaryNom) !== null && _d !== void 0 ? _d : null,
                            beneficiaryPrenom: (_e = dto.beneficiaryPrenom) !== null && _e !== void 0 ? _e : null,
                            videoRoomId: dto.consultationType === appointment_entity_1.ConsultationType.TELECONSULTATION
                                ? "mediconnect-" + uuid_1.v4().slice(0, 8)
                                : null
                        });
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        saved = _f.sent();
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.notificationsService.create({
                                userId: saved.doctorId,
                                type: notification_entity_1.NotificationType.APPOINTMENT_CONFIRMED,
                                title: "Nouvelle demande de RDV",
                                message: "Un patient a demand\u00E9 un rendez-vous le " + apptDate.toLocaleDateString("fr-FR") + ".",
                                relatedId: saved.id
                            })];
                    case 4:
                        _f.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _f.sent();
                        console.warn("[Notifications] Impossible de notifier le médecin:", e_1.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, this.findOneSafe(saved.id)];
                }
            });
        });
    };
    ////Liste des RDV du patient
    AppointmentsService.prototype.findByPatient = function (patientId) {
        return __awaiter(this, void 0, Promise, function () {
            var userIdFromPatient, idsToSearch, appts, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.resolvePatientUserId(patientId)];
                    case 1:
                        userIdFromPatient = _a.sent();
                        idsToSearch = __spreadArrays(new Set([patientId, userIdFromPatient]));
                        return [4 /*yield*/, this.repo
                                .createQueryBuilder("a")
                                .where("a.patientId IN (:...ids)", { ids: idsToSearch })
                                .orderBy("a.appointmentDate", "DESC")
                                .getMany()];
                    case 2:
                        appts = _a.sent();
                        return [4 /*yield*/, Promise.all(appts.map(function (a) { return _this.findOneSafe(a.id); }))];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        err_1 = _a.sent();
                        console.error("[AppointmentsService] findByPatient error:", err_1.message);
                        return [2 /*return*/, this.repo.find({
                                where: { patientId: patientId },
                                order: { appointmentDate: "DESC" }
                            })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AppointmentsService.prototype.findDoctorsByPatient = function (patientUserId) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, Promise, function () {
            var resolvedId, idsToSearch, appts, doctorMap, _i, appts_1, a, err_2;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.resolvePatientUserId(patientUserId)];
                    case 1:
                        resolvedId = _g.sent();
                        idsToSearch = __spreadArrays(new Set([patientUserId, resolvedId]));
                        return [4 /*yield*/, this.repo
                                .createQueryBuilder('a')
                                .leftJoinAndSelect('a.doctor', 'doctor')
                                .where('a.patientId IN (:...ids)', { ids: idsToSearch })
                                .andWhere('a.status IN (:...statuses)', {
                                statuses: [
                                    appointment_entity_1.AppointmentStatus.COMPLETED,
                                    appointment_entity_1.AppointmentStatus.CONFIRMED,
                                    appointment_entity_1.AppointmentStatus.REQUESTED,
                                ]
                            })
                                .getMany()];
                    case 2:
                        appts = _g.sent();
                        doctorMap = new Map();
                        for (_i = 0, appts_1 = appts; _i < appts_1.length; _i++) {
                            a = appts_1[_i];
                            if (a.doctorId && !doctorMap.has(a.doctorId)) {
                                doctorMap.set(a.doctorId, {
                                    id: a.doctorId,
                                    firstName: (_b = (_a = a.doctor) === null || _a === void 0 ? void 0 : _a.firstName) !== null && _b !== void 0 ? _b : '',
                                    lastName: (_d = (_c = a.doctor) === null || _c === void 0 ? void 0 : _c.lastName) !== null && _d !== void 0 ? _d : '',
                                    email: (_f = (_e = a.doctor) === null || _e === void 0 ? void 0 : _e.email) !== null && _f !== void 0 ? _f : ''
                                });
                            }
                        }
                        return [2 /*return*/, Array.from(doctorMap.values())];
                    case 3:
                        err_2 = _g.sent();
                        console.error('[AppointmentsService] findDoctorsByPatient error:', err_2.message);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ////amltha hathi liste de rendez vous d'un médecin avec possibilité de filtrer par date
    AppointmentsService.prototype.findByDoctor = function (doctorId, date) {
        return __awaiter(this, void 0, Promise, function () {
            var pending, start, end, appointmentDate, d, s, e, scheduled, map_1, list, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Appointments] findByDoctor \u2192 doctorId=" + doctorId + " date=" + date);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.repo.find({
                                where: { doctorId: doctorId, status: appointment_entity_1.AppointmentStatus.REQUESTED },
                                relations: ["patient"],
                                order: { appointmentDate: "ASC" }
                            })];
                    case 2:
                        pending = _a.sent();
                        start = new Date();
                        start.setHours(0, 0, 0, 0);
                        end = new Date();
                        end.setDate(end.getDate() + 60);
                        end.setHours(23, 59, 59, 999);
                        appointmentDate = typeorm_2.Between(start, end);
                        if (date) {
                            d = new Date(date);
                            s = new Date(d);
                            s.setHours(0, 0, 0, 0);
                            e = new Date(d);
                            e.setHours(23, 59, 59, 999);
                            appointmentDate = typeorm_2.Between(s, e);
                        }
                        return [4 /*yield*/, this.repo.find({
                                where: {
                                    doctorId: doctorId,
                                    appointmentDate: appointmentDate,
                                    status: typeorm_2.In([appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.COMPLETED])
                                },
                                relations: ["patient"],
                                order: { appointmentDate: "ASC" }
                            })];
                    case 3:
                        scheduled = _a.sent();
                        map_1 = new Map();
                        __spreadArrays(pending, scheduled).forEach(function (a) { return map_1.set(a.id, a); });
                        list = Array.from(map_1.values()).sort(function (a, b) { return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime(); });
                        return [4 /*yield*/, this.enrichWithBeneficiaryDocs(list)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        err_3 = _a.sent();
                        console.error("[AppointmentsService] findByDoctor error:", err_3.message);
                        return [2 /*return*/, this.repo.find({
                                where: { doctorId: doctorId },
                                order: { appointmentDate: "ASC" }
                            })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AppointmentsService.prototype.enrichWithBeneficiaryDocs = function (appointments) {
        return __awaiter(this, void 0, Promise, function () {
            var withBeneficiary, ids, rows, docsMap, _i, rows_1, row;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        withBeneficiary = appointments.filter(function (a) { return a.beneficiaryId; });
                        if (withBeneficiary.length === 0)
                            return [2 /*return*/, appointments];
                        ids = __spreadArrays(new Set(withBeneficiary.map(function (a) { return a.beneficiaryId; })));
                        return [4 /*yield*/, this.repo.manager.query("SELECT id, doc_membre_path, doc_patient_path FROM family_members WHERE id = ANY($1)", [ids])];
                    case 1:
                        rows = _a.sent();
                        docsMap = new Map();
                        for (_i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                            row = rows_1[_i];
                            docsMap.set(row.id, {
                                docMembrePath: row.doc_membre_path,
                                docPatientPath: row.doc_patient_path
                            });
                        }
                        return [2 /*return*/, appointments.map(function (a) {
                                var _a, _b;
                                if (!a.beneficiaryId)
                                    return a;
                                var docs = docsMap.get(a.beneficiaryId);
                                return __assign(__assign({}, a), { beneficiaryDocMembrePath: (_a = docs === null || docs === void 0 ? void 0 : docs.docMembrePath) !== null && _a !== void 0 ? _a : null, beneficiaryDocPatientPath: (_b = docs === null || docs === void 0 ? void 0 : docs.docPatientPath) !== null && _b !== void 0 ? _b : null });
                            })];
                }
            });
        });
    };
    AppointmentsService.prototype.cancel = function (id, reason) {
        return __awaiter(this, void 0, Promise, function () {
            var appt, diff, notifUserId, dateStr, timeStr, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        appt = _a.sent();
                        if (appt.status === appointment_entity_1.AppointmentStatus.CANCELLED)
                            throw new common_1.BadRequestException("Ce RDV est déjà annulé.");
                        if (appt.status === appointment_entity_1.AppointmentStatus.COMPLETED)
                            throw new common_1.BadRequestException("Impossible d'annuler un RDV terminé.");
                        diff = new Date(appt.appointmentDate).getTime() - Date.now();
                        if (diff < 24 * 60 * 60 * 1000 && appt.status === appointment_entity_1.AppointmentStatus.CONFIRMED && diff > 0)
                            throw new common_1.BadRequestException("L'annulation doit être faite au moins 24h à l'avance.");
                        appt.status = appointment_entity_1.AppointmentStatus.CANCELLED;
                        appt.cancellationReason = reason;
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 6, , 7]);
                        return [4 /*yield*/, this.resolvePatientUserId(appt.patientId)];
                    case 4:
                        notifUserId = _a.sent();
                        console.log("[Notifications] cancel \u2192 patientId=" + appt.patientId + " \u2192 notifUserId=" + notifUserId);
                        dateStr = new Date(appt.appointmentDate).toLocaleDateString("fr-FR", {
                            weekday: "long", day: "2-digit", month: "long"
                        });
                        timeStr = new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", {
                            hour: "2-digit", minute: "2-digit"
                        });
                        return [4 /*yield*/, this.notificationsService.create({
                                userId: notifUserId,
                                type: notification_entity_1.NotificationType.APPOINTMENT_CANCELLED,
                                title: "Rendez-vous refusé",
                                message: reason
                                    ? "Votre demande de RDV du " + dateStr + " \u00E0 " + timeStr + " a \u00E9t\u00E9 refus\u00E9e. Motif : " + reason
                                    : "Votre demande de RDV du " + dateStr + " \u00E0 " + timeStr + " a \u00E9t\u00E9 refus\u00E9e.",
                                relatedId: appt.id
                            })];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        console.warn("[Notifications] Impossible de notifier le patient (cancel):", e_2.message);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/, this.findOneSafe(id)];
                }
            });
        });
    };
    AppointmentsService.prototype.confirm = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var appt, notifUserId, dateStr, timeStr, message, patientPhone, e_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        appt = _a.sent();
                        if (appt.status !== appointment_entity_1.AppointmentStatus.REQUESTED)
                            throw new common_1.BadRequestException("Seules les demandes en attente peuvent être confirmées.");
                        appt.status = appointment_entity_1.AppointmentStatus.CONFIRMED;
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 10, , 11]);
                        return [4 /*yield*/, this.resolvePatientUserId(appt.patientId)];
                    case 4:
                        notifUserId = _a.sent();
                        console.log("[Notifications] confirm \u2192 patientId=" + appt.patientId + " \u2192 notifUserId=" + notifUserId);
                        dateStr = new Date(appt.appointmentDate).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long" });
                        timeStr = new Date(appt.appointmentDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                        message = "Votre rendez-vous du " + dateStr + " \u00E0 " + timeStr + " a \u00E9t\u00E9 confirm\u00E9.";
                        return [4 /*yield*/, this.notificationsService.create({
                                userId: notifUserId,
                                type: notification_entity_1.NotificationType.APPOINTMENT_CONFIRMED,
                                title: "Rendez-vous confirmé",
                                message: message,
                                relatedId: appt.id
                            })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.resolvePatientPhone(appt.patientId)];
                    case 6:
                        patientPhone = _a.sent();
                        if (!patientPhone) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.smsService.sendSms(patientPhone, "MediConnect: " + message)];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.notificationsService.create({
                                userId: notifUserId,
                                type: notification_entity_1.NotificationType.SMS_REMINDER,
                                title: "SMS envoyé",
                                message: "SMS de confirmation envoy\u00E9 au " + patientPhone,
                                relatedId: appt.id
                            })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        e_3 = _a.sent();
                        console.warn("[Notifications] Impossible de notifier le patient (confirm):", e_3.message);
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/, this.findOneSafe(id)];
                }
            });
        });
    };
    AppointmentsService.prototype.complete = function (id, notes) {
        return __awaiter(this, void 0, Promise, function () {
            var appt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        appt = _a.sent();
                        if (appt.status !== appointment_entity_1.AppointmentStatus.CONFIRMED)
                            throw new common_1.BadRequestException("Seuls les RDV confirmés peuvent être marqués terminés.");
                        appt.status = appointment_entity_1.AppointmentStatus.COMPLETED;
                        if (notes)
                            appt.notes = notes;
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findOneSafe(id)];
                }
            });
        });
    };
    ////Patient note le médecin
    AppointmentsService.prototype.rate = function (id, dto) {
        return __awaiter(this, void 0, Promise, function () {
            var appt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        appt = _a.sent();
                        if (appt.status !== appointment_entity_1.AppointmentStatus.COMPLETED)
                            throw new common_1.BadRequestException("Seules les consultations terminées peuvent être évaluées.");
                        if (appt.rated)
                            throw new common_1.BadRequestException("Cette consultation a déjà été évaluée.");
                        appt.rating = dto.rating;
                        appt.ratingComment = dto.comment;
                        appt.rated = true;
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, this.findOneSafe(id)];
                }
            });
        });
    };
    ////prend  id rendez vous traja3 room id w  url jitsi 
    AppointmentsService.prototype.generateVideoRoom = function (id) {
        var _a, _b;
        return __awaiter(this, void 0, Promise, function () {
            var appt, patientRow, patientId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.findOne(id)];
                    case 1:
                        appt = _c.sent();
                        if (!!appt.videoRoomId) return [3 /*break*/, 3];
                        appt.videoRoomId = "mediconnect-" + uuid_1.v4().slice(0, 8);
                        return [4 /*yield*/, this.repo.save(appt)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [4 /*yield*/, this.repo.manager.query("SELECT id FROM patients WHERE user_id = $1 LIMIT 1", [appt.patientId])];
                    case 4:
                        patientRow = _c.sent();
                        patientId = (_b = (_a = patientRow === null || patientRow === void 0 ? void 0 : patientRow[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : appt.patientId;
                        return [2 /*return*/, { videoRoomId: appt.videoRoomId, jitsiUrl: "https://meet.jit.si/" + appt.videoRoomId, patientId: patientId }];
                }
            });
        });
    };
    AppointmentsService.prototype.resolvePatientUserId = function (patientId) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.manager.query("SELECT user_id FROM patients WHERE id = $1 LIMIT 1", [patientId])];
                    case 1:
                        result = _a.sent();
                        if ((result === null || result === void 0 ? void 0 : result.length) > 0 && result[0].user_id) {
                            return [2 /*return*/, result[0].user_id];
                        }
                        return [2 /*return*/, patientId];
                }
            });
        });
    };
    AppointmentsService.prototype.resolvePatientPhone = function (patientId) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var result, fromUser;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.repo.manager.query("SELECT u.phone\n       FROM patients p\n       LEFT JOIN users u ON u.id = p.user_id\n       WHERE p.id = $1 LIMIT 1", [patientId])];
                    case 1:
                        result = _b.sent();
                        if ((result === null || result === void 0 ? void 0 : result.length) > 0 && result[0].phone) {
                            return [2 /*return*/, result[0].phone];
                        }
                        return [4 /*yield*/, this.repo.manager.query("SELECT phone FROM users WHERE id = $1 LIMIT 1", [patientId])];
                    case 2:
                        fromUser = _b.sent();
                        return [2 /*return*/, ((_a = fromUser === null || fromUser === void 0 ? void 0 : fromUser[0]) === null || _a === void 0 ? void 0 : _a.phone) || null];
                }
            });
        });
    };
    AppointmentsService.prototype.findOne = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var appt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.repo.findOne({ where: { id: id } })];
                    case 1:
                        appt = _a.sent();
                        if (!appt)
                            throw new common_1.NotFoundException("RDV #" + id + " introuvable.");
                        return [2 /*return*/, appt];
                }
            });
        });
    };
    // tlawij rdv
    AppointmentsService.prototype.findOneSafe = function (id) {
        return __awaiter(this, void 0, Promise, function () {
            var appt, err_4, appt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.repo.findOne({
                                where: { id: id },
                                relations: ["doctor", "patient"]
                            })];
                    case 1:
                        appt = _a.sent();
                        if (!appt)
                            throw new common_1.NotFoundException("RDV #" + id + " introuvable.");
                        return [2 /*return*/, appt];
                    case 2:
                        err_4 = _a.sent();
                        console.error("[AppointmentsService] findOneSafe relations error:", err_4.message);
                        return [4 /*yield*/, this.repo.findOne({ where: { id: id } })];
                    case 3:
                        appt = _a.sent();
                        if (!appt)
                            throw new common_1.NotFoundException("RDV #" + id + " introuvable.");
                        return [2 /*return*/, appt];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AppointmentsService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(appointment_entity_1.Appointment))
    ], AppointmentsService);
    return AppointmentsService;
}());
exports.AppointmentsService = AppointmentsService;
