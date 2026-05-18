import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { PrescriptionsController } from "./prescriptions.controller";
import { PrescriptionsService } from "./prescriptions.service";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesModule } from "../qr-codes/qr-codes.module";
import { InteractionCheckerService } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";
import { EmailService } from "../../common/services/email.service";

@Module({
  imports: [TypeOrmModule.forFeature([Prescription]), QrCodesModule, ConfigModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, InteractionCheckerService, PdfService, EmailService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
