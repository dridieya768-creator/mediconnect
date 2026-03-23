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
exports.MedecinsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
let MedecinsController = class MedecinsController {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async getMe(req) {
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
                id: user.id,
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                specialite: user.role === user_entity_1.UserRole.MEDECIN_GENERALISTE
                    ? "Médecin généraliste"
                    : "Médecin spécialiste",
                teleconsultation: true,
                ville: "Tunis",
            },
        };
    }
    async getMedecins(search, specialite) {
        const qb = this.userRepository
            .createQueryBuilder("user")
            .where("user.role IN (:...roles)", {
            roles: [user_entity_1.UserRole.MEDECIN_GENERALISTE, user_entity_1.UserRole.MEDECIN_SPECIALISTE],
        })
            .andWhere("user.status = 'ACTIVE'")
            .andWhere("user.deletedAt IS NULL");
        if (search) {
            qb.andWhere("(LOWER(user.firstName) LIKE LOWER(:search) OR LOWER(user.lastName) LIKE LOWER(:search))", { search: `%${search}%` });
        }
        if (specialite && specialite !== "Toutes spécialités") {
            if (specialite === "Généraliste") {
                qb.andWhere("user.role = :role", { role: user_entity_1.UserRole.MEDECIN_GENERALISTE });
            }
            else {
                qb.andWhere("user.role = :role", { role: user_entity_1.UserRole.MEDECIN_SPECIALISTE });
            }
        }
        const users = await qb.limit(20).getMany();
        return {
            success: true,
            data: users.map((u) => ({
                id: u.id,
                userId: u.id,
                firstName: u.firstName,
                lastName: u.lastName,
                specialite: u.role === user_entity_1.UserRole.MEDECIN_GENERALISTE
                    ? "Médecin généraliste"
                    : "Médecin spécialiste",
                ville: "Tunis",
                teleconsultation: true,
                avatarUrl: u.avatarUrl,
            })),
        };
    }
    async updateAvailability(req, body) {
        const userId = req.user?.sub || req.user?.id || req.user?.userId;
        console.log(`[Availability] Médecin ${userId}:`, body);
        return {
            success: true,
            message: "Disponibilités enregistrées avec succès.",
        };
    }
};
exports.MedecinsController = MedecinsController;
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Profil du médecin connecté" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "Rechercher des médecins" }),
    __param(0, (0, common_1.Query)("search")),
    __param(1, (0, common_1.Query)("specialite")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMedecins", null);
__decorate([
    (0, common_1.Put)("availability"),
    (0, swagger_1.ApiOperation)({ summary: "Sauvegarder les disponibilités du médecin" }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "updateAvailability", null);
exports.MedecinsController = MedecinsController = __decorate([
    (0, swagger_1.ApiTags)("medecins"),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)("medecins"),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MedecinsController);
//# sourceMappingURL=medecins.controller.js.map