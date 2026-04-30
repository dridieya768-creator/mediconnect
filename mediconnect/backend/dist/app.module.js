"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const upload_module_1 = require("./modules/upload/upload.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const patients_module_1 = require("./modules/patients/patients.module");
const medecins_module_1 = require("./modules/medecins/medecins.module");
const appointments_module_1 = require("./modules/appointments/appointments.module");
const prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
const pharmacie_module_1 = require("./modules/pharmacie/pharmacie.module");
const laboratoire_module_1 = require("./modules/laboratoire/laboratoire.module");
const radiologie_module_1 = require("./modules/radiologie/radiologie.module");
const qr_codes_module_1 = require("./modules/qr-codes/qr-codes.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const payments_module_1 = require("./modules/payments/payments.module");
const dossier_medical_module_1 = require("./modules/dossier-medical/dossier-medical.module");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            upload_module_1.UploadModule,
            config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'postgres'),
                    password: configService.get('DB_PASSWORD', ''),
                    database: configService.get('DB_DATABASE', 'mediconnect'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                    synchronize: false,
                    logging: configService.get('NODE_ENV') === 'development',
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            patients_module_1.PatientsModule,
            medecins_module_1.MedecinsModule,
            appointments_module_1.AppointmentsModule,
            prescriptions_module_1.PrescriptionsModule,
            pharmacie_module_1.PharmacieModule,
            laboratoire_module_1.LaboratoireModule,
            radiologie_module_1.RadiologieModule,
            qr_codes_module_1.QrCodesModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            dossier_medical_module_1.DossierMedicalModule,
            admin_module_1.AdminModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map