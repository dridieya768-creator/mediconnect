import { Controller, Get, Patch, Body, Param, UseGuards, Req, Query, UseInterceptors } from "@nestjs/common";
import { DossierHistoriqueInterceptor } from "../dossier-medical/interceptors/dossier-historique.interceptor";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, Or } from "typeorm";
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

  @Get()
  @ApiOperation({ summary: "Rechercher des patients (médecin)" })
  async searchPatients(@Query("search") search: string) {
    if (!search || search.trim().length < 2) return { success: true, data: [] };
    const q = search.trim();
    const patients = await this.patientRepo.find({
      where: [
        { nom: ILike(`%${q}%`) },
        { prenom: ILike(`%${q}%`) },
        { nss: ILike(`%${q}%`) },
      ],
      take: 10,
    });
    return { success: true, data: patients };
  }

  @Get("me")
  @ApiOperation({ summary: "Profil complet du patient connecté" })
  async getMe(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) return { success: false, data: null, message: "Non authentifié" };

    const user = await this.userRepo.findOne({
      where:  { id: userId },
      select: ["id", "firstName", "lastName", "email", "role", "avatarUrl", "mfaEnabled"] as any,
    });
    if (!user) return { success: false, data: null, message: "Utilisateur introuvable" };

    const patient = await this.patientRepo.findOne({ where: { userId } });
    if (!patient) return { success: false, data: null, message: "Profil patient introuvable" };

    return {
      success: true,
      id: patient.id,
      data: {
        // Identité
        id:             patient.id,
        userId:         user.id,
        firstName:      user.firstName,
        lastName:       user.lastName,
        email:          user.email,
        role:           user.role,
        avatarUrl:      user.avatarUrl,
        mfaEnabled:     (user as any).mfaEnabled,
        // Profil patient
        telephone:      patient.telephone,
        dateNaissance:  patient.dateNaissance,
        sexe:           patient.sexe,
        ville:          patient.ville,
        languePreferee: patient.languePreferee,
        groupeSanguin:  patient.groupeSanguin,
        nss:            patient.nss,
        qrCode:         patient.qrCode,
        // Médical
        allergies:          patient.allergies,
        maladiesChroniques: patient.maladiesChroniques,
        medicamentsActuels: patient.medicamentsActuels,
        observationsMedecin: patient.observationsMedecin,
        documents:          patient.documents ?? [],
      },
    };
  }

  @Patch("avatar")
  @ApiOperation({ summary: "Mettre à jour la photo de profil" })
  async updateAvatar(@Body() body: { avatarUrl: string }, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    if (!userId) return { success: false, message: "Non authentifié" };
    if (!body.avatarUrl) return { success: false, message: "avatarUrl requis" };

    // Limiter la taille (base64 ~1.37x la taille originale, 2Mo → ~2.7Mo base64)
    if (body.avatarUrl.length > 3_000_000) {
      return { success: false, message: "Image trop grande (max 2 Mo)" };
    }

    try {
      await this.userRepo.update(userId, { avatarUrl: body.avatarUrl });
      return { success: true };
    } catch (err: any) {
      console.error("[PATCH /patients/avatar] error:", err?.message);
      return { success: false, message: "Erreur lors de la mise à jour de l'avatar" };
    }
  }

  @Get(":userId")
  @ApiOperation({ summary: "Profil d'un patient par userId (pour médecin)" })
  async getPatientByUserId(@Param("userId") userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ["id", "firstName", "lastName", "email", "avatarUrl"] as any,
    });
    if (!user) return { success: false, data: null, message: "Utilisateur introuvable" };

    const patient = await this.patientRepo.findOne({ where: { userId } });
    if (!patient) return { success: false, data: null, message: "Profil patient introuvable" };

    const parseList = (val: any): string[] => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      return [];
    };

    return {
      id: patient.id,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      telephone: patient.telephone,
      dateNaissance: patient.dateNaissance,
      sexe: patient.sexe,
      ville: patient.ville,
      groupeSanguin: patient.groupeSanguin,
      nss: patient.nss,
      observationsMedecin: patient.observationsMedecin,
      allergies: parseList(patient.allergies),
      maladiesChroniques: parseList(patient.maladiesChroniques),
      medicamentsActuels: parseList(patient.medicamentsActuels),
      documents: patient.documents ?? [],
    };
  }

  @Patch(":id/observations")
  @ApiOperation({ summary: "Médecin ajoute ses observations sur un patient" })
  async updateObservations(@Param("id") id: string, @Body() body: { observationsMedecin: string }, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    const role   = req.user?.role ?? '';

    if (!['MEDECIN', 'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE', 'MEDECIN_CHEF_SERVICE', 'ADMIN'].includes(role)) {
      return { success: false, message: 'Réservé aux médecins' };
    }

    // Cherche par patient.id ou patient.userId
    let patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) patient = await this.patientRepo.findOne({ where: { userId: id } });
    if (!patient) return { success: false, message: 'Patient introuvable' };

    await this.patientRepo.update(patient.id, { observationsMedecin: body.observationsMedecin });
    return { success: true, message: 'Observation enregistrée' };
  }

  @Get(":id/observations-history")
  @ApiOperation({ summary: "Historique des observations médicales d'un patient" })
  async getObservationsHistory(@Param("id") id: string, @Req() req: any) {
    // Cherche par patient.id ou patient.userId
    let patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) patient = await this.patientRepo.findOne({ where: { userId: id } });
    if (!patient) return [];

    // Retourner l'observation actuelle comme historique simple
    if (!patient.observationsMedecin) return [];

    return [{
      texte: patient.observationsMedecin,
      medecinNom: 'Médecin traitant',
      date: (patient as any).updatedAt ?? new Date().toISOString(),
    }];
  }

  @Patch(":id")
  @ApiOperation({ summary: "Mettre à jour le profil patient" })
  @UseInterceptors(DossierHistoriqueInterceptor)
  async updateProfile(@Param("id") id: string, @Body() body: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id || req.user?.userId;
    console.log("[PATCH /patients/:id] id:", id, "userId:", userId, "body:", body);

    const patient = await this.patientRepo.findOne({ where: { id } });
    console.log("[PATCH /patients/:id] patient trouvé:", patient?.id, "patient.userId:", patient?.userId);

    if (!patient) return { success: false, message: "Patient introuvable" };
    if (patient.userId !== userId) return { success: false, message: "Non autorisé" };

    // Whitelist des champs autorisés — exclure les valeurs null/undefined
    const allowed = ['telephone','dateNaissance','sexe','ville','languePreferee',
                     'groupeSanguin','allergies','maladiesChroniques','medicamentsActuels',
                     'rappelsAuto','nom','prenom','documents'];
    const updateData: any = {};
    for (const key of allowed) {
      const val = body[key];
      // Pour les tableaux, inclure même vides
      if (Array.isArray(val)) {
        updateData[key] = val;
      } else if (val !== undefined && val !== null && val !== '') {
        updateData[key] = val;
      }
    }
    // nss séparé — ne pas écraser si vide
    if (body.nss && body.nss.trim()) updateData.nss = body.nss.trim();

    // documents — parser si c'est une string JSON
    if (body.documents !== undefined) {
      try {
        updateData.documents = typeof body.documents === 'string'
          ? JSON.parse(body.documents)
          : body.documents;
      } catch { updateData.documents = []; }
    }

    console.log("[PATCH /patients/:id] updateData:", updateData);

    await this.patientRepo.update(id, updateData);
    const updated = await this.patientRepo.findOne({ where: { id } });
    return { success: true, data: updated };
  }
}