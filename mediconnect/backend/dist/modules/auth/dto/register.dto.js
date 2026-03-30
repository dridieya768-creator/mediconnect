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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDto = exports.DoctorDocumentDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
class DoctorDocumentDto {
}
exports.DoctorDocumentDto = DoctorDocumentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDocumentDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDocumentDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DoctorDocumentDto.prototype, "base64", void 0);
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ahmed.mansouri@email.com' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Test1234!' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ahmed' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mansouri' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+21698765432', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: user_entity_1.UserRole, example: user_entity_1.UserRole.PATIENT }),
    (0, class_validator_1.IsEnum)(user_entity_1.UserRole),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, type: [DoctorDocumentDto] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DoctorDocumentDto),
    __metadata("design:type", Array)
], RegisterDto.prototype, "documents", void 0);
//# sourceMappingURL=register.dto.js.map