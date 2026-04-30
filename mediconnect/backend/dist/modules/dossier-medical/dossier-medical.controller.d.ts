import { DossierMedicalService } from './dossier-medical.service';
import { DossierHistoriqueService } from './dossier-historique.service';
import { DossierAccesService } from './dossier-acces.service';
import { CreateAccesDto } from './dto/create-acces.dto';
import { UpdateAccesDto } from './dto/update-acces.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { UpdateDossierDto } from './dto/update-dossier.dto';
export declare class DossierMedicalController {
    private readonly dossierService;
    private readonly historiqueService;
    private readonly accesService;
    constructor(dossierService: DossierMedicalService, historiqueService: DossierHistoriqueService, accesService: DossierAccesService);
    private getDemandeurId;
    private getDemandeurRole;
    getDossier(patientId: string, req: any): Promise<import("../patients/entities/patient.entity").Patient>;
    updateDossier(patientId: string, body: UpdateDossierDto, req: any): Promise<import("../patients/entities/patient.entity").Patient>;
    getHistorique(patientId: string, query: HistoriqueQueryDto, req: any): Promise<{
        data: import("./entities/dossier-historique.entity").DossierHistorique[];
        total: number;
        page: number;
    }>;
    getMyPermissions(patientId: string, req: any): Promise<any>;
    listerAcces(patientId: string, req: any): Promise<any[]>;
    accorderAcces(patientId: string, dto: CreateAccesDto, req: any): Promise<import("./entities/dossier-acces-medecin.entity").DossierAccesMedecin>;
    modifierAcces(patientId: string, accesId: string, dto: UpdateAccesDto, req: any): Promise<import("./entities/dossier-acces-medecin.entity").DossierAccesMedecin>;
    revoquerAcces(patientId: string, accesId: string, req: any): Promise<void>;
    private verifierProprietaire;
}
