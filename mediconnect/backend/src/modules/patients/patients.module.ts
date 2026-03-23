import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";
import { PatientQrController } from "./patient-qr.controller";
import { QrCodeService } from "./qr-code.service";
import { Patient } from "./entities/patient.entity";
import { MedecinsModule } from "@modules/medecins/medecins.module";
import { User } from "@modules/users/entities/user.entity";
@Module({
  imports: [  
    MedecinsModule,
     TypeOrmModule.forFeature([
      Patient,  // ← requis par PatientsService (existant)
      User, ]),
    ConfigModule,
  ],
  controllers: [PatientsController, PatientQrController],
  providers: [PatientsService, QrCodeService],
  exports: [PatientsService, QrCodeService],
})
export class PatientsModule {}
