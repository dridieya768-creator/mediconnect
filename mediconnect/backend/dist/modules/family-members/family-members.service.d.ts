import { Repository } from 'typeorm';
import { FamilyMember } from './entities/family-member.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';
export declare class FamilyMembersService {
    private readonly familyMemberRepo;
    private readonly patientRepo;
    constructor(familyMemberRepo: Repository<FamilyMember>, patientRepo: Repository<Patient>);
    resolvePatientId(userId: string): Promise<string>;
    private assertOwnership;
    findAllByPatient(patientId: string): Promise<FamilyMember[]>;
    create(patientId: string, dto: CreateFamilyMemberDto): Promise<FamilyMember>;
    update(id: string, patientId: string, dto: UpdateFamilyMemberDto): Promise<FamilyMember>;
    remove(id: string, patientId: string): Promise<void>;
    uploadDocuments(id: string, patientId: string, docMembrePath?: string, docPatientPath?: string): Promise<FamilyMember>;
    private deleteFileIfExists;
}
