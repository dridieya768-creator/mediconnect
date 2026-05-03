"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFamilyMemberDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_family_member_dto_1 = require("./create-family-member.dto");
class UpdateFamilyMemberDto extends (0, mapped_types_1.PartialType)(create_family_member_dto_1.CreateFamilyMemberDto) {
}
exports.UpdateFamilyMemberDto = UpdateFamilyMemberDto;
//# sourceMappingURL=update-family-member.dto.js.map