import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Appointment,
  AppointmentStatus,
} from '../appointments/entities/appointment.entity';

@Injectable()
export class RevenusService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async getRevenus(
    doctorId: string,
    from?: string,
    to?: string,
  ) {
    const qb = this.appointmentRepo
      .createQueryBuilder('a') // a hiya appointement 
      .leftJoinAndSelect('a.patient', 'patient')
      .where('a.doctorId = :doctorId', { doctorId })
      .andWhere('a.status IN (:...statuses)', {
        statuses: [AppointmentStatus.COMPLETED],
      });

    if (from) {
      qb.andWhere('a.appointmentDate >= :from', {
        from: new Date(from),
      });
    }

    if (to) {
      qb.andWhere('a.appointmentDate <= :to', {
        to: new Date(to + 'T23:59:59'),
      });
    }

    qb.orderBy('a.appointmentDate', 'DESC');

    const appointments = await qb.getMany();

    const TARIF = 50;
//// generation taa facture
    const factures = appointments.map((a, idx) => ({
      numero: `FAC-${String(idx + 1).padStart(4, '0')}`,
      date: a.appointmentDate,
      patientNom:
        `${(a.patient as any)?.firstName ?? ''} ${(a.patient as any)?.lastName ?? ''}`.trim() ||
        'Patient',
      type: a.consultationType,
      statut: a.status,
      montant: TARIF,
      devise: 'TND',
    }));

    const totalRevenu = factures.reduce(
      (s, f) => s + f.montant,
      0,
    );

    const nbConsult = factures.length;

    const nbTeleconsult = factures.filter(
      (f) => f.type === 'TELECONSULTATION',
    ).length;

    const nbPhysique = factures.filter(
      (f) => f.type === 'PHYSICAL',
    ).length;
//// revenu par moin
    const parMois: Record<string, number> = {};

    for (const f of factures) {
      const key = new Date(f.date).toLocaleDateString(
        'fr-FR',
        {
          month: 'short',
          year: 'numeric',
        },
      );

      parMois[key] = (parMois[key] ?? 0) + f.montant;
    }

    return {
      factures,
      stats: {
        totalRevenu,
        nbConsult,
        nbTeleconsult,
        nbPhysique,
        tarif: TARIF,
      },
      parMois,
    };
  }
}