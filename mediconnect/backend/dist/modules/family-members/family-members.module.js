"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyMembersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const family_member_entity_1 = require("./entities/family-member.entity");
const family_members_service_1 = require("./family-members.service");
const family_members_controller_1 = require("./family-members.controller");
const patient_entity_1 = require("../patients/entities/patient.entity");
let FamilyMembersModule = class FamilyMembersModule {
};
exports.FamilyMembersModule = FamilyMembersModule;
exports.FamilyMembersModule = FamilyMembersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([family_member_entity_1.FamilyMember, patient_entity_1.Patient]),
        ],
        controllers: [family_members_controller_1.FamilyMembersController],
        providers: [family_members_service_1.FamilyMembersService],
        exports: [family_members_service_1.FamilyMembersService],
    })
], FamilyMembersModule);
//# sourceMappingURL=family-members.module.js.map