import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrescriptionsController } from "./prescriptions.controller";
import { PrescriptionsService } from "./prescriptions.service";
import { Prescription } from "./entities/prescription.entity";
import { QrCodesModule } from "../qr-codes/qr-codes.module";

@Module({
  imports: [TypeOrmModule.forFeature([Prescription]), QrCodesModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
