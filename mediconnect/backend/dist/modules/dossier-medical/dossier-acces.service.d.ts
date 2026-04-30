import { Repository } from 'typeorm';
import { DossierAccesMedecin, NiveauAcces } from './entities/dossier-acces-medecin.entity';
import { CreateAccesDto } from './dto/create-acces.dto';
import { UpdateAccesDto } from './dto/update-acces.dto';
export declare class DossierAccesService {
    private readonly accesRepo;
    constructor(accesRepo: Repository<DossierAccesMedecin>);
    accorderAcces(patientId: string, accordeParId: string, dto: CreateAccesDto): Promise<DossierAccesMedecin>;
    modifierAcces(accesId: string, patientId: string, dto: UpdateAccesDto): Promise<DossierAccesMedecin>;
    revoquerAcces(accesId: string, patientId: string): Promise<void>;
    getPermissionsMedecin(patientId: string, medecinId: string): Promise<any>;
    listerAcces(patientId: string): Promise<any[]>;
    verifierAcces(patientId: string, medecinId: string, niveauRequis: NiveauAcces): Promise<DossierAccesMedecin>;
}
