import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DossierHistorique } from './entities/dossier-historique.entity';
import { HistoriqueQueryDto } from './dto/historique-query.dto';

export const CHAMPS_SURVEILLES = [
  'allergies', 'maladiesChroniques', 'medicamentsActuels',
  'groupeSanguin', 'dateNaissance', 'sexe', 'ville',
  'telephone', 'nss', 'nom', 'prenom',
] as const;

const CHAMPS_SENSIBLES = ['password', 'mfaSecret', 'refreshToken'];

@Injectable()
export class DossierHistoriqueService {
  constructor(
    @InjectRepository(DossierHistorique)
    private readonly historiqueRepo: Repository<DossierHistorique>,
  ) {}

  computeDiff(
    avant: Record<string, any>,
    apres: Record<string, any>,
  ): Record<string, { avant: any; apres: any }> {
    const diff: Record<string, { avant: any; apres: any }> = {};
    for (const champ of CHAMPS_SURVEILLES) {
      if (JSON.stringify(avant[champ]) !== JSON.stringify(apres[champ])) {
        diff[champ] = { avant: avant[champ], apres: apres[champ] };
      }
    }
    return diff;
  }

  private sanitizeSnapshot(snapshot: Record<string, any>): Record<string, any> {
    const clean = { ...snapshot };
    for (const champ of CHAMPS_SENSIBLES) {
      delete clean[champ];
    }
    return clean;
  }

  async createHistorique(
    patientId: string,
    modifieParId: string,
    roleAuteur: string,
    snapshotAvant: Record<string, any>,
    snapshotApres: Record<string, any>,
    commentaire?: string,
  ): Promise<DossierHistorique | null> {
    const diff = this.computeDiff(snapshotAvant, snapshotApres);
    if (Object.keys(diff).length === 0) return null;

    const entry = this.historiqueRepo.create({
      patientId,
      modifieParId,
      roleAuteur,
      champsModifies: diff,
      snapshotAvant: this.sanitizeSnapshot(snapshotAvant),
      commentaire,
    });
    return this.historiqueRepo.save(entry);
  }

  async getHistorique(
    patientId: string,
    query: HistoriqueQueryDto,
  ): Promise<{ data: DossierHistorique[]; total: number; page: number }> {
    const { page = 1, limit = 20, champ, modifieParId } = query;

    const qb = this.historiqueRepo
      .createQueryBuilder('h')
      .where('h.patientId = :patientId', { patientId })
      .orderBy('h.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (champ) {
      qb.andWhere('h.champsModifies ? :champ', { champ });
    }
    if (modifieParId) {
      qb.andWhere('h.modifieParId = :modifieParId', { modifieParId });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page };
  }
}
