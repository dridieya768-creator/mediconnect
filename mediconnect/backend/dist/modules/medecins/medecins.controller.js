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
exports.MedecinsController = exports.UpdateMedecinProfileDto = void 0;
const common_1 = require("@nestjs/common");
const medecins_service_1 = require("./medecins.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const user_entity_1 = require("../users/entities/user.entity");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const update_availability_dto_1 = require("./update-availability.dto");
const search_medecins_dto_1 = require("./dto/search-medecins.dto");
const get_slots_query_dto_1 = require("./dto/get-slots-query.dto");
class UpdateMedecinProfileDto {
}
exports.UpdateMedecinProfileDto = UpdateMedecinProfileDto;
let MedecinsController = class MedecinsController {
    constructor(medecinsService) {
        this.medecinsService = medecinsService;
    }
    async updateAvailability(user, dto) {
        return this.medecinsService.updateAvailability(user.id, dto);
    }
    async getAvailability(user) {
        return this.medecinsService.getAvailability(user.id);
    }
    async acceptAppointment(user, appointmentId) {
        const result = await this.medecinsService.acceptAppointment(user.id, appointmentId);
        try {
            const appt = result.appointment;
            const patientRows = await this.medecinsService.appointmentRepository?.manager?.query(`SELECT id FROM patients WHERE id = $1 OR user_id = $1 LIMIT 1`, [appt?.patientId]);
            const realPatientId = patientRows?.[0]?.id;
            if (realPatientId) {
                await this.medecinsService.appointmentRepository?.manager?.query(`INSERT INTO dossier_historique
             (id, patient_id, modifie_par_id, role_auteur, champs_modifies, snapshot_avant, commentaire, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'MEDECIN', $3::jsonb, '{}'::jsonb, $4, NOW())`, [
                    realPatientId,
                    user.id,
                    JSON.stringify({ rdv_confirme: { avant: { status: 'REQUESTED' }, apres: { status: 'CONFIRMED', appointmentId } } }),
                    'Rendez-vous confirme',
                ]);
            }
        }
        catch { }
        return result;
    }
    async getMe(user) {
        const profile = await this.medecinsService.getProfile(user.id);
        return { ...user, id: user.id, data: { ...user, id: user.id, profile } };
    }
    async removePatient(user, patientId) {
        return this.medecinsService.removePatientFromDoctorList(user.id, patientId);
    }
    async checkPatient(user, patientId) {
        return this.medecinsService.isPatientInDoctorList(user.id, patientId);
    }
    async getProfile(user) {
        return this.medecinsService.getProfile(user.id);
    }
    async updateProfile(user, updateDto) {
        return this.medecinsService.updateProfile(user.id, updateDto);
    }
    async getAllMedecins(query) {
        return this.medecinsService.getAllMedecinsWithProfiles(query.search, query.specialite, query.ville);
    }
    async getMyPatients(user) {
        return this.medecinsService.getMyPatientsFromAppointments(user.id);
    }
    async getRevenus(user, from, to) {
        return this.medecinsService.getRevenus(user.id, from, to);
    }
    async getMedecinAvailabilityById(id) {
        return this.medecinsService.getMedecinAvailabilityById(id);
    }
    async getOccupiedSlots(id, query) {
        return this.medecinsService.getOccupiedSlots(id, query.startDate, query.endDate);
    }
    async getMedecinById(id) {
        return this.medecinsService.getMedecinById(id);
    }
};
exports.MedecinsController = MedecinsController;
__decorate([
    (0, common_1.Put)('availability'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, update_availability_dto_1.UpdateAvailabilityDto]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "updateAvailability", null);
__decorate([
    (0, common_1.Get)('availability'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Patch)('appointments/:appointmentId/accept'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('appointmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "acceptAppointment", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Delete)('patients/:patientId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "removePatient", null);
__decorate([
    (0, common_1.Get)('patients/:patientId/check'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('patientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "checkPatient", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, UpdateMedecinProfileDto]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_medecins_dto_1.SearchMedecinsDto]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getAllMedecins", null);
__decorate([
    (0, common_1.Get)('my-patients'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMyPatients", null);
__decorate([
    (0, common_1.Get)('revenus/stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getRevenus", null);
__decorate([
    (0, common_1.Get)(':id/availability'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMedecinAvailabilityById", null);
__decorate([
    (0, common_1.Get)(':id/slots'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_slots_query_dto_1.GetSlotsQueryDto]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getOccupiedSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MedecinsController.prototype, "getMedecinById", null);
exports.MedecinsController = MedecinsController = __decorate([
    (0, common_1.Controller)('medecins'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [medecins_service_1.MedecinsService])
], MedecinsController);
//# sourceMappingURL=medecins.controller.js.map