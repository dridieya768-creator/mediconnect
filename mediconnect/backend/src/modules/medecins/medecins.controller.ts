import { Controller, Get, Put, Query, Body, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "../users/entities/user.entity";

@ApiTags("medecins")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("medecins")
export class MedecinsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ── GET /api/v1/medecins/me ──────────────────────────────────────────────
  // ⚠️  IMPORTANT : cette route DOIT être déclarée AVANT @Get() sinon
  //     NestJS interprète "me" comme un paramètre :id
  @Get("me")
  @ApiOperation({ summary: "Profil du médecin connecté" })
  async getMe(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;

    if (!userId) {
      return { success: false, data: null, message: "Non authentifié" };
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "firstName", "lastName", "email", "role", "avatarUrl"],
    });

    if (!user) {
      return { success: false, data: null, message: "Médecin introuvable" };
    }

    return {
      success: true,
      data: {
        id:              user.id,
        userId:          user.id,
        firstName:       user.firstName,
        lastName:        user.lastName,
        email:           user.email,
        role:            user.role,
        avatarUrl:       user.avatarUrl,
        specialite:
          user.role === UserRole.MEDECIN_GENERALISTE
            ? "Médecin généraliste"
            : "Médecin spécialiste",
        teleconsultation: true,
        ville:           "Tunis",
      },
    };
  }

  // ── GET /api/v1/medecins?search=&specialite= ─────────────────────────────
  @Get()
  @ApiOperation({ summary: "Rechercher des médecins" })
  async getMedecins(
    @Query("search")    search?: string,
    @Query("specialite") specialite?: string,
  ) {
    const qb = this.userRepository
      .createQueryBuilder("user")
      .where("user.role IN (:...roles)", {
        roles: [UserRole.MEDECIN_GENERALISTE, UserRole.MEDECIN_SPECIALISTE],
      })
      .andWhere("user.status = 'ACTIVE'")
      .andWhere("user.deletedAt IS NULL");

    if (search) {
      qb.andWhere(
        "(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))",
        { search: `%${search}%` },
      );
    }

    if (specialite && specialite !== "Toutes spécialités") {
      if (specialite === "Généraliste") {
        qb.andWhere("user.role = :role", { role: UserRole.MEDECIN_GENERALISTE });
      } else {
        qb.andWhere("user.role = :role", { role: UserRole.MEDECIN_SPECIALISTE });
      }
    }

    const users = await qb.limit(20).getMany();

    return {
      success: true,
      data: users.map((u) => ({
        id:              u.id,
        userId:          u.id,
        firstName:       u.firstName,
        lastName:        u.lastName,
        specialite:
          u.role === UserRole.MEDECIN_GENERALISTE
            ? "Médecin généraliste"
            : "Médecin spécialiste",
        ville:           "Tunis",
        teleconsultation: true,
        avatarUrl:       u.avatarUrl,
      })),
    };
  }

  // ── PUT /api/v1/medecins/availability ────────────────────────────────────
  @Put("availability")
  @ApiOperation({ summary: "Sauvegarder les disponibilités du médecin" })
  async updateAvailability(@Req() req: any, @Body() body: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    // TODO: persister en base dans une table MedecinAvailability
    console.log(`[Availability] Médecin ${userId}:`, body);
    return {
      success: true,
      message: "Disponibilités enregistrées avec succès.",
    };
  }
}