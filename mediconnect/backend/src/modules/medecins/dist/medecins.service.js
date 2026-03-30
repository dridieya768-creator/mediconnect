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
exports.MedecinsService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var medecin_profile_entity_1 = require("./entities/medecin-profile.entity");
var doctor_patient_entity_1 = require("./entities/doctor-patient.entity");
var user_entity_1 = require("../users/entities/user.entity");
var appointment_entity_1 = require("../appointments/entities/appointment.entity");
var fs = require("fs");
var path = require("path");
var uuid_1 = require("uuid");
var MedecinsService = /** @class */ (function () {
    function MedecinsService(medecinProfileRepository, doctorPatientRepository, userRepository, appointmentRepository) {
        this.medecinProfileRepository = medecinProfileRepository;
        this.doctorPatientRepository = doctorPatientRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }
    MedecinsService.prototype.getProfile = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, newProfile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.medecinProfileRepository.findOne({
                            where: { userId: userId }
                        })];
                    case 1:
                        profile = _a.sent();
                        if (!profile) {
                            newProfile = this.medecinProfileRepository.create({
                                userId: userId,
                                agendaConnecte: true,
                                disponTeleconsult: false,
                                connexionVideoIntegree: false,
                                profilSEO: false,
                                statsAnalytics: false
                            });
                            return [2 /*return*/, this.medecinProfileRepository.save(newProfile)];
                        }
                        return [2 /*return*/, profile];
                }
            });
        });
    };
    MedecinsService.prototype.updateProfile = function (userId, updateData) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, _a, photos, savedPhotos, _i, photos_1, photo, trimmedPhoto, savedUrl;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.medecinProfileRepository.findOne({
                            where: { userId: userId }
                        })];
                    case 1:
                        profile = _b.sent();
                        if (!profile) {
                            profile = this.medecinProfileRepository.create({
                                userId: userId
                            });
                        }
                        if (!(updateData.photoPro && updateData.photoPro.startsWith('data:image'))) return [3 /*break*/, 3];
                        _a = updateData;
                        return [4 /*yield*/, this.saveBase64Image(updateData.photoPro, 'photos')];
                    case 2:
                        _a.photoPro = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!updateData.photosCabinet) return [3 /*break*/, 9];
                        photos = updateData.photosCabinet.split(',');
                        savedPhotos = [];
                        _i = 0, photos_1 = photos;
                        _b.label = 4;
                    case 4:
                        if (!(_i < photos_1.length)) return [3 /*break*/, 8];
                        photo = photos_1[_i];
                        trimmedPhoto = photo.trim();
                        if (!trimmedPhoto.startsWith('data:image')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.saveBase64Image(trimmedPhoto, 'cabinet')];
                    case 5:
                        savedUrl = _b.sent();
                        savedPhotos.push(savedUrl);
                        return [3 /*break*/, 7];
                    case 6:
                        savedPhotos.push(trimmedPhoto);
                        _b.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 4];
                    case 8:
                        updateData.photosCabinet = savedPhotos.join(', ');
                        _b.label = 9;
                    case 9:
                        Object.assign(profile, updateData);
                        return [2 /*return*/, this.medecinProfileRepository.save(profile)];
                }
            });
        });
    };
    MedecinsService.prototype.getAllMedecinsWithProfiles = function (search, specialite, ville) {
        return __awaiter(this, void 0, void 0, function () {
            var roles, qb, users, profiles, profileMap, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        roles = [
                            'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE',
                            'MEDECIN_CHEF_SERVICE', 'MEDECIN_URGENTISTE'
                        ];
                        qb = this.userRepository
                            .createQueryBuilder('user')
                            .where('user.role IN (:...roles)', { roles: roles })
                            .andWhere("user.status = 'ACTIVE'");
                        if (search) {
                            qb = qb.andWhere('(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)', { s: "%" + search.toLowerCase() + "%" });
                        }
                        return [4 /*yield*/, qb.getMany()];
                    case 1:
                        users = _a.sent();
                        return [4 /*yield*/, this.medecinProfileRepository.find()];
                    case 2:
                        profiles = _a.sent();
                        profileMap = new Map(profiles.map(function (p) { return [p.userId, p]; }));
                        result = users.map(function (u) { return ({
                            id: u.id,
                            userId: u.id,
                            firstName: u.firstName,
                            lastName: u.lastName,
                            email: u.email,
                            role: u.role,
                            avatarUrl: u.avatarUrl,
                            profile: profileMap.get(u.id) || null
                        }); });
                        // Filtres sur le profil
                        if (specialite) {
                            result = result.filter(function (d) { var _a; return (((_a = d.profile) === null || _a === void 0 ? void 0 : _a.specialite) || '').toLowerCase().includes(specialite.toLowerCase()); });
                        }
                        if (ville) {
                            result = result.filter(function (d) { var _a; return ((_a = d.profile) === null || _a === void 0 ? void 0 : _a.ville) === ville; });
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    MedecinsService.prototype.updateAvailability = function (userId, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, availabilityData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.medecinProfileRepository
                            .createQueryBuilder('profile')
                            .where('profile.user_id = :userId', { userId: userId })
                            .getOne()];
                    case 1:
                        profile = _a.sent();
                        if (!profile)
                            throw new common_1.NotFoundException('Profile not found');
                        availabilityData = {
                            workDays: dto.workDays,
                            defaultDuration: dto.defaultDuration,
                            acceptsTeleconsultation: dto.acceptsTeleconsultation
                        };
                        Object.assign(profile, __assign(__assign({ tarifs: availabilityData }, (dto.disponTeleconsult !== undefined && { disponTeleconsult: dto.disponTeleconsult })), (dto.connexionVideoIntegree !== undefined && { connexionVideoIntegree: dto.connexionVideoIntegree })));
                        return [2 /*return*/, this.medecinProfileRepository.save(profile)];
                }
            });
        });
    };
    MedecinsService.prototype.getAvailability = function (userId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var profile, saved;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.medecinProfileRepository
                            .createQueryBuilder('profile')
                            .where('profile.user_id = :userId', { userId: userId })
                            .getOne()];
                    case 1:
                        profile = _d.sent();
                        if (!profile)
                            throw new common_1.NotFoundException('Profile not found');
                        saved = {};
                        if (profile.tarifs) {
                            try {
                                saved = typeof profile.tarifs === 'string'
                                    ? JSON.parse(profile.tarifs)
                                    : profile.tarifs;
                            }
                            catch (e) {
                                saved = {};
                            }
                        }
                        return [2 /*return*/, {
                                workDays: (_a = saved === null || saved === void 0 ? void 0 : saved.workDays) !== null && _a !== void 0 ? _a : null,
                                defaultDuration: (_b = saved === null || saved === void 0 ? void 0 : saved.defaultDuration) !== null && _b !== void 0 ? _b : 30,
                                acceptsTeleconsultation: (_c = saved === null || saved === void 0 ? void 0 : saved.acceptsTeleconsultation) !== null && _c !== void 0 ? _c : true,
                                disponTeleconsult: profile.disponTeleconsult,
                                connexionVideoIntegree: profile.connexionVideoIntegree
                            }];
                }
            });
        });
    };
    // Ajouter un patient à la liste du médecin
    MedecinsService.prototype.addPatientToDoctorList = function (doctorId, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var patientExists, existingRelation, newRelation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Service] \uD83D\uDD35 addPatientToDoctorList: doctor=" + doctorId + ", patient=" + patientId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: { id: patientId }
                            })];
                    case 2:
                        patientExists = _a.sent();
                        if (!patientExists) {
                            console.error("[Service] \u274C Patient " + patientId + " does not exist in users table!");
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Patient non trouvé dans la base de données',
                                    patient: null
                                }];
                        }
                        return [4 /*yield*/, this.doctorPatientRepository.findOne({
                                where: { doctorId: doctorId, patientId: patientId }
                            })];
                    case 3:
                        existingRelation = _a.sent();
                        if (!!existingRelation) return [3 /*break*/, 5];
                        newRelation = this.doctorPatientRepository.create({
                            doctorId: doctorId,
                            patientId: patientId,
                            addedAt: new Date(),
                            status: 'ACTIVE'
                        });
                        return [4 /*yield*/, this.doctorPatientRepository.save(newRelation)];
                    case 4:
                        _a.sent();
                        console.log("[Service] \u2705 Patient " + patientId + " added to doctor " + doctorId);
                        return [2 /*return*/, { success: true, patient: patientExists }];
                    case 5:
                        console.log("[Service] \u2139\uFE0F Patient " + patientId + " already in doctor " + doctorId + " list");
                        return [2 /*return*/, { success: false, message: 'Patient déjà dans la liste', patient: patientExists }];
                    case 6:
                        error_1 = _a.sent();
                        console.error('[Service] ❌ Error in addPatientToDoctorList:', error_1);
                        return [2 /*return*/, { success: false, message: error_1.message, patient: null }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Accepter un rendez-vous et ajouter le patient
    // Accepter un rendez-vous et ajouter le patient
    MedecinsService.prototype.acceptAppointment = function (doctorId, appointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            var appointment, patientExists, addedPatient, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("[Service] \uD83D\uDD35 acceptAppointment called with doctorId=" + doctorId + ", appointmentId=" + appointmentId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, this.appointmentRepository.findOne({
                                where: { id: appointmentId, doctorId: doctorId },
                                relations: ['patient']
                            })];
                    case 2:
                        appointment = _a.sent();
                        console.log("[Service] \uD83D\uDCCB Appointment found:", {
                            id: appointment === null || appointment === void 0 ? void 0 : appointment.id,
                            status: appointment === null || appointment === void 0 ? void 0 : appointment.status,
                            patientId: appointment === null || appointment === void 0 ? void 0 : appointment.patientId,
                            hasPatient: !!(appointment === null || appointment === void 0 ? void 0 : appointment.patient)
                        });
                        if (!appointment) {
                            throw new common_1.NotFoundException("Rendez-vous " + appointmentId + " non trouv\u00E9");
                        }
                        // Vérifier que le patient existe
                        if (!appointment.patientId) {
                            throw new common_1.BadRequestException('Le rendez-vous n\'a pas de patient associé');
                        }
                        return [4 /*yield*/, this.userRepository.findOne({
                                where: { id: appointment.patientId }
                            })];
                    case 3:
                        patientExists = _a.sent();
                        if (!patientExists) {
                            console.warn("[Service] \u26A0\uFE0F Patient " + appointment.patientId + " not found in users, but continuing with appointment acceptance");
                            // On continue quand même pour accepter le rendez-vous, même si le patient n'existe pas
                        }
                        if (!(appointment.status !== appointment_entity_1.AppointmentStatus.CONFIRMED)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.appointmentRepository.update({ id: appointmentId }, { status: appointment_entity_1.AppointmentStatus.CONFIRMED })];
                    case 4:
                        _a.sent();
                        console.log("[Service] \u2705 Appointment status updated to CONFIRMED");
                        return [3 /*break*/, 6];
                    case 5:
                        console.log("[Service] \u2139\uFE0F Appointment already confirmed");
                        _a.label = 6;
                    case 6:
                        addedPatient = null;
                        if (!patientExists) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.addPatientToDoctorList(doctorId, appointment.patientId)];
                    case 7:
                        addedPatient = _a.sent();
                        console.log("[Service] \uD83D\uDC64 Add patient result:", addedPatient);
                        return [3 /*break*/, 9];
                    case 8:
                        console.log("[Service] \u26A0\uFE0F Skipping adding patient to doctor list because patient doesn't exist");
                        _a.label = 9;
                    case 9: return [2 /*return*/, {
                            success: true,
                            message: patientExists
                                ? 'Rendez-vous accepté et patient ajouté à votre liste'
                                : 'Rendez-vous accepté (patient non trouvé dans la base)',
                            appointment: __assign(__assign({}, appointment), { status: appointment_entity_1.AppointmentStatus.CONFIRMED }),
                            patient: patientExists || null
                        }];
                    case 10:
                        error_2 = _a.sent();
                        console.error('[Service] ❌ Error in acceptAppointment:', error_2);
                        throw error_2;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // Récupérer tous les patients du médecin
    MedecinsService.prototype.getMyPatients = function (doctorId) {
        return __awaiter(this, void 0, void 0, function () {
            var relations, patientIds, patients;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doctorPatientRepository.find({
                            where: { doctorId: doctorId, status: 'ACTIVE' }
                        })];
                    case 1:
                        relations = _a.sent();
                        patientIds = relations.map(function (rel) { return rel.patientId; });
                        if (patientIds.length === 0) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, this.userRepository
                                .createQueryBuilder('user')
                                .where('user.id IN (:...ids)', { ids: patientIds })
                                .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
                                .getMany()];
                    case 2:
                        patients = _a.sent();
                        return [2 /*return*/, patients];
                }
            });
        });
    };
    // Vérifier si un patient est dans la liste du médecin
    MedecinsService.prototype.isPatientInDoctorList = function (doctorId, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doctorPatientRepository.findOne({
                            where: { doctorId: doctorId, patientId: patientId }
                        })];
                    case 1:
                        relation = _a.sent();
                        return [2 /*return*/, !!relation];
                }
            });
        });
    };
    MedecinsService.prototype.getMyPatientsFromAppointments = function (doctorId) {
        return __awaiter(this, void 0, void 0, function () {
            var appointments, seen, _loop_1, _i, appointments_1, appt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.appointmentRepository.find({
                            where: [
                                { doctorId: doctorId, status: appointment_entity_1.AppointmentStatus.CONFIRMED },
                                { doctorId: doctorId, status: appointment_entity_1.AppointmentStatus.COMPLETED },
                            ],
                            relations: ['patient']
                        })];
                    case 1:
                        appointments = _a.sent();
                        seen = new Map();
                        _loop_1 = function (appt) {
                            if (appt.patient && !seen.has(appt.patient.email)) {
                                seen.set(appt.patient.email, {
                                    id: appt.patient.id,
                                    email: appt.patient.email,
                                    firstName: appt.patient.firstName,
                                    lastName: appt.patient.lastName,
                                    phone: appt.patient.phone,
                                    rdvCount: appointments.filter(function (a) { return a.patientId === appt.patientId; }).length
                                });
                            }
                        };
                        for (_i = 0, appointments_1 = appointments; _i < appointments_1.length; _i++) {
                            appt = appointments_1[_i];
                            _loop_1(appt);
                        }
                        return [2 /*return*/, Array.from(seen.values())];
                }
            });
        });
    };
    // Supprimer un patient de la liste
    MedecinsService.prototype.removePatientFromDoctorList = function (doctorId, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            var relation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.doctorPatientRepository.findOne({
                            where: { doctorId: doctorId, patientId: patientId }
                        })];
                    case 1:
                        relation = _a.sent();
                        if (!relation) {
                            throw new common_1.NotFoundException('Patient non trouvé dans la liste');
                        }
                        return [4 /*yield*/, this.doctorPatientRepository.remove(relation)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { success: true, message: 'Patient retiré de la liste' }];
                }
            });
        });
    };
    MedecinsService.prototype.saveBase64Image = function (base64String, folder) {
        return __awaiter(this, void 0, Promise, function () {
            var matches, extension, imageData, buffer, uploadDir, fileName, filePath;
            return __generator(this, function (_a) {
                try {
                    matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                    if (!matches || matches.length !== 3) {
                        throw new common_1.BadRequestException('Format d\'image invalide');
                    }
                    extension = matches[1];
                    imageData = matches[2];
                    buffer = Buffer.from(imageData, 'base64');
                    uploadDir = path.join(process.cwd(), 'uploads', folder);
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    fileName = uuid_1.v4() + "." + extension;
                    filePath = path.join(uploadDir, fileName);
                    fs.writeFileSync(filePath, buffer);
                    return [2 /*return*/, "/uploads/" + folder + "/" + fileName];
                }
                catch (error) {
                    console.error('Error saving image:', error);
                    throw new common_1.BadRequestException('Erreur lors de la sauvegarde de l\'image');
                }
                return [2 /*return*/];
            });
        });
    };
    MedecinsService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(medecin_profile_entity_1.MedecinProfile)),
        __param(1, typeorm_1.InjectRepository(doctor_patient_entity_1.DoctorPatient)),
        __param(2, typeorm_1.InjectRepository(user_entity_1.User)),
        __param(3, typeorm_1.InjectRepository(appointment_entity_1.Appointment))
    ], MedecinsService);
    return MedecinsService;
}());
exports.MedecinsService = MedecinsService;
