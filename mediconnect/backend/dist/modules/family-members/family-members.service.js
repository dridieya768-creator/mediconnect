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
exports.FamilyMembersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fs = require("fs");
const path = require("path");
const family_member_entity_1 = require("./entities/family-member.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
let FamilyMembersService = class FamilyMembersService {
    constructor(familyMemberRepo, patientRepo) {
        this.familyMemberRepo = familyMemberRepo;
        this.patientRepo = patientRepo;
    }
    async resolvePatientId(userId) {
        const patient = await this.patientRepo.findOne({ where: { userId } });
        if (!patient) {
            throw new common_1.NotFoundException('Profil patient introuvable');
        }
        return patient.id;
    }
    async assertOwnership(id, patientId) {
        const member = await this.familyMemberRepo.findOne({ where: { id } });
        if (!member) {
            throw new common_1.NotFoundException('Membre familial introuvable');
        }
        if (member.patientId !== patientId) {
            throw new common_1.ForbiddenException('Accès non autorisé');
        }
        return member;
    }
    async findAllByPatient(patientId) {
        return this.familyMemberRepo.find({
            where: { patientId },
            order: { createdAt: 'ASC' },
        });
    }
    async create(patientId, dto) {
        const member = this.familyMemberRepo.create({
            ...dto,
            patientId,
            allergies: dto.allergies ?? [],
        });
        return this.familyMemberRepo.save(member);
    }
    async update(id, patientId, dto) {
        const member = await this.assertOwnership(id, patientId);
        Object.assign(member, dto);
        return this.familyMemberRepo.save(member);
    }
    async remove(id, patientId) {
        await this.assertOwnership(id, patientId);
        await this.familyMemberRepo.softDelete(id);
    }
    async uploadDocuments(id, patientId, docMembrePath, docPatientPath) {
        const member = await this.assertOwnership(id, patientId);
        if (docMembrePath && member.docMembrePath) {
            this.deleteFileIfExists(member.docMembrePath);
        }
        if (docPatientPath && member.docPatientPath) {
            this.deleteFileIfExists(member.docPatientPath);
        }
        if (docMembrePath)
            member.docMembrePath = docMembrePath;
        if (docPatientPath)
            member.docPatientPath = docPatientPath;
        return this.familyMemberRepo.save(member);
    }
    deleteFileIfExists(filePath) {
        try {
            const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
            if (fs.existsSync(abs))
                fs.unlinkSync(abs);
        }
        catch { }
    }
};
exports.FamilyMembersService = FamilyMembersService;
exports.FamilyMembersService = FamilyMembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(family_member_entity_1.FamilyMember)),
    __param(1, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FamilyMembersService);
//# sourceMappingURL=family-members.service.js.map