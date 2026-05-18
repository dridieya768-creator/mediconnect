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
const dossier_historique_interceptor_1 = require("../dossier-medical/interceptors/dossier-historique.interceptor");
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
                { nss: (0, typeorm_2.ILike)(`%${q}%`) },
            ],
            relations: ['user'],
            take: 10,
        });
        const all = await this.patientRepo.find({ relations: ['user'], take: 50 });
        const filtered = all.filter(p => (p.user?.firstName ?? '').toLowerCase().includes(q.toLowerCase()) ||
            (p.user?.lastName ?? '').toLowerCase().includes(q.toLowerCase()) ||
            (p.nss ?? '').toLowerCase().includes(q.toLowerCase())).slice(0, 10);
        return { success: true, data: filtered };
    }
    async getMe(req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        if (!userId)
            return { success: false, data: null, message: "Non authentifié" };
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ["id", "firstName", "lastName", "email", "role", "avatarUrl", "mfaEnabled", "phone"],
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
                prenom: user.firstName,
                nom: user.lastName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                mfaEnabled: user.mfaEnabled,
                telephone: user.phone ?? null,
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
                observationsMedecin: patient.observationsMedecin,
                documents: patient.documents ?? [],
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
    async getPatientByUserId(userId) {
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ["id", "firstName", "lastName", "email", "avatarUrl"],
        });
        if (!user)
            return { success: false, data: null, message: "Utilisateur introuvable" };
        const patient = await this.patientRepo.findOne({ where: { userId } });
        if (!patient)
            return { success: false, data: null, message: "Profil patient introuvable" };
        const parseList = (val) => {
            if (!val)
                return [];
            if (Array.isArray(val))
                return val;
            if (typeof val === 'string')
                return val.split(',').map((s) => s.trim()).filter(Boolean);
            return [];
        };
        return {
            id: patient.id,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl,
            telephone: patient.user?.phone ?? null,
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
    async updateObservations(id, body, req) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        const role = req.user?.role ?? '';
        if (!['MEDECIN', 'MEDECIN_GENERALISTE', 'MEDECIN_SPECIALISTE', 'MEDECIN_CHEF_SERVICE', 'ADMIN'].includes(role)) {
            return { success: false, message: 'Réservé aux médecins' };
        }
        let patient = await this.patientRepo.findOne({ where: { id } });
        if (!patient)
            patient = await this.patientRepo.findOne({ where: { userId: id } });
        if (!patient)
            return { success: false, message: 'Patient introuvable' };
        await this.patientRepo.update(patient.id, { observationsMedecin: body.observationsMedecin });
        return { success: true, message: 'Observation enregistrée' };
    }
    async getObservationsHistory(id, req) {
        let patient = await this.patientRepo.findOne({ where: { id } });
        if (!patient)
            patient = await this.patientRepo.findOne({ where: { userId: id } });
        if (!patient)
            return [];
        if (!patient.observationsMedecin)
            return [];
        return [{
                texte: patient.observationsMedecin,
                medecinNom: 'Médecin traitant',
                date: patient.updatedAt ?? new Date().toISOString(),
            }];
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
        if (body.telephone !== undefined && body.telephone !== null) {
            await this.userRepo.update(userId, { phone: body.telephone });
        }
        const allowed = ['dateNaissance', 'sexe', 'ville', 'languePreferee',
            'groupeSanguin', 'allergies', 'maladiesChroniques', 'medicamentsActuels',
            'rappelsAuto', 'documents'];
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
        for (const field of ['allergies', 'maladiesChroniques', 'medicamentsActuels']) {
            if (updateData[field] !== undefined) {
                if (typeof updateData[field] === 'string') {
                    updateData[field] = updateData[field]
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0);
                }
            }
        }
        if (body.documents !== undefined) {
            try {
                updateData.documents = typeof body.documents === 'string'
                    ? JSON.parse(body.documents)
                    : body.documents;
            }
            catch {
                updateData.documents = [];
            }
        }
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
    (0, common_1.Get)(":userId"),
    (0, swagger_1.ApiOperation)({ summary: "Profil d'un patient par userId (pour médecin)" }),
    __param(0, (0, common_1.Param)("userId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getPatientByUserId", null);
__decorate([
    (0, common_1.Patch)(":id/observations"),
    (0, swagger_1.ApiOperation)({ summary: "Médecin ajoute ses observations sur un patient" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "updateObservations", null);
__decorate([
    (0, common_1.Get)(":id/observations-history"),
    (0, swagger_1.ApiOperation)({ summary: "Historique des observations médicales d'un patient" }),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getObservationsHistory", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, swagger_1.ApiOperation)({ summary: "Mettre à jour le profil patient" }),
    (0, common_1.UseInterceptors)(dossier_historique_interceptor_1.DossierHistoriqueInterceptor),
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