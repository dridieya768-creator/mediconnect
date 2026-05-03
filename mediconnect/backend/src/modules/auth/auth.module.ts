import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";
import { User } from "../users/entities/user.entity";
import { Patient } from "../patients/entities/patient.entity";
import { PharmacienProfile } from "../pharmacie/entities/pharmacien-profile.entity";
import { NotificationsModule } from "../notifications/notifications.module";
import { MulterModule } from "@nestjs/platform-express";
@Module({
  imports: [
    MulterModule.register({ dest: "./uploads" }),
    PassportModule,
    TypeOrmModule.forFeature([User, Patient, PharmacienProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET", "mediconnect-secret"),
        signOptions: { expiresIn: configService.get<string>("JWT_EXPIRES_IN", "7d") },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => NotificationsModule), // ✅
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}