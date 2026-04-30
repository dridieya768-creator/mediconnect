import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { Patient } from '../../patients/entities/patient.entity';
import { DossierHistoriqueService } from '../dossier-historique.service';
export declare class DossierHistoriqueInterceptor implements NestInterceptor {
    private readonly historiqueService;
    private readonly patientRepo;
    constructor(historiqueService: DossierHistoriqueService, patientRepo: Repository<Patient>);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
}
