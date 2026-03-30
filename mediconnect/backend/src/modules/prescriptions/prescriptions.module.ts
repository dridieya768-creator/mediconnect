import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrescriptionsController } from "./prescriptions.controller";
import { PrescriptionsService } from "./prescriptions.service";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesModule } from "../qr-codes/qr-codes.module";
import { InteractionCheckerService } from "./interaction-checker.service";
import { PdfService } from "./pdf.service";

@Module({
  imports: [TypeOrmModule.forFeature([Prescription]), QrCodesModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, InteractionCheckerService, PdfService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
