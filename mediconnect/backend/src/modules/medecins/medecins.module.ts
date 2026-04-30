import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedecinsController } from "./medecins.controller";
import { MedecinsService } from "./medecins.service";
import { User } from "../users/entities/user.entity";
import { MedecinProfile } from "./entities/medecin-profile.entity";
import { DoctorPatient } from "./entities/doctor-patient.entity";
import { Appointment } from "@modules/appointments/entities/appointment.entity";
import { Patient } from "@modules/patients/entities/patient.entity";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [TypeOrmModule.forFeature([User, MedecinProfile, Appointment, DoctorPatient, Patient]), NotificationsModule],
  controllers: [MedecinsController],
  providers: [MedecinsService],
  exports: [MedecinsService],
})
export class MedecinsModule {}