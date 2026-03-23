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
    async getMe(req) {
        const userId = req.user?.sub
            || req.user?.id
            || req.user?.userId;
        console.log("[PatientsController] req.user:", req.user);
        console.log("[PatientsController] userId extrait:", userId);
        if (!userId) {
            return { success: false, data: null, message: "Non authentifié" };
        }
        const user = await this.userRepo.findOne({
            where: { id: userId },
            select: ["id", "firstName", "lastName", "email", "role", "avatarUrl"],
        });
        if (!user) {
            return { success: false, data: null, message: "Utilisateur introuvable" };
        }
        const patient = await this.patientRepo.findOne({
            where: { userId },
        });
        console.log("[PatientsController] patient trouvé:", patient?.id);
        if (!patient) {
            return {
                success: false,
                data: null,
                message: "Profil patient introuvable — veuillez compléter votre inscription",
            };
        }
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
            },
        };
    }
};
exports.PatientsController = PatientsController;
__decorate([
    (0, common_1.Get)("me"),
    (0, swagger_1.ApiOperation)({ summary: "Profil du patient connecté" }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientsController.prototype, "getMe", null);
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