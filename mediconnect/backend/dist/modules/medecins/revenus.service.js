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
exports.RevenusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
let RevenusService = class RevenusService {
    constructor(appointmentRepo) {
        this.appointmentRepo = appointmentRepo;
    }
    async getRevenus(doctorId, from, to) {
        const qb = this.appointmentRepo
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .where('a.doctorId = :doctorId', { doctorId })
            .andWhere('a.status IN (:...statuses)', {
            statuses: [appointment_entity_1.AppointmentStatus.COMPLETED],
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
        const factures = appointments.map((a, idx) => ({
            numero: `FAC-${String(idx + 1).padStart(4, '0')}`,
            date: a.appointmentDate,
            patientNom: `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim() ||
                'Patient',
            type: a.consultationType,
            statut: a.status,
            montant: TARIF,
            devise: 'TND',
        }));
        const totalRevenu = factures.reduce((s, f) => s + f.montant, 0);
        const nbConsult = factures.length;
        const nbTeleconsult = factures.filter((f) => f.type === 'TELECONSULTATION').length;
        const nbPhysique = factures.filter((f) => f.type === 'PHYSICAL').length;
        const parMois = {};
        for (const f of factures) {
            const key = new Date(f.date).toLocaleDateString('fr-FR', {
                month: 'short',
                year: 'numeric',
            });
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
};
exports.RevenusService = RevenusService;
exports.RevenusService = RevenusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RevenusService);
//# sourceMappingURL=revenus.service.js.map