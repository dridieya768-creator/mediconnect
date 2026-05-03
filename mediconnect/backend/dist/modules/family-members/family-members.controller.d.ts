/// <reference types="multer" />
import { FamilyMembersService } from './family-members.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
export declare class FamilyMembersController {
    private readonly familyMembersService;
    constructor(familyMembersService: FamilyMembersService);
    findAll(req: any): Promise<import("./entities/family-member.entity").FamilyMember[]>;
    create(dto: CreateFamilyMemberDto, req: any): Promise<import("./entities/family-member.entity").FamilyMember>;
    update(id: string, dto: UpdateFamilyMemberDto, req: any): Promise<import("./entities/family-member.entity").FamilyMember>;
    remove(id: string, req: any): Promise<void>;
    uploadDocuments(id: string, files: {
        docMembre?: Express.Multer.File[];
        docPatient?: Express.Multer.File[];
    }, req: any): Promise<import("./entities/family-member.entity").FamilyMember>;
}
