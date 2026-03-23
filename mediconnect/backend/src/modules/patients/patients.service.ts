import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({
      relations: ["user"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ["user"],
    });
    if (!patient) throw new NotFoundException(`Patient ${id} introuvable`);
    return patient;
  }

  async findByQrCode(qrCode: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { qrCode },
      relations: ["user"],
    });
    if (!patient) throw new NotFoundException("Code QR patient invalide");
    return patient;
  }

  async findByNss(nss: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { nss },
      relations: ["user"],
    });
    if (!patient) throw new NotFoundException("Patient introuvable");
    return patient;
  }

  async update(id: string, updateData: Partial<Patient>): Promise<Patient> {
    await this.patientsRepository.update(id, updateData);
    return this.findOne(id);
  }
   async findByUserId(userId: string): Promise<Patient> {
  const patient = await this.patientsRepository.findOne({
    where: { userId },
    relations: ["user"],
  });
  if (!patient) throw new NotFoundException("Profil patient introuvable");
  return patient;
}
  async getDossierMedical(patientId: string) {
    const patient = await this.findOne(patientId);
    return {
      patient,
      allergies: patient.allergies,
      maladiesChroniques: patient.maladiesChroniques,
      medicamentsActuels: patient.medicamentsActuels,
      groupeSanguin: patient.groupeSanguin,
      historiqueTeleconsultations: patient.historiqueTeleconsultations,
    };
  }
}