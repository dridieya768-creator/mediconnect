import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { QrCodesController } from "./qr-codes.controller";
import { QrCodesService } from "./qr-codes.service";
import { QrCode } from "./entities/qr-code.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([QrCode]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cs: ConfigService) => ({ secret: cs.get("JWT_SECRET") }),
      inject: [ConfigService],
    }),
  ],
  controllers: [QrCodesController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}
