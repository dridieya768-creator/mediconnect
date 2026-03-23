import { Repository } from "typeorm";
import { Patient } from "./entities/patient.entity";
export declare class PatientsService {
    private patientsRepository;
    constructor(patientsRepository: Repository<Patient>);
    findAll(): Promise<Patient[]>;
    findOne(id: string): Promise<Patient>;
    findByQrCode(qrCode: string): Promise<Patient>;
    findByNss(nss: string): Promise<Patient>;
    update(id: string, updateData: Partial<Patient>): Promise<Patient>;
    findByUserId(userId: string): Promise<Patient>;
    getDossierMedical(patientId: string): Promise<{
        patient: Patient;
        allergies: string[];
        maladiesChroniques: string[];
        medicamentsActuels: any[];
        groupeSanguin: import("./entities/patient.entity").BloodGroup;
        historiqueTeleconsultations: any[];
    }>;
}
