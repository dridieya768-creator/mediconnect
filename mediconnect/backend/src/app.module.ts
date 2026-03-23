import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { MedecinsModule } from './modules/medecins/medecins.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { PharmacieModule } from './modules/pharmacie/pharmacie.module';
import { LaboratoireModule } from './modules/laboratoire/laboratoire.module';
import { RadiologieModule } from './modules/radiologie/radiologie.module';
import { QrCodesModule } from './modules/qr-codes/qr-codes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';

// Admin — après TypeORM
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 1️⃣ Config en premier (isGlobal: true)
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // 2️⃣ Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:     configService.get('DB_HOST', 'localhost'),
        port:     configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'mediconnect'),
        entities:   [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // 3️⃣ Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // 4️⃣ Feature modules
    AuthModule,
    UsersModule,
    PatientsModule,
    MedecinsModule,
    AppointmentsModule,
    PrescriptionsModule,
    PharmacieModule,
    LaboratoireModule,
    RadiologieModule,
    QrCodesModule,
    NotificationsModule,
    PaymentsModule,

    // 5️⃣ Admin — après TypeORM initialisé
    AdminModule,
  ],
})
export class AppModule {}