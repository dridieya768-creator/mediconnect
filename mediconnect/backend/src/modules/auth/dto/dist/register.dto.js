"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.RegisterDto = exports.DoctorDocumentDto = void 0;
var class_validator_1 = require("class-validator");
var class_transformer_1 = require("class-transformer");
var swagger_1 = require("@nestjs/swagger");
var user_entity_1 = require("../../users/entities/user.entity");
// ── DTO pour chaque document PDF ──────────────────────────────
var DoctorDocumentDto = /** @class */ (function () {
    function DoctorDocumentDto() {
    }
    __decorate([
        class_validator_1.IsString()
    ], DoctorDocumentDto.prototype, "type");
    __decorate([
        class_validator_1.IsString()
    ], DoctorDocumentDto.prototype, "filename");
    __decorate([
        class_validator_1.IsString()
    ], DoctorDocumentDto.prototype, "base64");
    return DoctorDocumentDto;
}());
exports.DoctorDocumentDto = DoctorDocumentDto;
// ── DTO principal d'inscription ───────────────────────────────
var RegisterDto = /** @class */ (function () {
    function RegisterDto() {
    }
    __decorate([
        swagger_1.ApiProperty({ example: 'ahmed.mansouri@email.com' }),
        class_validator_1.IsEmail()
    ], RegisterDto.prototype, "email");
    __decorate([
        swagger_1.ApiProperty({ example: 'Test1234!' }),
        class_validator_1.IsString(),
        class_validator_1.MinLength(8)
    ], RegisterDto.prototype, "password");
    __decorate([
        swagger_1.ApiProperty({ example: 'Ahmed' }),
        class_validator_1.IsString()
    ], RegisterDto.prototype, "firstName");
    __decorate([
        swagger_1.ApiProperty({ example: 'Mansouri' }),
        class_validator_1.IsString()
    ], RegisterDto.prototype, "lastName");
    __decorate([
        swagger_1.ApiProperty({ example: '+21698765432', required: false }),
        class_validator_1.IsOptional(),
        class_validator_1.IsString()
    ], RegisterDto.prototype, "phone");
    __decorate([
        swagger_1.ApiProperty({ "enum": user_entity_1.UserRole, example: user_entity_1.UserRole.PATIENT }),
        class_validator_1.IsEnum(user_entity_1.UserRole)
    ], RegisterDto.prototype, "role");
    __decorate([
        swagger_1.ApiProperty({ required: false, type: [DoctorDocumentDto] }),
        class_validator_1.IsOptional(),
        class_validator_1.IsArray(),
        class_validator_1.ValidateNested({ each: true }),
        class_transformer_1.Type(function () { return DoctorDocumentDto; })
    ], RegisterDto.prototype, "documents");
    return RegisterDto;
}());
exports.RegisterDto = RegisterDto;
