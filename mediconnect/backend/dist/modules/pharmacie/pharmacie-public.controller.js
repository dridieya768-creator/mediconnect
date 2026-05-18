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
exports.PharmaciePublicController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const pharmacien_profile_entity_1 = require("./entities/pharmacien-profile.entity");
const user_entity_1 = require("../users/entities/user.entity");
let PharmaciePublicController = class PharmaciePublicController {
    constructor(pharmacienRepo, userRepo, dataSource) {
        this.pharmacienRepo = pharmacienRepo;
        this.userRepo = userRepo;
        this.dataSource = dataSource;
    }
    async getMyProfile(req) {
        const userId = req.user?.sub || req.user?.id;
        const profile = await this.pharmacienRepo.findOne({ where: { userId }, relations: ['user'] });
        if (!profile)
            return { success: true, data: {} };
        return {
            success: true,
            data: {
                nomPharmacie: profile.nomPharmacie,
                numeroOrdre: profile.numeroOrdre,
                adressePharmacie: profile.adressePharmacie,
                ville: profile.ville,
                codePostal: profile.codePostal,
                latitude: profile.latitude,
                longitude: profile.longitude,
                isGarde: profile.isGarde,
                isOuverte24h: profile.isOuverte24h,
                photoUrl: profile.photoUrl,
                telephone: profile.user?.phone,
            }
        };
    }
    async updateMyProfile(body, req) {
        const userId = req.user?.sub || req.user?.id;
        let profile = await this.pharmacienRepo.findOne({ where: { userId } });
        if (!profile) {
            profile = this.pharmacienRepo.create({ userId });
        }
        Object.assign(profile, {
            nomPharmacie: body.nomPharmacie,
            numeroOrdre: body.numeroOrdre,
            adressePharmacie: body.adressePharmacie,
            ville: body.ville,
            codePostal: body.codePostal,
            latitude: body.latitude ? +body.latitude : null,
            longitude: body.longitude ? +body.longitude : null,
            isGarde: body.isGarde ?? false,
            isOuverte24h: body.isOuverte24h ?? false,
            photoUrl: body.photoUrl,
        });
        await this.pharmacienRepo.save(profile);
        if (body.telephone) {
            await this.userRepo.update(userId, { phone: body.telephone });
        }
        return { success: true, message: 'Profil mis à jour' };
    }
    async getPharmacies() {
        const profiles = await this.pharmacienRepo.find({ relations: ['user'] });
        const result = profiles
            .filter(p => p.user?.status === 'ACTIVE')
            .map(p => ({
            id: p.id,
            userId: p.userId,
            nomPharmacie: p.nomPharmacie || `Pharmacie ${p.user?.lastName ?? ''}`,
            pharmacien: `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim(),
            email: p.user?.email,
            adresse: p.adressePharmacie,
            ville: p.ville,
            telephone: p.user?.phone,
            isGarde: p.isGarde,
            isOuverte24h: p.isOuverte24h,
            photoUrl: p.photoUrl,
            latitude: p.latitude,
            longitude: p.longitude,
        }));
        return { success: true, data: result };
    }
    async sendQrToPharmacy(body, req) {
        const patientId = req.user?.sub || req.user?.id;
        try {
            await this.dataSource.query(`INSERT INTO pharmacie_qr_requests (patient_id, patient_name, pharmacie_user_id, qr_code, status, created_at)
         VALUES ($1, $2, $3, $4, 'PENDING', NOW())`, [patientId, body.patientName || 'Patient', body.pharmacieUserId, body.qrCode]);
            return { success: true, message: 'QR-ORD envoyé à la pharmacie' };
        }
        catch (e) {
            return { success: false, message: e.message };
        }
    }
    async getMyQrRequests(req) {
        const userId = req.user?.sub || req.user?.id;
        try {
            const requests = await this.dataSource.query(`SELECT * FROM pharmacie_qr_requests 
         WHERE pharmacie_user_id = $1 
         ORDER BY created_at DESC`, [userId]);
            return { success: true, data: requests };
        }
        catch (e) {
            return { success: true, data: [] };
        }
    }
};
exports.PharmaciePublicController = PharmaciePublicController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('my-profile'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmaciePublicController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('my-profile'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmaciePublicController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PharmaciePublicController.prototype, "getPharmacies", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('send-qr'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PharmaciePublicController.prototype, "sendQrToPharmacy", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('my-qr-requests'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PharmaciePublicController.prototype, "getMyQrRequests", null);
exports.PharmaciePublicController = PharmaciePublicController = __decorate([
    (0, swagger_1.ApiTags)('pharmacies'),
    (0, common_1.Controller)('pharmacies'),
    __param(0, (0, typeorm_1.InjectRepository)(pharmacien_profile_entity_1.PharmacienProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PharmaciePublicController);
//# sourceMappingURL=pharmacie-public.controller.js.map