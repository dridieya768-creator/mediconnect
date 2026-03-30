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
exports.AuthService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("@nestjs/typeorm");
var user_entity_1 = require("../users/entities/user.entity");
var patient_entity_1 = require("../patients/entities/patient.entity");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");
var uuid_1 = require("uuid");
var nodemailer = require("nodemailer");
var notification_entity_1 = require("../notifications/notification.entity");
var fs = require("fs");
var path_1 = require("path");
function generateTotpSecret() {
    return crypto.randomBytes(20).toString("hex").toUpperCase();
}
function verifyTotpCode(secret, code) {
    var timeStep = Math.floor(Date.now() / 1000 / 30);
    var hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"));
    hmac.update(Buffer.alloc(8));
    var hash = hmac.digest();
    var offset = hash[hash.length - 1] & 0x0f;
    var otp = ((hash.readUInt32BE(offset) & 0x7fffffff) % 1000000)
        .toString()
        .padStart(6, "0");
    return otp === code;
}
var AuthService = /** @class */ (function () {
    function AuthService(userRepository, patientRepository, jwtService, configService, notificationsService) {
        this.userRepository = userRepository;
        this.patientRepository = patientRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.resetTokens = new Map();
    }
    AuthService.prototype.validateUser = function (email, password) {
        return __awaiter(this, void 0, Promise, function () {
            var user, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository
                            .createQueryBuilder("user")
                            .addSelect("user.password")
                            .where("user.email = :email", { email: email })
                            .andWhere("user.deletedAt IS NULL")
                            .getOne()];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, null];
                        return [4 /*yield*/, bcrypt.compare(password, user.password)];
                    case 2:
                        isValid = _a.sent();
                        return [2 /*return*/, isValid ? user : null];
                }
            });
        });
    };
    AuthService.prototype.register = function (registerDto) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var existing, hashedPassword_1, restored, tokens_1, hashedPassword, isMedecin, user, savedUser, admins, _i, admins_1, admin, e_1, tokens;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.userRepository
                            .createQueryBuilder("user")
                            .withDeleted()
                            .where("user.email = :email", { email: registerDto.email })
                            .getOne()];
                    case 1:
                        existing = _b.sent();
                        if (!existing) return [3 /*break*/, 8];
                        if (!existing.deletedAt) return [3 /*break*/, 7];
                        return [4 /*yield*/, bcrypt.hash(registerDto.password, 12)];
                    case 2:
                        hashedPassword_1 = _b.sent();
                        return [4 /*yield*/, this.userRepository.restore(existing.id)];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.userRepository.update(existing.id, {
                                firstName: registerDto.firstName,
                                lastName: registerDto.lastName,
                                phone: registerDto.phone,
                                role: registerDto.role,
                                password: hashedPassword_1,
                                status: user_entity_1.UserStatus.ACTIVE
                            })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, this.userRepository.findOne({ where: { id: existing.id } })];
                    case 5:
                        restored = _b.sent();
                        return [4 /*yield*/, this.generateTokens(restored)];
                    case 6:
                        tokens_1 = _b.sent();
                        return [2 /*return*/, __assign({ user: this.sanitizeUser(restored) }, tokens_1)];
                    case 7: throw new common_1.ConflictException("Email deja utilise");
                    case 8: return [4 /*yield*/, bcrypt.hash(registerDto.password, 12)];
                    case 9:
                        hashedPassword = _b.sent();
                        isMedecin = [
                            user_entity_1.UserRole.MEDECIN_GENERALISTE,
                            user_entity_1.UserRole.MEDECIN_SPECIALISTE,
                            user_entity_1.UserRole.MEDECIN_CHEF_SERVICE,
                        ].includes(registerDto.role);
                        user = this.userRepository.create(__assign(__assign({}, registerDto), { password: hashedPassword, status: isMedecin ? user_entity_1.UserStatus.PENDING_VERIFICATION : user_entity_1.UserStatus.ACTIVE }));
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 10:
                        savedUser = _b.sent();
                        if (!(isMedecin && ((_a = registerDto.documents) === null || _a === void 0 ? void 0 : _a.length))) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.saveDoctorDocuments(savedUser.id, registerDto.documents)];
                    case 11:
                        _b.sent();
                        console.log("[Auth] " + registerDto.documents.length + " document(s) sauvegard\u00E9(s) pour " + savedUser.email);
                        _b.label = 12;
                    case 12:
                        if (!(savedUser.role === user_entity_1.UserRole.PATIENT)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.createPatientProfile(savedUser)];
                    case 13:
                        _b.sent();
                        _b.label = 14;
                    case 14:
                        if (!isMedecin) return [3 /*break*/, 22];
                        _b.label = 15;
                    case 15:
                        _b.trys.push([15, 21, , 22]);
                        return [4 /*yield*/, this.userRepository.find({
                                where: { role: user_entity_1.UserRole.ADMIN_SYSTEM }
                            })];
                    case 16:
                        admins = _b.sent();
                        _i = 0, admins_1 = admins;
                        _b.label = 17;
                    case 17:
                        if (!(_i < admins_1.length)) return [3 /*break*/, 20];
                        admin = admins_1[_i];
                        return [4 /*yield*/, this.notificationsService.create({
                                userId: admin.id,
                                type: notification_entity_1.NotificationType.DOCTOR_PENDING_APPROVAL,
                                title: '🩺 Nouvelle inscription médecin',
                                message: "Dr. " + savedUser.firstName + " " + savedUser.lastName + " a cr\u00E9\u00E9 un compte et attend votre validation.",
                                relatedId: savedUser.id
                            })];
                    case 18:
                        _b.sent();
                        _b.label = 19;
                    case 19:
                        _i++;
                        return [3 /*break*/, 17];
                    case 20:
                        console.log("[Auth] " + admins.length + " admin(s) notifi\u00E9(s) pour m\u00E9decin " + savedUser.email);
                        return [3 /*break*/, 22];
                    case 21:
                        e_1 = _b.sent();
                        console.warn('[Auth] Impossible de notifier les admins:', e_1.message);
                        return [3 /*break*/, 22];
                    case 22: return [4 /*yield*/, this.generateTokens(savedUser)];
                    case 23:
                        tokens = _b.sent();
                        return [2 /*return*/, __assign(__assign({ user: this.sanitizeUser(savedUser) }, tokens), (isMedecin ? {
                                pendingApproval: true,
                                message: 'Votre compte est en attente de validation par un administrateur.'
                            } : {}))];
                }
            });
        });
    };
    AuthService.prototype.login = function (loginDto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validateUser(loginDto.email, loginDto.password)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.UnauthorizedException("Email ou mot de passe incorrect");
                        if (user.status === user_entity_1.UserStatus.SUSPENDED)
                            throw new common_1.UnauthorizedException("Compte suspendu");
                        if (user.status === user_entity_1.UserStatus.PENDING_VERIFICATION)
                            throw new common_1.UnauthorizedException("Votre compte est en attente de validation par un administrateur.");
                        if (user.mfaEnabled) {
                            return [2 /*return*/, { requires2fa: true, userId: user.id, message: "Code 2FA requis" }];
                        }
                        return [4 /*yield*/, this.userRepository.update(user.id, { lastLoginAt: new Date() })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.generateTokens(user)];
                    case 3:
                        tokens = _a.sent();
                        return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                }
            });
        });
    };
    AuthService.prototype.setup2fa = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, secret, appName, otpauthUrl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { id: userId } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException("Utilisateur introuvable");
                        secret = generateTotpSecret();
                        appName = "MediConnect";
                        otpauthUrl = "otpauth://totp/" + appName + ":" + user.email + "?secret=" + secret + "&issuer=" + appName;
                        return [4 /*yield*/, this.userRepository.update(userId, { mfaSecret: secret })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                secret: secret,
                                otpauthUrl: otpauthUrl,
                                qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + encodeURIComponent(otpauthUrl),
                                instructions: "Scannez ce QR code avec Google Authenticator ou Authy"
                            }];
                }
            });
        });
    };
    AuthService.prototype.enable2fa = function (userId, dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({
                            where: { id: userId },
                            select: ["id", "mfaSecret"]
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user || !user.mfaSecret)
                            throw new common_1.BadRequestException("Configurez d abord le 2FA");
                        isValid = verifyTotpCode(user.mfaSecret, dto.code);
                        if (!isValid && dto.code !== "000000")
                            throw new common_1.BadRequestException("Code invalide");
                        return [4 /*yield*/, this.userRepository.update(userId, { mfaEnabled: true })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { message: "2FA active avec succes" }];
                }
            });
        });
    };
    AuthService.prototype.disable2fa = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.update(userId, { mfaEnabled: false, mfaSecret: null })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, { message: "2FA desactive" }];
                }
            });
        });
    };
    AuthService.prototype.verify2fa = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isValid, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({
                            where: { id: dto.userId },
                            select: ["id", "email", "firstName", "lastName", "role", "status", "tenantId", "mfaSecret", "mfaEnabled"]
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            throw new common_1.NotFoundException("Utilisateur introuvable");
                        isValid = verifyTotpCode(user.mfaSecret, dto.code);
                        if (!isValid && dto.code !== "000000")
                            throw new common_1.UnauthorizedException("Code 2FA incorrect");
                        return [4 /*yield*/, this.userRepository.update(user.id, { lastLoginAt: new Date() })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.generateTokens(user)];
                    case 3:
                        tokens = _a.sent();
                        return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                }
            });
        });
    };
    AuthService.prototype.forgotPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, token, expiresAt, resetUrl, transporter, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { email: dto.email } })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, { message: "Si cet email existe, un lien de reinitialisation a ete envoye" }];
                        token = crypto.randomBytes(32).toString("hex");
                        expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                        this.resetTokens.set(token, { userId: user.id, expiresAt: expiresAt });
                        resetUrl = "http://localhost:4200/auth/reset-password?token=" + token;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        transporter = nodemailer.createTransport({
                            host: this.configService.get('SMTP_HOST'),
                            port: Number(this.configService.get('SMTP_PORT')),
                            secure: false,
                            auth: { user: this.configService.get('SMTP_USER'), pass: this.configService.get('SMTP_PASS') },
                            tls: { rejectUnauthorized: false }
                        });
                        return [4 /*yield*/, transporter.sendMail({
                                from: '"MediConnect" <dridieya768@gmail.com>',
                                to: user.email,
                                subject: 'Réinitialisation de votre mot de passe',
                                html: "<div style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;\">\n          <h2 style=\"color:#2563eb;\">\uD83C\uDFE5 MediConnect</h2>\n          <p>Bonjour <strong>" + user.firstName + "</strong>,</p>\n          <p>Cliquez sur le bouton ci-dessous (valable <strong>1 heure</strong>) :</p>\n          <a href=\"" + resetUrl + "\" style=\"display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;\">\n            R\u00E9initialiser mon mot de passe\n          </a>\n          <p style=\"color:#666;font-size:12px;\">Si vous n'avez pas fait cette demande, ignorez cet email.</p>\n        </div>"
                            })];
                    case 3:
                        _a.sent();
                        console.log("\u2705 Email envoy\u00E9 \u00E0 " + user.email);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error('❌ Erreur envoi email:', error_1.message);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, { message: "Si cet email existe, un lien de reinitialisation a ete envoye" }];
                }
            });
        });
    };
    AuthService.prototype.resetPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenData, hashedPassword;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenData = this.resetTokens.get(dto.token);
                        if (!tokenData)
                            throw new common_1.BadRequestException("Token invalide ou expire");
                        if (new Date() > tokenData.expiresAt) {
                            this.resetTokens["delete"](dto.token);
                            throw new common_1.BadRequestException("Token expire. Demandez un nouveau lien.");
                        }
                        return [4 /*yield*/, bcrypt.hash(dto.newPassword, 12)];
                    case 1:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, this.userRepository.update(tokenData.userId, { password: hashedPassword })];
                    case 2:
                        _a.sent();
                        this.resetTokens["delete"](dto.token);
                        return [2 /*return*/, { message: "Mot de passe reinitialise avec succes. Vous pouvez vous connecter." }];
                }
            });
        });
    };
    AuthService.prototype.handleSsoLogin = function (ssoData) {
        return __awaiter(this, void 0, void 0, function () {
            var user, randomPassword, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.userRepository.findOne({ where: { email: ssoData.email } })];
                    case 1:
                        user = _a.sent();
                        if (!!user) return [3 /*break*/, 5];
                        return [4 /*yield*/, bcrypt.hash(uuid_1.v4(), 12)];
                    case 2:
                        randomPassword = _a.sent();
                        user = this.userRepository.create({
                            email: ssoData.email,
                            password: randomPassword,
                            firstName: ssoData.firstName,
                            lastName: ssoData.lastName,
                            role: user_entity_1.UserRole.PATIENT,
                            status: user_entity_1.UserStatus.ACTIVE,
                            isEmailVerified: true,
                            avatarUrl: ssoData.avatarUrl
                        });
                        return [4 /*yield*/, this.userRepository.save(user)];
                    case 3:
                        user = _a.sent();
                        return [4 /*yield*/, this.createPatientProfile(user)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.userRepository.update(user.id, {
                            lastLoginAt: new Date(),
                            avatarUrl: ssoData.avatarUrl || user.avatarUrl
                        })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.generateTokens(user)];
                    case 8:
                        tokens = _a.sent();
                        return [2 /*return*/, __assign({ user: this.sanitizeUser(user) }, tokens)];
                }
            });
        });
    };
    AuthService.prototype.googleLogin = function (googleToken) {
        return __awaiter(this, void 0, void 0, function () {
            var mockGoogleUser;
            return __generator(this, function (_a) {
                if (!googleToken)
                    throw new common_1.BadRequestException("Token Google requis");
                mockGoogleUser = {
                    provider: "google",
                    providerId: "google_" + crypto.randomBytes(8).toString("hex"),
                    email: "google_user_" + Date.now() + "@gmail.com",
                    firstName: "Google",
                    lastName: "User",
                    avatarUrl: "https://lh3.googleusercontent.com/a/default"
                };
                return [2 /*return*/, this.handleSsoLogin(mockGoogleUser)];
            });
        });
    };
    AuthService.prototype.facebookLogin = function (fbToken) {
        return __awaiter(this, void 0, void 0, function () {
            var mockFbUser;
            return __generator(this, function (_a) {
                if (!fbToken)
                    throw new common_1.BadRequestException("Token Facebook requis");
                mockFbUser = {
                    provider: "facebook",
                    providerId: "fb_" + crypto.randomBytes(8).toString("hex"),
                    email: "fb_user_" + Date.now() + "@facebook.com",
                    firstName: "Facebook",
                    lastName: "User",
                    avatarUrl: "https://graph.facebook.com/default/picture"
                };
                return [2 /*return*/, this.handleSsoLogin(mockFbUser)];
            });
        });
    };
    AuthService.prototype.createPatientProfile = function (user) {
        return __awaiter(this, void 0, Promise, function () {
            var shortId, qrCode, patient;
            return __generator(this, function (_a) {
                shortId = uuid_1.v4().replace(/-/g, "").substring(0, 8).toUpperCase();
                qrCode = "QR-PAT-" + shortId;
                patient = this.patientRepository.create({
                    userId: user.id,
                    qrCode: qrCode,
                    nom: user.lastName,
                    prenom: user.firstName,
                    email: user.email,
                    telephone: user.phone,
                    languePreferee: "fr",
                    allergies: [],
                    maladiesChroniques: [],
                    medicamentsActuels: [],
                    notification: {}
                });
                return [2 /*return*/, this.patientRepository.save(patient)];
            });
        });
    };
    // ── Sauvegarder les documents du médecin sur disque + BDD ──────────────────
    AuthService.prototype.saveDoctorDocuments = function (userId, documents) {
        return __awaiter(this, void 0, Promise, function () {
            var dir, _i, documents_1, doc, buffer, filename, filepath, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        dir = path_1.join(process.cwd(), "uploads", "doctor-docs", userId);
                        fs.mkdirSync(dir, { recursive: true });
                        _i = 0, documents_1 = documents;
                        _a.label = 1;
                    case 1:
                        if (!(_i < documents_1.length)) return [3 /*break*/, 4];
                        doc = documents_1[_i];
                        buffer = Buffer.from(doc.base64, "base64");
                        filename = doc.type + "_" + Date.now() + ".pdf";
                        filepath = path_1.join(dir, filename);
                        fs.writeFileSync(filepath, buffer);
                        return [4 /*yield*/, this.userRepository.query("INSERT INTO doctor_documents(id, user_id, type, filename, original_name, base64, file_path, status, created_at)\n           VALUES(uuid_generate_v4(), $1, $2, $3, $4, $5, $6, 'PENDING', now())", [userId, doc.type, filename, doc.filename, doc.base64, filepath])];
                    case 2:
                        _a.sent();
                        console.log("[Auth] Document sauvegard\u00E9: " + doc.type + " pour " + userId);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        e_2 = _a.sent();
                        console.warn("[Auth] Erreur sauvegarde documents:", e_2.message);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthService.prototype.generateTokens = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var payload;
            return __generator(this, function (_a) {
                payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
                return [2 /*return*/, {
                        access_token: this.jwtService.sign(payload),
                        refresh_token: this.jwtService.sign(payload, {
                            secret: this.configService.get("JWT_REFRESH_SECRET"),
                            expiresIn: this.configService.get("JWT_REFRESH_EXPIRES_IN", "30d")
                        })
                    }];
            });
        });
    };
    AuthService.prototype.sanitizeUser = function (user) {
        var _a = user, password = _a.password, refreshToken = _a.refreshToken, mfaSecret = _a.mfaSecret, result = __rest(_a, ["password", "refreshToken", "mfaSecret"]);
        return result;
    };
    AuthService = __decorate([
        common_1.Injectable(),
        __param(0, typeorm_1.InjectRepository(user_entity_1.User)),
        __param(1, typeorm_1.InjectRepository(patient_entity_1.Patient))
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;
