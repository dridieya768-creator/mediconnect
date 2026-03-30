"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.AppModule = void 0;
var common_1 = require("@nestjs/common");
var config_1 = require("@nestjs/config");
var typeorm_1 = require("@nestjs/typeorm");
var throttler_1 = require("@nestjs/throttler");
var upload_module_1 = require("./modules/upload/upload.module");
// Feature Modules
var auth_module_1 = require("./modules/auth/auth.module");
var users_module_1 = require("./modules/users/users.module");
var patients_module_1 = require("./modules/patients/patients.module");
var medecins_module_1 = require("./modules/medecins/medecins.module");
var appointments_module_1 = require("./modules/appointments/appointments.module");
var prescriptions_module_1 = require("./modules/prescriptions/prescriptions.module");
var pharmacie_module_1 = require("./modules/pharmacie/pharmacie.module");
var laboratoire_module_1 = require("./modules/laboratoire/laboratoire.module");
var radiologie_module_1 = require("./modules/radiologie/radiologie.module");
var qr_codes_module_1 = require("./modules/qr-codes/qr-codes.module");
var notifications_module_1 = require("./modules/notifications/notifications.module");
var payments_module_1 = require("./modules/payments/payments.module");
// Admin — après TypeORM
var admin_module_1 = require("./admin/admin.module");
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        common_1.Module({
            imports: [
                upload_module_1.UploadModule,
                // 1️⃣ Config en premier (isGlobal: true)
                config_1.ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
                // 2️⃣ Database
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: function (configService) { return ({
                        type: 'postgres',
                        host: configService.get('DB_HOST', 'localhost'),
                        port: configService.get('DB_PORT', 5432),
                        username: configService.get('DB_USERNAME', 'postgres'),
                        password: configService.get('DB_PASSWORD', ''),
                        database: configService.get('DB_DATABASE', 'mediconnect'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
                        synchronize: false,
                        logging: configService.get('NODE_ENV') === 'development'
                    }); },
                    inject: [config_1.ConfigService]
                }),
                // 3️⃣ Rate limiting
                throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
                // 4️⃣ Feature modules
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
                // 5️⃣ Admin — après TypeORM initialisé
                admin_module_1.AdminModule,
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
