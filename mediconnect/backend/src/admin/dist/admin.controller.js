"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.AdminController = exports.Roles = exports.ROLES_KEY = void 0;
var common_1 = require("@nestjs/common");
var passport_1 = require("@nestjs/passport");
var swagger_1 = require("@nestjs/swagger");
var user_entity_1 = require("../modules/users/entities/user.entity");
var JwtAuthGuard = /** @class */ (function (_super) {
    __extends(JwtAuthGuard, _super);
    function JwtAuthGuard() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    JwtAuthGuard = __decorate([
        common_1.Injectable()
    ], JwtAuthGuard);
    return JwtAuthGuard;
}(passport_1.AuthGuard('jwt')));
exports.ROLES_KEY = 'roles';
exports.Roles = function () {
    var roles = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        roles[_i] = arguments[_i];
    }
    return common_1.SetMetadata(exports.ROLES_KEY, roles);
};
var RolesGuard = /** @class */ (function () {
    function RolesGuard(reflector) {
        this.reflector = reflector;
    }
    RolesGuard.prototype.canActivate = function (context) {
        var requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles)
            return true;
        var user = context.switchToHttp().getRequest().user;
        if (!user)
            throw new common_1.UnauthorizedException();
        return requiredRoles.includes(user.role);
    };
    RolesGuard = __decorate([
        common_1.Injectable()
    ], RolesGuard);
    return RolesGuard;
}());
// ✅ Juste 'admin' — NestJS ajoute automatiquement le globalPrefix 'api/v1'
var AdminController = /** @class */ (function () {
    function AdminController(adminService) {
        this.adminService = adminService;
    }
    AdminController.prototype.getStats = function () {
        return this.adminService.getStats();
    };
    AdminController.prototype.getUsers = function (role, status, search, page, limit) {
        if (page === void 0) { page = 1; }
        if (limit === void 0) { limit = 20; }
        return this.adminService.getUsers({ role: role, status: status, search: search, page: +page, limit: +limit });
    };
    AdminController.prototype.getUserById = function (id) {
        return this.adminService.getUserById(id);
    };
    AdminController.prototype.createUser = function (dto) {
        return this.adminService.createUser(dto);
    };
    AdminController.prototype.updateUser = function (id, dto) {
        return this.adminService.updateUser(id, dto);
    };
    AdminController.prototype.deleteUser = function (id) {
        return this.adminService.deleteUser(id);
    };
    AdminController.prototype.resetPassword = function (id) {
        return this.adminService.resetPassword(id);
    };
    AdminController.prototype.getDoctorDocuments = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.adminService.getDoctorDocuments(id)];
            });
        });
    };
    __decorate([
        common_1.Get('stats'),
        swagger_1.ApiOperation({ summary: 'Statistiques globales utilisateurs' })
    ], AdminController.prototype, "getStats");
    __decorate([
        common_1.Get('users'),
        swagger_1.ApiQuery({ name: 'role', required: false, "enum": user_entity_1.UserRole }),
        swagger_1.ApiQuery({ name: 'status', required: false, "enum": user_entity_1.UserStatus }),
        swagger_1.ApiQuery({ name: 'search', required: false }),
        swagger_1.ApiQuery({ name: 'page', required: false, type: Number }),
        swagger_1.ApiQuery({ name: 'limit', required: false, type: Number }),
        __param(0, common_1.Query('role')),
        __param(1, common_1.Query('status')),
        __param(2, common_1.Query('search')),
        __param(3, common_1.Query('page')),
        __param(4, common_1.Query('limit'))
    ], AdminController.prototype, "getUsers");
    __decorate([
        common_1.Get('users/:id'),
        __param(0, common_1.Param('id'))
    ], AdminController.prototype, "getUserById");
    __decorate([
        common_1.Post('users'),
        __param(0, common_1.Body())
    ], AdminController.prototype, "createUser");
    __decorate([
        common_1.Patch('users/:id'),
        __param(0, common_1.Param('id')), __param(1, common_1.Body())
    ], AdminController.prototype, "updateUser");
    __decorate([
        common_1.Delete('users/:id'),
        common_1.HttpCode(common_1.HttpStatus.OK),
        __param(0, common_1.Param('id'))
    ], AdminController.prototype, "deleteUser");
    __decorate([
        common_1.Post('users/:id/reset-password'),
        __param(0, common_1.Param('id'))
    ], AdminController.prototype, "resetPassword");
    __decorate([
        common_1.Get('users/:id/documents'),
        swagger_1.ApiOperation({ summary: 'Documents soumis par un médecin' }),
        __param(0, common_1.Param('id'))
    ], AdminController.prototype, "getDoctorDocuments");
    AdminController = __decorate([
        swagger_1.ApiTags('Admin'),
        swagger_1.ApiBearerAuth(),
        common_1.UseGuards(JwtAuthGuard, RolesGuard),
        exports.Roles(user_entity_1.UserRole.ADMIN_SYSTEM),
        common_1.Controller('admin')
    ], AdminController);
    return AdminController;
}());
exports.AdminController = AdminController;
