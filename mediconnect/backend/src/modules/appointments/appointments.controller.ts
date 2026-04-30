import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Req, HttpCode, HttpStatus, Query
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "././dto/create-appointment.dto";
import { CancelAppointmentDto } from "././dto/cancel-appointment.dto";
import { RateAppointmentDto }   from "././dto/rate-appointment.dto";

@ApiTags("appointments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly svc: AppointmentsService) {}

  // ── US3 — Créer RDV ────────────────────────────────────────────────────────
  @Post()
  @ApiOperation({ summary: "Créer un rendez-vous" })
  create(@Body() dto: CreateAppointmentDto) {
    return this.svc.create(dto);
  }

  // ── US4 — Mes RDV (patient) ────────────────────────────────────────────────
  @Get("patient/:patientId")
  @ApiOperation({ summary: "RDV d'un patient" })
  getByPatient(@Param("patientId") patientId: string) {
    return this.svc.findByPatient(patientId);
  }

  // ── Médecins du patient (pour gestion accès) ───────────────────────────────
  @Get("my-doctors")
  @ApiOperation({ summary: "Liste des médecins avec qui le patient a eu des RDV" })
  async getMyDoctors(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    return this.svc.findDoctorsByPatient(userId);
  }

  // ── Planning médecin ────────────────────────────────────────────────────────
  @Get("doctor/:doctorId")
  @ApiOperation({ summary: "RDV d'un médecin" })
  getByDoctor(
    @Param("doctorId") doctorId: string,
    @Query("date") date?: string,
  ) {
    return this.svc.findByDoctor(doctorId, date);
  }

  // ── US (médecin) — Confirmer ────────────────────────────────────────────────
  @Patch(":id/confirm")
  @ApiOperation({ summary: "Confirmer un RDV" })
  confirm(@Param("id") id: string) {
    return this.svc.confirm(id);
  }

  // ── US5 — Annuler ──────────────────────────────────────────────────────────
  @Patch(":id/cancel")
  @ApiOperation({ summary: "Annuler un RDV" })
 cancel(@Param("id") id: string, @Body() dto: CancelAppointmentDto) {
  return this.svc.cancel(id, dto?.reason || "");
  }

  // ── Marquer terminé ────────────────────────────────────────────────────────
  @Patch(":id/complete")
  @ApiOperation({ summary: "Marquer un RDV comme terminé" })
  complete(@Param("id") id: string, @Body("notes") notes?: string) {
    return this.svc.complete(id, notes);
  }

  // ── US7 — Évaluer ──────────────────────────────────────────────────────────
  @Post(":id/rate")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Évaluer une consultation" })
  rate(@Param("id") id: string, @Body() dto: RateAppointmentDto) {
    return this.svc.rate(id, dto);
  }

  // ── Générer lien vidéo ─────────────────────────────────────────────────────
  @Post(":id/video-room")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Générer un lien Jitsi Meet" })
  generateVideoRoom(@Param("id") id: string) {
    return this.svc.generateVideoRoom(id);
  }
}