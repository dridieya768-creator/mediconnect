"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("./entities/patient.entity");
let PatientsController = class PatientsController {
    constructor(userRepo, patientRepo) {
        this.userRepo = userRepo;
        this.patientRepo = patientRepo;
    }
    async searchPatients(search) {
        if (!search || search.trim().length < 2)
            return { success: true, data: [] };
        const q = search.trim();
        const patients = await this.patientRepo.find({
            where: [
                { nom: (0, typeorm_2.ILike)(`%${q}%`) },
                { prenom: (0, typeorm_2.ILike)(`%${q}%`) },
                { nss: (0, typeorm_2.ILike)(`%${q}%`) },
            ],
            take: 10,
        });
        return { success: true, data: patients };
    }
    async getMe(req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId)
            return { success: false, data: null, message: "Non authentifié" };
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ["id", "firstName", "lastName", "email", "role", "avatarUrl", "mfaEnabled"],
        });
        if (!user)
            return { success: false, data: null, message: "Utilisateur introuvable" };
        const patient = await this.patientRepo.findOne({ where: { userId } });
        if (!patient)
            return { success: false, data: null, message: "Profil patient introuvable" };
        return {
            success: true,
            id: patient.id,
            data: {
                id: patient.id,
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                mfaEnabled: user.mfaEnabled,
                telephone: patient.telephone,
                dateNaissance: patient.dateNaissance,
                sexe: patient.sexe,
                ville: patient.ville,
                languePreferee: patient.languePreferee,
                groupeSanguin: patient.groupeSanguin,
                nss: patient.nss,
                qrCode: patient.qrCode,
                allergies: patient.allergies,
                maladiesChroniques: patient.maladiesChroniques,
                medicamentsActuels: patient.medicamentsActuels,
            },
        };
    }
    async updateAvatar(body, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId)
            return { success: false, message: "Non authentifié" };
        if (!body.avatarUrl)
            return { success: false, message: "avatarUrl requis" };
        if (body.avatarUrl.length > 3000000) {
            return { success: false, message: "Image trop grande (max 2 Mo)" };
        }
        try {
            await this.userRepo.update(userId, { avatarUrl: body.avatarUrl });
            return { success: true };
        }
        catch (err) {
            console.error("[PATCH /patients/avatar] error:", err?.message);
            return { success: false, message: "Erreur lors de la mise à jour de l'avatar" };
        }
    }
    async updateProfile(id, body, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        console.log("[PATCH /patients/:id] id:", id, "userId:", userId, "body:", body);
        const patient = await this.patientRepo.findOne({ where: { id } });
        console.log("[PATCH /patients/:id] patient trouvé:", patient?.id, "patient.userId:", patient?.userId);
        if (!patient)
            return { success: false, message: "Patient introuvable" };
        if (patient.userId !== userId)
            return { success: false, message: "Non autorisé" };
        const allowed = ['telephone', 'dateNaissance', 'sexe', 'ville', 'languePreferee',
            'groupeSanguin', 'allergies', 'maladiesChroniques', 'medicamentsActuels',
            'rappelsAuto', 'nom', 'prenom'];
        const updateData = {};
        for (const key of allowed) {
            const val = body[key];
            if (Array.isArray(val)) {
                updateData[key] = val;
            }
            else if (val !== undefined && val !== null && val !== '') {
                updateData[key] = val;
            }
        }
        if (body.nss && body.nss.trim())
            updateData.nss = body.nss.trim();
        console.log("[PATCH /patients/:id] updateData:", updateData);
        await this.patientRepo.update(id, updateData);
        const updated = await this.patientRepo.findOne({ where: { id } });
        return { success: true, data: updated };
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Rechercher des patients (médecin)" }),
    __param(0, (0, common_1.Query)("search")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "searchPatients", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Profil complet du patient connecté" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)("avatar"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour la photo de profil" }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updateAvatar", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le profil patient" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updateProfile", null);
exports.PatientsController = PatientsController = __decorate([
    (0, swagger_1.ApiTags)("patients"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("patients"),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PatientsController);
//# sourceMappingURL=patients.controller.js.map