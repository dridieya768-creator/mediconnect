import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { FamilyMember } from './entities/family-member.entity';
import { Patient } from '../patients/entities/patient.entity';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@Injectable()
export class FamilyMembersService {
  constructor(
    @InjectRepository(FamilyMember)
    private readonly familyMemberRepo: Repository<FamilyMember>,// table ta famillies meb
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  // ntawlo id 
  async resolvePatientId(userId: string): Promise<string> {
    const patient = await this.patientRepo.findOne({ where: { userId } });
    if (!patient) {
      throw new NotFoundException('Profil patient introuvable');
    }
    return patient.id;
  }

  ///vérifie que le membre familial appartient bien au patient 
  private async assertOwnership(id: string, patientId: string): Promise<FamilyMember> {
    const member = await this.familyMemberRepo.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Membre familial introuvable');
    }
    if (member.patientId !== patientId) {
      throw new ForbiddenException('Accès non autorisé');
    }
    return member;
  }

  
  async findAllByPatient(patientId: string): Promise<FamilyMember[]> {
    return this.familyMemberRepo.find({
      where: { patientId },
      order: { createdAt: 'ASC' },
    });
  }

  
  async create(patientId: string, dto: CreateFamilyMemberDto): Promise<FamilyMember> {
    const member = this.familyMemberRepo.create({
      ...dto,
      patientId,
      allergies: dto.allergies ?? [],
    });
    return this.familyMemberRepo.save(member);
  }

  
  async update(id: string, patientId: string, dto: UpdateFamilyMemberDto): Promise<FamilyMember> {
    const member = await this.assertOwnership(id, patientId);
    Object.assign(member, dto);
    return this.familyMemberRepo.save(member);
  }

  
  async remove(id: string, patientId: string): Promise<void> {
    await this.assertOwnership(id, patientId);
    await this.familyMemberRepo.softDelete(id);
  }

  
  async uploadDocuments(
    id: string,
    patientId: string,
    docMembrePath?: string,
    docPatientPath?: string,
  ): Promise<FamilyMember> {
    const member = await this.assertOwnership(id, patientId);

    
    if (docMembrePath && member.docMembrePath) {
      this.deleteFileIfExists(member.docMembrePath);
    }
    if (docPatientPath && member.docPatientPath) {
      this.deleteFileIfExists(member.docPatientPath);
    }

    if (docMembrePath)  member.docMembrePath  = docMembrePath;
    if (docPatientPath) member.docPatientPath = docPatientPath;

    return this.familyMemberRepo.save(member);
  }

  private deleteFileIfExists(filePath: string): void {
    try {
      const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch { /* silencieux */ }
  }
}
