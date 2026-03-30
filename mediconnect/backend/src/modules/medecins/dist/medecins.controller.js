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
exports.MedecinsController = exports.UpdateMedecinProfileDto = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
var current_user_decorator_1 = require("@common/decorators/current-user.decorator");
// DTO
var UpdateMedecinProfileDto = /** @class */ (function () {
    function UpdateMedecinProfileDto() {
    }
    return UpdateMedecinProfileDto;
}());
exports.UpdateMedecinProfileDto = UpdateMedecinProfileDto;
var MedecinsController = /** @class */ (function () {
    function MedecinsController(medecinsService) {
        this.medecinsService = medecinsService;
    }
    MedecinsController.prototype.updateAvailability = function (user, dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('[availability] body received:', dto);
                return [2 /*return*/, this.medecinsService.updateAvailability(user.id, dto)];
            });
        });
    };
    MedecinsController.prototype.getAvailability = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.getAvailability(user.id)];
            });
        });
    };
    // ✅ CORRECTION : Utiliser @CurrentUser() au lieu de @Request()
    MedecinsController.prototype.acceptAppointment = function (user, appointmentId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("[Controller] Accepting appointment " + appointmentId + " for doctor " + user.id);
                return [2 /*return*/, this.medecinsService.acceptAppointment(user.id, appointmentId)];
            });
        });
    };
    MedecinsController.prototype.getMe = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            var profile;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.medecinsService.getProfile(user.id)];
                    case 1:
                        profile = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, user), { id: user.id, data: __assign(__assign({}, user), { id: user.id, profile: profile }) })];
                }
            });
        });
    };
    MedecinsController.prototype.removePatient = function (user, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.removePatientFromDoctorList(user.id, patientId)];
            });
        });
    };
    MedecinsController.prototype.checkPatient = function (user, patientId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.isPatientInDoctorList(user.id, patientId)];
            });
        });
    };
    MedecinsController.prototype.getProfile = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.getProfile(user.id)];
            });
        });
    };
    MedecinsController.prototype.updateProfile = function (user, updateDto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.updateProfile(user.id, updateDto)];
            });
        });
    };
    MedecinsController.prototype.getAllMedecins = function (search, specialite, ville) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.getAllMedecinsWithProfiles(search, specialite, ville)];
            });
        });
    };
    MedecinsController.prototype.getMedecinById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.getProfile(id)];
            });
        });
    };
    MedecinsController.prototype.getMyPatients = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.medecinsService.getMyPatientsFromAppointments(user.id)];
            });
        });
    };
    __decorate([
        common_1.Put('availability'),
        __param(0, current_user_decorator_1.CurrentUser()), __param(1, common_1.Body())
    ], MedecinsController.prototype, "updateAvailability");
    __decorate([
        common_1.Get('availability'),
        __param(0, current_user_decorator_1.CurrentUser())
    ], MedecinsController.prototype, "getAvailability");
    __decorate([
        common_1.Patch('appointments/:appointmentId/accept'),
        __param(0, current_user_decorator_1.CurrentUser()),
        __param(1, common_1.Param('appointmentId'))
    ], MedecinsController.prototype, "acceptAppointment");
    __decorate([
        common_1.Get('me'),
        __param(0, current_user_decorator_1.CurrentUser())
    ], MedecinsController.prototype, "getMe");
    __decorate([
        common_1.Delete('patients/:patientId'),
        __param(0, current_user_decorator_1.CurrentUser()),
        __param(1, common_1.Param('patientId'))
    ], MedecinsController.prototype, "removePatient");
    __decorate([
        common_1.Get('patients/:patientId/check'),
        __param(0, current_user_decorator_1.CurrentUser()),
        __param(1, common_1.Param('patientId'))
    ], MedecinsController.prototype, "checkPatient");
    __decorate([
        common_1.Get('profile'),
        __param(0, current_user_decorator_1.CurrentUser())
    ], MedecinsController.prototype, "getProfile");
    __decorate([
        common_1.Put('profile'),
        __param(0, current_user_decorator_1.CurrentUser()), __param(1, common_1.Body())
    ], MedecinsController.prototype, "updateProfile");
    __decorate([
        common_1.Get(),
        __param(0, common_1.Query('search')),
        __param(1, common_1.Query('specialite')),
        __param(2, common_1.Query('ville'))
    ], MedecinsController.prototype, "getAllMedecins");
    __decorate([
        common_1.Get(':id'),
        __param(0, common_1.Param('id'))
    ], MedecinsController.prototype, "getMedecinById");
    __decorate([
        common_1.Get('my-patients'),
        __param(0, current_user_decorator_1.CurrentUser())
    ], MedecinsController.prototype, "getMyPatients");
    MedecinsController = __decorate([
        common_1.Controller('medecins'),
        common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard)
    ], MedecinsController);
    return MedecinsController;
}());
exports.MedecinsController = MedecinsController;
