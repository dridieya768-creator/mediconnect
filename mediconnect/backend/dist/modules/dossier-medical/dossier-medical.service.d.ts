import { Repository } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { DossierHistoriqueService } from './dossier-historique.service';
import { DossierAccesService } from './dossier-acces.service';
import { UpdateDossierDto } from './dto/update-dossier.dto';
export declare class DossierMedicalService {
    private readonly patientRepo;
    private readonly historiqueService;
    private readonly accesService;
    constructor(patientRepo: Repository<Patient>, historiqueService: DossierHistoriqueService, accesService: DossierAccesService);
    getPatientDirect(patientId: string): Promise<Patient | null>;
    getDossier(patientId: string, demandeurId: string, demandeurRole: string): Promise<Patient>;
    updateDossierParMedecin(patientId: string, medecinId: string, updateData: UpdateDossierDto): Promise<Patient>;
}
