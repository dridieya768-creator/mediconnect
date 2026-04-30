import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Patient } from '../../patients/entities/patient.entity';
import { DossierHistoriqueService } from '../dossier-historique.service';

@Injectable()
export class DossierHistoriqueInterceptor implements NestInterceptor {
  constructor(
    private readonly historiqueService: DossierHistoriqueService,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const patientId: string = request.params?.id;
    const userId: string = request.user?.sub ?? request.user?.id;
    const role: string = request.user?.role ?? 'PATIENT';

    // Snapshot avant modification
    const avant = patientId
      ? await this.patientRepo.findOne({ where: { id: patientId } })
      : null;

    return next.handle().pipe(
      tap(async (response) => {
        if (!avant || !patientId) return;
        // Déclencher uniquement si la réponse indique un succès
        const isSuccess = response?.success === true || response?.data !== undefined;
        if (!isSuccess) return;

        const apres = await this.patientRepo.findOne({ where: { id: patientId } });
        if (!apres) return;

        await this.historiqueService.createHistorique(
          patientId,
          userId,
          role,
          { ...avant } as Record<string, any>,
          { ...apres } as Record<string, any>,
        );
      }),
    );
  }
}
