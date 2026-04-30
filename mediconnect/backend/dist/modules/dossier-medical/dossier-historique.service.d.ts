import { Repository } from 'typeorm';
import { DossierHistorique } from './entities/dossier-historique.entity';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
export declare const CHAMPS_SURVEILLES: readonly ["allergies", "maladiesChroniques", "medicamentsActuels", "groupeSanguin", "dateNaissance", "sexe", "ville", "telephone", "nss", "nom", "prenom"];
export declare class DossierHistoriqueService {
    private readonly historiqueRepo;
    constructor(historiqueRepo: Repository<DossierHistorique>);
    computeDiff(avant: Record<string, any>, apres: Record<string, any>): Record<string, {
        avant: any;
        apres: any;
    }>;
    private sanitizeSnapshot;
    createHistorique(patientId: string, modifieParId: string, roleAuteur: string, snapshotAvant: Record<string, any>, snapshotApres: Record<string, any>, commentaire?: string): Promise<DossierHistorique | null>;
    getHistorique(patientId: string, query: HistoriqueQueryDto): Promise<{
        data: DossierHistorique[];
        total: number;
        page: number;
    }>;
}
