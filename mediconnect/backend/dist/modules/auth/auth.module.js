"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const local_strategy_1 = require("./strategies/local.strategy");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const pharmacien_profile_entity_1 = require("../pharmacie/entities/pharmacien-profile.entity");
const notifications_module_1 = require("../notifications/notifications.module");
const platform_express_1 = require("@nestjs/platform-express");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({ dest: "./uploads" }),
            passport_1.PassportModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, patient_entity_1.Patient, pharmacien_profile_entity_1.PharmacienProfile]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    secret: configService.get("JWT_SECRET", "mediconnect-secret"),
                    signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN", "7d") },
                }),
                inject: [config_1.ConfigService],
            }),
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
        ],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, local_strategy_1.LocalStrategy],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService, jwt_1.JwtModule, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map