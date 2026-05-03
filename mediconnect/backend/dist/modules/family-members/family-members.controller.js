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
exports.FamilyMembersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const family_members_service_1 = require("./family-members.service");
const create_family_member_dto_1 = require("./dto/create-family-member.dto");
const update_family_member_dto_1 = require("./dto/update-family-member.dto");
let FamilyMembersController = class FamilyMembersController {
    constructor(familyMembersService) {
        this.familyMembersService = familyMembersService;
    }
    async findAll(req) {
        const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
        return this.familyMembersService.findAllByPatient(patientId);
    }
    async create(dto, req) {
        const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
        return this.familyMembersService.create(patientId, dto);
    }
    async update(id, dto, req) {
        const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
        return this.familyMembersService.update(id, patientId, dto);
    }
    async remove(id, req) {
        const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
        return this.familyMembersService.remove(id, patientId);
    }
    async uploadDocuments(id, files, req) {
        const patientId = await this.familyMembersService.resolvePatientId(req.user.id);
        const docMembrePath = files?.docMembre?.[0]?.path;
        const docPatientPath = files?.docPatient?.[0]?.path;
        if (!docMembrePath && !docPatientPath) {
            throw new common_1.BadRequestException('Aucun fichier reçu');
        }
        return this.familyMembersService.uploadDocuments(id, patientId, docMembrePath, docPatientPath);
    }
};
exports.FamilyMembersController = FamilyMembersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les membres familiaux du patient connecté' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FamilyMembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un membre familial' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_member_dto_1.CreateFamilyMemberDto, Object]),
    __metadata("design:returntype", Promise)
], FamilyMembersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un membre familial' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_member_dto_1.UpdateFamilyMemberDto, Object]),
    __metadata("design:returntype", Promise)
], FamilyMembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un membre familial (soft delete)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FamilyMembersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Uploader les documents justificatifs (مضمون ولادة)' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'docMembre', maxCount: 1 },
        { name: 'docPatient', maxCount: 1 },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/family-docs',
            filename: (_req, file, cb) => {
                const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
                cb(null, `${unique}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (_req, file, cb) => {
            if (file.mimetype === 'application/pdf') {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Seuls les fichiers PDF sont acceptés'), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FamilyMembersController.prototype, "uploadDocuments", null);
exports.FamilyMembersController = FamilyMembersController = __decorate([
    (0, swagger_1.ApiTags)('family-members'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('family-members'),
    __metadata("design:paramtypes", [family_members_service_1.FamilyMembersService])
], FamilyMembersController);
//# sourceMappingURL=family-members.controller.js.map