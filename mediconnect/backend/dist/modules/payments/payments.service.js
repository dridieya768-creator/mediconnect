"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
let PaymentsService = class PaymentsService {
    constructor(config, appointmentRepo) {
        this.config = config;
        this.appointmentRepo = appointmentRepo;
        this.flouciPublicKey = this.config.get('FLOUCI_PUBLIC_KEY', '');
        this.flouciPrivateKey = this.config.get('FLOUCI_PRIVATE_KEY', '');
        this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:4200');
    }
    async createCheckoutSession(appointmentId, patientId) {
        const appointment = await this.appointmentRepo.findOne({
            where: { id: appointmentId },
            relations: ['doctor'],
        });
        if (!appointment)
            throw new common_1.NotFoundException('Rendez-vous introuvable');
        if (appointment.patientId !== patientId && appointment.patient?.id !== patientId) {
            throw new common_1.BadRequestException('Accès non autorisé');
        }
        if (appointment.status === appointment_entity_1.AppointmentStatus.CANCELLED) {
            throw new common_1.BadRequestException('Ce rendez-vous est annulé');
        }
        if (appointment.status === appointment_entity_1.AppointmentStatus.COMPLETED) {
            throw new common_1.BadRequestException('Ce rendez-vous est déjà terminé');
        }
        const amountMillimes = 50000;
        if (!this.flouciPublicKey || !this.flouciPrivateKey) {
            return {
                paymentId: `sim_${appointmentId}`,
                checkoutUrl: `${this.frontendUrl}/patient/paiement?payment=simulated&appointmentId=${appointmentId}`,
                amount: 50,
                currency: 'TND',
            };
        }
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
                throw new common_1.BadRequestException(data?.message || 'Erreur Flouci');
            }
            return {
                paymentId: data.result.payment_id,
                checkoutUrl: data.result.link,
                amount: 50,
                currency: 'TND',
            };
        }
        catch (err) {
            throw new common_1.BadRequestException('Impossible de créer le lien de paiement : ' + err.message);
        }
    }
    async verifyPayment(paymentId, appointmentId) {
        if (!this.flouciPublicKey || paymentId.startsWith('sim_')) {
            await this.appointmentRepo.update(appointmentId, {
                status: appointment_entity_1.AppointmentStatus.CONFIRMED,
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
                    status: appointment_entity_1.AppointmentStatus.CONFIRMED,
                });
            }
        }
        catch {
        }
    }
    async getPaymentHistory(patientId) {
        const appointments = await this.appointmentRepo.find({
            where: { patientId },
            relations: ['doctor'],
            order: { appointmentDate: 'DESC' },
        });
        return appointments.map(a => ({
            appointmentId: a.id,
            date: a.appointmentDate,
            doctorName: a.doctor
                ? `Dr. ${a.doctor.firstName ?? ''} ${a.doctor.lastName ?? ''}`.trim()
                : '—',
            status: a.status,
            consultationType: a.consultationType,
            amount: 50,
            currency: 'TND',
            paid: a.status === appointment_entity_1.AppointmentStatus.COMPLETED,
            payable: a.status === appointment_entity_1.AppointmentStatus.REQUESTED,
        }));
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map