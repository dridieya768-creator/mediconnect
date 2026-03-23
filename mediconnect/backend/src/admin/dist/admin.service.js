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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.AdminService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var user_entity_1 = require("../modules/users/entities/user.entity");
var bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
var AdminService = /** @class */ (function () {
    function AdminService(userRepository, configService) {
        this.userRepository = userRepository;
        this.configService = configService;
    }
    AdminService.prototype.getUsers = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var role, status, search, _a, page, _b, limit, qb, _c, data, total;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        role = query.role, status = query.status, search = query.search, _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 20 : _b;
                        qb = this.userRepository
                            .createQueryBuilder('user')
                            .orderBy('user.createdAt', 'DESC')
                            .skip((page - 1) * limit)
                            .take(limit);
                        if (role)
                            qb.andWhere('user.role = :role', { role: role });
                        if (status)
                            qb.andWhere('user.status = :status', { status: status });
                        if (search) {
                            qb.andWhere('(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)', { s: "%" + search.toLowerCase() + "%" });
                        }
                        return [4 /*yield*/, qb.getManyAndCount()];
                    case 1:
                        _c = _d.sent(), data = _c[0], total = _c[1];
                        return [2 /*return*/, { data: data.map(function (u) { return _this.sanitize(u); }), total: total, page: page, limit: limit }];
                }
            });
        });
    };
    AdminService.prototype.getUserById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('Utilisateur introuvable');
                        return [2 /*return*/, this.sanitize(user)];
                }
            });
        });
    };
    AdminService.prototype.createUser = function (dto) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existing, hashedPassword, user, saved;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { email: dto.email } })];
                    case 1:
                        existing = _b.sent();
                        if (existing)
                            throw new common_1.ConflictException('Email déjà utilisé');
                        return [4 /*yield*/, bcrypt.hash(dto.password, 12)];
                    case 2:
                        hashedPassword = _b.sent();
                        user = this.userRepository.create(__assign(__assign({}, dto), { password: hashedPassword, status: (_a = dto.status) !== null && _a !== void 0 ? _a : user_entity_1.UserStatus.ACTIVE }));
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 3:
                        saved = _b.sent();
                        return [2 /*return*/, this.sanitize(saved)];
                }
            });
        });
    };
    AdminService.prototype.updateUser = function (id, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, oldStatus, saved, isMedecin, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('Utilisateur introuvable');
                        oldStatus = user.status;
                        Object.assign(user, dto);
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 2:
                        saved = _a.sent();
                        isMedecin = saved.role.startsWith('MEDECIN');
                        if (!(isMedecin && dto.status && dto.status !== oldStatus)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.sendDoctorStatusEmail(saved, dto.status)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        console.warn('[Admin] Erreur envoi email médecin:', e_1.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, this.sanitize(saved)];
                }
            });
        });
    };
    AdminService.prototype.sendDoctorStatusEmail = function (user, newStatus) {
        return __awaiter(this, void 0, void 0, function () {
            var transporter, isApproved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transporter = nodemailer.createTransport({
                            host: this.configService.get('SMTP_HOST'),
                            port: Number(this.configService.get('SMTP_PORT')),
                            secure: false,
                            auth: {
                                user: this.configService.get('SMTP_USER'),
                                pass: this.configService.get('SMTP_PASS')
                            },
                            tls: { rejectUnauthorized: false }
                        });
                        isApproved = newStatus === 'ACTIVE';
                        return [4 /*yield*/, transporter.sendMail({
                                from: '"MediConnect" <dridieya768@gmail.com>',
                                to: user.email,
                                subject: isApproved
                                    ? '✅ Votre compte MediConnect a été approuvé'
                                    : '❌ Votre inscription MediConnect a été refusée',
                                html: isApproved ? "\n        <div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;\">\n          <h2 style=\"color:#16a34a;\">\u2705 Compte approuv\u00E9 !</h2>\n          <p>Bonjour Dr. <strong>" + user.firstName + " " + user.lastName + "</strong>,</p>\n          <p>Votre compte MediConnect a \u00E9t\u00E9 <strong>approuv\u00E9</strong> par l'administrateur.</p>\n          <a href=\"http://localhost:4200/auth/login\"\n             style=\"display:inline-block;background:#16a34a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;\">\n            Se connecter\n          </a>\n          <p style=\"color:#666;font-size:12px;\">Bienvenue sur MediConnect \uD83C\uDFE5</p>\n        </div>\n      " : "\n        <div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;\">\n          <h2 style=\"color:#dc2626;\">\u274C Inscription refus\u00E9e</h2>\n          <p>Bonjour Dr. <strong>" + user.firstName + " " + user.lastName + "</strong>,</p>\n          <p>Votre demande d'inscription sur MediConnect a \u00E9t\u00E9 <strong>refus\u00E9e</strong>.</p>\n          <p>Contactez <a href=\"mailto:support@mediconnect.tn\">support@mediconnect.tn</a> pour plus d'infos.</p>\n        </div>\n      "
                            })];
                    case 1:
                        _a.sent();
                        console.log("[Admin] \u2705 Email envoy\u00E9 \u00E0 " + user.email + " \u2192 " + newStatus);
                        return [2 /*return*/];
                }
            });
        });
    };
    AdminService.prototype.deleteUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('Utilisateur introuvable');
                        return [4 /*yield*/, this.userRepository.softDelete(id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { message: 'Utilisateur supprimé' }];
                }
            });
        });
    };
    AdminService.prototype.resetPassword = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, tempPassword, hashed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: id } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException('Utilisateur introuvable');
                        tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
                        return [4 /*yield*/, bcrypt.hash(tempPassword, 12)];
                    case 2:
                        hashed = _a.sent();
                        return [4 /*yield*/, this.userRepository.update(id, { password: hashed })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, { message: "Mot de passe r\u00E9initialis\u00E9 pour " + user.email }];
                }
            });
        });
    };
    // ✅ Requête fixe — colonnes confirmées dans les logs
    AdminService.prototype.getDoctorDocuments = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var docs, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.userRepository.query("SELECT id, user_id, type, filename, original_name, file_path, base64, status, created_at\n         FROM doctor_documents\n         WHERE user_id = $1\n         ORDER BY created_at ASC", [userId])];
                    case 1:
                        docs = _a.sent();
                        return [2 /*return*/, docs];
                    case 2:
                        err_1 = _a.sent();
                        console.error('[Admin] getDoctorDocuments error:', err_1.message);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AdminService.prototype.getStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var total, actifs, patients, medecins;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.createQueryBuilder('user').getCount()];
                    case 1:
                        total = _a.sent();
                        return [4 /*yield*/, this.userRepository
                                .createQueryBuilder('user')
                                .where('user.status = :status', { status: user_entity_1.UserStatus.ACTIVE })
                                .getCount()];
                    case 2:
                        actifs = _a.sent();
                        return [4 /*yield*/, this.userRepository
                                .createQueryBuilder('user')
                                .where('user.role = :role', { role: user_entity_1.UserRole.PATIENT })
                                .getCount()];
                    case 3:
                        patients = _a.sent();
                        return [4 /*yield*/, this.userRepository
                                .createQueryBuilder('user')
                                .where('user.role IN (:...roles)', {
                                roles: [
                                    user_entity_1.UserRole.MEDECIN_GENERALISTE,
                                    user_entity_1.UserRole.MEDECIN_SPECIALISTE,
                                    user_entity_1.UserRole.MEDECIN_CHEF_SERVICE,
                                    user_entity_1.UserRole.MEDECIN_URGENTISTE,
                                ]
                            })
                                .getCount()];
                    case 4:
                        medecins = _a.sent();
                        return [2 /*return*/, { total: total, actifs: actifs, medecins: medecins, patients: patients }];
                }
            });
        });
    };
    AdminService.prototype.sanitize = function (user) {
        var _a = user, password = _a.password, refreshToken = _a.refreshToken, mfaSecret = _a.mfaSecret, safe = __rest(_a, ["password", "refreshToken", "mfaSecret"]);
        return safe;
    };
    AdminService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(user_entity_1.User))
    ], AdminService);
    return AdminService;
}());
exports.AdminService = AdminService;
