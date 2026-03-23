import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppointmentsController } from "./appointments.controller";
import { AppointmentsService }    from "./appointments.service";
import { Appointment }            from "./entities/appointment.entity";
import { NotificationsModule } from "../notifications/notifications.module";
 
@Module({
  // Dans appointments.module.ts — ajoutez NotificationsModule aux imports
imports: [TypeOrmModule.forFeature([Appointment]), NotificationsModule],
  controllers: [AppointmentsController],
  providers:   [AppointmentsService],
  exports:     [AppointmentsService],
})
export class AppointmentsModule {}