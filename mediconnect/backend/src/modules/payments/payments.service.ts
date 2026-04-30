import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';

export interface PaymentSession {
  paymentId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

@Injectable()
export class PaymentsService {
  private readonly flouciPublicKey: string;
  private readonly flouciPrivateKey: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {
    this.flouciPublicKey  = this.config.get('FLOUCI_PUBLIC_KEY', '');
    this.flouciPrivateKey = this.config.get('FLOUCI_PRIVATE_KEY', '');
    this.frontendUrl      = this.config.get('FRONTEND_URL', 'http://localhost:4200');
  }

  // ── Créer un lien de paiement Flouci ─────────────────────────────────────

  async createCheckoutSession(
    appointmentId: string,
    patientId: string,
  ): Promise<PaymentSession> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id: appointmentId },
      relations: ['doctor'],
    });

    if (!appointment) throw new NotFoundException('Rendez-vous introuvable');
    // Vérification souple : accepter userId ou patientId
    if (appointment.patientId !== patientId && (appointment as any).patient?.id !== patientId) {
      throw new BadRequestException('Accès non autorisé');
    }
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Ce rendez-vous est annulé');
    }

    // Montant en millimes (50 TND = 50000 millimes)
    const amountMillimes = 50000;

    // Mode simulé si les clés Flouci ne sont pas configurées
    if (!this.flouciPublicKey || !this.flouciPrivateKey) {
      return {
        paymentId: `sim_${appointmentId}`,
        checkoutUrl: `${this.frontendUrl}/patient/paiement?payment=simulated&appointmentId=${appointmentId}`,
        amount: 50,
        currency: 'TND',
      };
    }

    // Appel API Flouci
    try {
      const response = await fetch('https://developers.flouci.com/api/v2/generate_payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.flouciPublicKey}:${this.flouciPrivateKey}`,
        },
        body: JSON.stringify({
          amount: amountMillimes,
          success_link: `${this.frontendUrl}/patient/paiement?payment=success&appointmentId=${appointmentId}`,
          fail_link: `${this.frontendUrl}/patient/paiement?payment=cancelled`,
          developer_tracking_id: appointmentId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.result?.link) {
        throw new BadRequestException(data?.message || 'Erreur Flouci');
      }

      return {
        paymentId: data.result.payment_id,
        checkoutUrl: data.result.link,
        amount: 50,
        currency: 'TND',
      };
    } catch (err: any) {
      throw new BadRequestException('Impossible de créer le lien de paiement : ' + err.message);
    }
  }

  // ── Vérifier un paiement Flouci ───────────────────────────────────────────

  async verifyPayment(paymentId: string, appointmentId: string): Promise<void> {
    if (!this.flouciPublicKey || paymentId.startsWith('sim_')) {
      // Mode simulé : confirmer directement
      await this.appointmentRepo.update(appointmentId, {
        status: AppointmentStatus.CONFIRMED,
      });
      return;
    }

    try {
      const response = await fetch(`https://developers.flouci.com/api/v2/verify_payment/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.flouciPublicKey}:${this.flouciPrivateKey}`,
        },
      });

      const data = await response.json();

      if (data?.result?.status === 'SUCCESS') {
        await this.appointmentRepo.update(appointmentId, {
          status: AppointmentStatus.CONFIRMED,
        });
      }
    } catch {
      // Ignorer les erreurs de vérification
    }
  }

  // ── Historique paiements du patient ───────────────────────────────────────

  async getPaymentHistory(patientId: string) {
    const appointments = await this.appointmentRepo.find({
      where: { patientId },
      relations: ['doctor'],
      order: { appointmentDate: 'DESC' },
    });

    return appointments.map(a => ({
      appointmentId: a.id,
      date: a.appointmentDate,
      doctorName: a.doctor
        ? `Dr. ${(a.doctor as any).firstName ?? ''} ${(a.doctor as any).lastName ?? ''}`.trim()
        : '—',
      status: a.status,
      consultationType: a.consultationType,
      amount: 50,
      currency: 'TND',
      paid: a.status === AppointmentStatus.CONFIRMED || a.status === AppointmentStatus.COMPLETED,
    }));
  }
}
