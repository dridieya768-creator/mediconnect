"use strict";
// auth.controller.ts — remplacez l'import et le décorateur
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
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var platform_express_1 = require("@nestjs/platform-express"); // ← changer ici
var multer_1 = require("multer");
var path_1 = require("path");
var fs = require("fs");
var jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
var AuthController = /** @class */ (function () {
    function AuthController(authService) {
        this.authService = authService;
    }
    AuthController.prototype.register = function (dto, files) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (files === null || files === void 0 ? void 0 : files.length) {
                    dto.documents = files.map(function (f) { return ({
                        type: f.fieldname.replace("doc_", ""),
                        filename: f.filename,
                        originalName: f.originalname,
                        path: f.path
                    }); });
                }
                return [2 /*return*/, this.authService.register(dto)];
            });
        });
    };
    AuthController.prototype.login = function (dto) {
        return this.authService.login(dto);
    };
    AuthController.prototype.googleLogin = function (body) {
        return this.authService.googleLogin(body.token);
    };
    AuthController.prototype.facebookLogin = function (body) {
        return this.authService.facebookLogin(body.token);
    };
    AuthController.prototype.setup2fa = function (req) {
        return this.authService.setup2fa(req.user.id);
    };
    AuthController.prototype.enable2fa = function (req, dto) {
        return this.authService.enable2fa(req.user.id, dto);
    };
    AuthController.prototype.disable2fa = function (req) {
        return this.authService.disable2fa(req.user.id);
    };
    AuthController.prototype.verify2fa = function (dto) {
        return this.authService.verify2fa(dto);
    };
    AuthController.prototype.forgotPassword = function (dto) {
        return this.authService.forgotPassword(dto);
    };
    AuthController.prototype.resetPassword = function (dto) {
        return this.authService.resetPassword(dto);
    };
    __decorate([
        common_1.Post("register"),
        swagger_1.ApiOperation({ summary: "US1 - Créer un compte" }),
        swagger_1.ApiConsumes("multipart/form-data", "application/json"),
        common_1.UseInterceptors(platform_express_1.AnyFilesInterceptor({
            storage: multer_1.diskStorage({
                destination: function (req, file, cb) {
                    var dir = path_1.join(process.cwd(), "uploads", "doctor-docs");
                    fs.mkdirSync(dir, { recursive: true });
                    cb(null, dir);
                },
                filename: function (req, file, cb) {
                    var unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
                    cb(null, unique + path_1.extname(file.originalname));
                }
            }),
            fileFilter: function (req, file, cb) {
                if (file.mimetype === "application/pdf") {
                    cb(null, true);
                }
                else {
                    cb(new Error("Seuls les fichiers PDF sont acceptés"), false);
                }
            },
            limits: { fileSize: 5 * 1024 * 1024 }
        })),
        __param(0, common_1.Body()),
        __param(1, common_1.UploadedFiles())
    ], AuthController.prototype, "register");
    __decorate([
        common_1.Post("login"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US2 - Se connecter" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "login");
    __decorate([
        common_1.Post("sso/google"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US3 - Login via Google SSO" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "googleLogin");
    __decorate([
        common_1.Post("sso/facebook"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US3 - Login via Facebook SSO" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "facebookLogin");
    __decorate([
        common_1.Post("2fa/setup"),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "US4 - Générer QR code 2FA" }),
        __param(0, common_1.Request())
    ], AuthController.prototype, "setup2fa");
    __decorate([
        common_1.Post("2fa/enable"),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "US4 - Activer le 2FA" }),
        __param(0, common_1.Request()), __param(1, common_1.Body())
    ], AuthController.prototype, "enable2fa");
    __decorate([
        common_1.Post("2fa/disable"),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
        swagger_1.ApiBearerAuth(),
        swagger_1.ApiOperation({ summary: "US4 - Désactiver le 2FA" }),
        __param(0, common_1.Request())
    ], AuthController.prototype, "disable2fa");
    __decorate([
        common_1.Post("2fa/verify"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US4 - Vérifier code 2FA" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "verify2fa");
    __decorate([
        common_1.Post("forgot-password"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US5 - Demander réinitialisation mot de passe" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "forgotPassword");
    __decorate([
        common_1.Post("reset-password"),
        common_1.HttpCode(common_1.HttpStatus.OK),
        swagger_1.ApiOperation({ summary: "US5 - Réinitialiser le mot de passe" }),
        __param(0, common_1.Body())
    ], AuthController.prototype, "resetPassword");
    AuthController = __decorate([
        swagger_1.ApiTags("auth"),
        common_1.Controller("auth")
    ], AuthController);
    return AuthController;
}());
exports.AuthController = AuthController;
