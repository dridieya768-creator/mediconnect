import { Controller, Get, UseGuards, Req, NotFoundException } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Patient } from "./entities/patient.entity";

@ApiTags("patients")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("patients")
export class PatientsController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  @Get("me")
  @ApiOperation({ summary: "Profil du patient connecté" })
  async getMe(@Req() req: any) {
    const userId = req.user?.sub
                || req.user?.id
                || req.user?.userId;

    console.log("[PatientsController] req.user:", req.user);
    console.log("[PatientsController] userId extrait:", userId);

    if (!userId) {
      return { success: false, data: null, message: "Non authentifié" };
    }

    // ── 1. Récupérer l'utilisateur ────────────────────────────────────────
    const user = await this.userRepo.findOne({
      where:  { id: userId },
      select: ["id", "firstName", "lastName", "email", "role", "avatarUrl"],
    });

    if (!user) {
      return { success: false, data: null, message: "Utilisateur introuvable" };
    }

    // ── 2. Récupérer le profil Patient lié à ce userId ────────────────────
    const patient = await this.patientRepo.findOne({
      where: { userId },   // colonne userId dans la table Patient
    });

    console.log("[PatientsController] patient trouvé:", patient?.id);

    // Si pas encore de profil Patient, on retourne quand même les infos user
    // mais sans patient.id (le frontend devra gérer ce cas)
    if (!patient) {
      return {
        success: false,
        data:    null,
        message: "Profil patient introuvable — veuillez compléter votre inscription",
      };
    }

    // ── 3. Retourner le vrai patient.id ───────────────────────────────────
    return {
      success: true,
      id:      patient.id,   // ← vrai UUID de la table Patient (utilisé par /appointments)
      data: {
        id:        patient.id,   // ← patient.id pour createAppointment()
        userId:    user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        email:     user.email,
        role:      user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}