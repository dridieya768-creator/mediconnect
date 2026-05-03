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
exports.RevenusService = exports.MedecinsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const medecin_profile_entity_1 = require("./entities/medecin-profile.entity");
const doctor_patient_entity_1 = require("./entities/doctor-patient.entity");
const user_entity_1 = require("../users/entities/user.entity");
const patient_entity_1 = require("../patients/entities/patient.entity");
const appointment_entity_1 = require("../appointments/entities/appointment.entity");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/notification.entity");
let MedecinsService = class MedecinsService {
    constructor(medecinProfileRepository, doctorPatientRepository, userRepository, appointmentRepository, patientRepository, notificationsService) {
        this.medecinProfileRepository = medecinProfileRepository;
        this.doctorPatientRepository = doctorPatientRepository;
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.notificationsService = notificationsService;
    }
    async getProfile(userId) {
        const profile = await this.medecinProfileRepository.findOne({
            where: { userId: userId },
        });
        if (!profile) {
            const newProfile = this.medecinProfileRepository.create({
                userId: userId,
                agendaConnecte: true,
                disponTeleconsult: false,
                connexionVideoIntegree: false,
                profilSEO: false,
                statsAnalytics: false,
            });
            return this.medecinProfileRepository.save(newProfile);
        }
        return profile;
    }
    async updateProfile(userId, updateData) {
        let profile = await this.medecinProfileRepository.findOne({
            where: { userId: userId },
        });
        if (!profile) {
            profile = this.medecinProfileRepository.create({
                userId: userId
            });
        }
        if (updateData.photoPro && updateData.photoPro.startsWith('data:image')) {
            updateData.photoPro = await this.saveBase64Image(updateData.photoPro, 'photos');
        }
        if (updateData.photosCabinet) {
            const photos = updateData.photosCabinet.split(',');
            const savedPhotos = [];
            for (const photo of photos) {
                const trimmedPhoto = photo.trim();
                if (trimmedPhoto.startsWith('data:image')) {
                    const savedUrl = await this.saveBase64Image(trimmedPhoto, 'cabinet');
                    savedPhotos.push(savedUrl);
                }
                else {
                    savedPhotos.push(trimmedPhoto);
                }
            }
            updateData.photosCabinet = savedPhotos.join(', ');
        }
        Object.assign(profile, updateData);
        return this.medecinProfileRepository.save(profile);
    }
    async getMedecinById(id) {
        const medecinRoles = ['MEDECIN'];
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user || !medecinRoles.includes(user.role) || user.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('MÃ©decin non trouvÃ©');
        }
        const profile = await this.medecinProfileRepository.findOne({
            where: { userId: id },
        });
        return {
            id: user.id,
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            profile: profile || null,
        };
    }
    async getAllMedecinsWithProfiles(search, specialite, ville) {
        const roles = ['MEDECIN'];
        let qb = this.userRepository
            .createQueryBuilder('user')
            .where('user.role IN (:...roles)', { roles })
            .andWhere("user.status = 'ACTIVE'");
        const trimmedSearch = search?.trim();
        const trimmedSpecialite = specialite?.trim();
        const trimmedVille = ville?.trim();
        if (trimmedSearch) {
            qb = qb.andWhere('(LOWER(user.firstName) LIKE :s OR LOWER(user.lastName) LIKE :s OR LOWER(user.email) LIKE :s)', { s: `%${trimmedSearch.toLowerCase()}%` });
        }
        const users = await qb.getMany();
        const profiles = await this.medecinProfileRepository.find();
        const profileMap = new Map(profiles.map(p => [p.userId, p]));
        let result = users.map(u => ({
            id: u.id,
            userId: u.id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            role: u.role,
            avatarUrl: u.avatarUrl,
            profile: profileMap.get(u.id) || null,
        }));
        if (trimmedSpecialite) {
            result = result.filter(d => (d.profile?.specialite || '').toLowerCase().includes(trimmedSpecialite.toLowerCase()));
        }
        if (trimmedVille) {
            result = result.filter(d => (d.profile?.ville || '').toLowerCase() === trimmedVille.toLowerCase());
        }
        return result;
    }
    async updateAvailability(userId, dto) {
        const profile = await this.medecinProfileRepository
            .createQueryBuilder('profile')
            .where('profile.user_id = :userId', { userId })
            .getOne();
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        const availabilityData = {
            workDays: dto.workDays,
            defaultDuration: dto.defaultDuration,
            acceptsTeleconsultation: dto.acceptsTeleconsultation,
            conges: dto.conges ?? [],
        };
        Object.assign(profile, {
            tarifs: availabilityData,
            ...(dto.disponTeleconsult !== undefined && { disponTeleconsult: dto.disponTeleconsult }),
            ...(dto.connexionVideoIntegree !== undefined && { connexionVideoIntegree: dto.connexionVideoIntegree }),
        });
        return this.medecinProfileRepository.save(profile);
    }
    async getAvailability(userId) {
        const profile = await this.medecinProfileRepository
            .createQueryBuilder('profile')
            .where('profile.user_id = :userId', { userId })
            .getOne();
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        let saved = {};
        if (profile.tarifs) {
            try {
                saved = typeof profile.tarifs === 'string'
                    ? JSON.parse(profile.tarifs)
                    : profile.tarifs;
            }
            catch (e) {
                saved = {};
            }
        }
        return {
            workDays: saved?.workDays ?? null,
            defaultDuration: saved?.defaultDuration ?? 30,
            acceptsTeleconsultation: saved?.acceptsTeleconsultation ?? true,
            conges: saved?.conges ?? [],
            disponTeleconsult: profile.disponTeleconsult,
            connexionVideoIntegree: profile.connexionVideoIntegree,
        };
    }
    async addPatientToDoctorList(doctorId, patientId) {
        console.log(`[Service] ðŸ”µ addPatientToDoctorList: doctor=${doctorId}, patient=${patientId}`);
        try {
            const patientExists = await this.userRepository.findOne({
                where: { id: patientId }
            });
            if (!patientExists) {
                console.error(`[Service] âŒ Patient ${patientId} does not exist in users table!`);
                return {
                    success: false,
                    message: 'Patient non trouvÃ© dans la base de donnÃ©es',
                    patient: null
                };
            }
            const existingRelation = await this.doctorPatientRepository.findOne({
                where: { doctorId, patientId }
            });
            if (!existingRelation) {
                const newRelation = this.doctorPatientRepository.create({
                    doctorId,
                    patientId,
                    addedAt: new Date(),
                    status: 'ACTIVE'
                });
                await this.doctorPatientRepository.save(newRelation);
                console.log(`[Service] âœ… Patient ${patientId} added to doctor ${doctorId}`);
                return { success: true, patient: patientExists };
            }
            console.log(`[Service] â„¹ï¸ Patient ${patientId} already in doctor ${doctorId} list`);
            return { success: false, message: 'Patient dÃ©jÃ  dans la liste', patient: patientExists };
        }
        catch (error) {
            console.error('[Service] âŒ Error in addPatientToDoctorList:', error);
            return { success: false, message: error.message, patient: null };
        }
    }
    async acceptAppointment(doctorId, appointmentId) {
        console.log(`[Service] ðŸ”µ acceptAppointment called with doctorId=${doctorId}, appointmentId=${appointmentId}`);
        try {
            const appointment = await this.appointmentRepository.findOne({
                where: { id: appointmentId, doctorId: doctorId },
                relations: ['patient']
            });
            console.log(`[Service] ðŸ“‹ Appointment found:`, {
                id: appointment?.id,
                status: appointment?.status,
                patientId: appointment?.patientId,
                hasPatient: !!appointment?.patient
            });
            if (!appointment) {
                throw new common_1.NotFoundException(`Rendez-vous ${appointmentId} non trouvÃ©`);
            }
            if (!appointment.patientId) {
                throw new common_1.BadRequestException('Le rendez-vous n\'a pas de patient associÃ©');
            }
            const patientExists = await this.userRepository.findOne({
                where: { id: appointment.patientId }
            });
            if (!patientExists) {
                console.warn(`[Service] âš ï¸ Patient ${appointment.patientId} not found in users, but continuing with appointment acceptance`);
            }
            if (appointment.status !== appointment_entity_1.AppointmentStatus.CONFIRMED) {
                await this.appointmentRepository.update({ id: appointmentId }, { status: appointment_entity_1.AppointmentStatus.CONFIRMED });
                try {
                    const patientUserId = await this.resolvePatientUserId(appointment.patientId);
                    const dateStr = new Date(appointment.appointmentDate).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' });
                    const timeStr = new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    await this.notificationsService.create({
                        userId: patientUserId,
                        type: notification_entity_1.NotificationType.APPOINTMENT_CONFIRMED,
                        title: 'Rendez-vous confirme',
                        message: `Votre rendez-vous du ${dateStr} a ${timeStr} a ete confirme.`,
                        relatedId: appointment.id,
                    });
                    console.log(`[Notifications] acceptAppointment -> notif envoyee a userId=${patientUserId}`);
                }
                catch (e) {
                    console.warn('[Notifications] Impossible de notifier le patient (accept):', e.message);
                }
                console.log(`[Service] âœ… Appointment status updated to CONFIRMED`);
            }
            else {
                console.log(`[Service] â„¹ï¸ Appointment already confirmed`);
            }
            let addedPatient = null;
            if (patientExists) {
                addedPatient = await this.addPatientToDoctorList(doctorId, appointment.patientId);
                console.log(`[Service] ðŸ‘¤ Add patient result:`, addedPatient);
            }
            else {
                console.log(`[Service] âš ï¸ Skipping adding patient to doctor list because patient doesn't exist`);
            }
            return {
                success: true,
                message: patientExists
                    ? 'Rendez-vous acceptÃ© et patient ajoutÃ© Ã  votre liste'
                    : 'Rendez-vous acceptÃ© (patient non trouvÃ© dans la base)',
                appointment: {
                    ...appointment,
                    status: appointment_entity_1.AppointmentStatus.CONFIRMED
                },
                patient: patientExists || null
            };
        }
        catch (error) {
            console.error('[Service] âŒ Error in acceptAppointment:', error);
            throw error;
        }
    }
    async resolvePatientUserId(patientId) {
        const result = await this.appointmentRepository.manager.query(`SELECT user_id FROM patients WHERE id = $1 LIMIT 1`, [patientId]);
        if (result?.length > 0 && result[0].user_id) {
            return result[0].user_id;
        }
        return patientId;
    }
    async getMyPatients(doctorId) {
        const relations = await this.doctorPatientRepository.find({
            where: { doctorId, status: 'ACTIVE' },
        });
        const patientIds = relations.map(rel => rel.patientId);
        if (patientIds.length === 0) {
            return [];
        }
        const patients = await this.userRepository
            .createQueryBuilder('user')
            .where('user.id IN (:...ids)', { ids: patientIds })
            .select(['user.id', 'user.firstName', 'user.lastName', 'user.email'])
            .getMany();
        return patients;
    }
    async isPatientInDoctorList(doctorId, patientId) {
        const relation = await this.doctorPatientRepository.findOne({
            where: { doctorId, patientId }
        });
        return !!relation;
    }
    async getMyPatientsFromAppointments(doctorId) {
        const appointments = await this.appointmentRepository.find({
            where: [
                { doctorId, status: appointment_entity_1.AppointmentStatus.CONFIRMED },
                { doctorId, status: appointment_entity_1.AppointmentStatus.COMPLETED },
            ],
            relations: ['patient'],
        });
        const seen = new Map();
        for (const appt of appointments) {
            if (appt.patient && !seen.has(appt.patientId)) {
                const patientRecord = await this.patientRepository.findOne({
                    where: { userId: appt.patientId }
                });
                seen.set(appt.patientId, {
                    id: appt.patient.id,
                    patientId: patientRecord?.id ?? appt.patientId,
                    email: appt.patient.email,
                    firstName: appt.patient.firstName,
                    lastName: appt.patient.lastName,
                    phone: appt.patient.phone,
                    rdvCount: appointments.filter(a => a.patientId === appt.patientId).length,
                });
            }
        }
        return Array.from(seen.values());
    }
    async removePatientFromDoctorList(doctorId, patientId) {
        const relation = await this.doctorPatientRepository.findOne({
            where: { doctorId, patientId }
        });
        if (!relation) {
            throw new common_1.NotFoundException('Patient non trouvÃ© dans la liste');
        }
        await this.doctorPatientRepository.remove(relation);
        return { success: true, message: 'Patient retirÃ© de la liste' };
    }
    async getMedecinAvailabilityById(id) {
        const profile = await this.medecinProfileRepository.findOne({
            where: { userId: id },
        });
        if (!profile) {
            return {
                workDays: [
                    { day: 'monday', startTime: '08:00', endTime: '17:00' },
                    { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
                    { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
                    { day: 'thursday', startTime: '08:00', endTime: '17:00' },
                    { day: 'friday', startTime: '08:00', endTime: '17:00' },
                ],
                defaultDuration: 30,
                acceptsTeleconsultation: true,
                conges: [],
                disponTeleconsult: false,
            };
        }
        let saved = {};
        if (profile.tarifs) {
            try {
                saved = typeof profile.tarifs === 'string'
                    ? JSON.parse(profile.tarifs)
                    : profile.tarifs;
            }
            catch (e) {
                saved = {};
            }
        }
        const defaultWorkDays = [
            { day: 'monday', startTime: '08:00', endTime: '17:00' },
            { day: 'tuesday', startTime: '08:00', endTime: '17:00' },
            { day: 'wednesday', startTime: '08:00', endTime: '17:00' },
            { day: 'thursday', startTime: '08:00', endTime: '17:00' },
            { day: 'friday', startTime: '08:00', endTime: '17:00' },
        ];
        const dayNameMap = {
            'Lundi': 'monday', 'Mardi': 'tuesday', 'Mercredi': 'wednesday',
            'Jeudi': 'thursday', 'Vendredi': 'friday', 'Samedi': 'saturday', 'Dimanche': 'sunday',
            'monday': 'monday', 'tuesday': 'tuesday', 'wednesday': 'wednesday',
            'thursday': 'thursday', 'friday': 'friday', 'saturday': 'saturday', 'sunday': 'sunday',
        };
        let workDays = saved?.workDays ?? null;
        if (Array.isArray(workDays) && workDays.length > 0 && workDays[0].name !== undefined) {
            const converted = [];
            for (const wd of workDays) {
                if (!wd.active)
                    continue;
                const dayKey = dayNameMap[wd.name];
                if (!dayKey)
                    continue;
                if (wd.morningStart && wd.morningEnd) {
                    converted.push({ day: dayKey, startTime: wd.morningStart, endTime: wd.morningEnd });
                }
                if (wd.afternoonStart && wd.afternoonEnd) {
                    converted.push({ day: dayKey, startTime: wd.afternoonStart, endTime: wd.afternoonEnd });
                }
            }
            workDays = converted.length > 0 ? converted : defaultWorkDays;
        }
        const result = {
            workDays: workDays ?? defaultWorkDays,
            defaultDuration: saved?.defaultDuration ?? 30,
            acceptsTeleconsultation: saved?.acceptsTeleconsultation ?? true,
            conges: saved?.conges ?? [],
            disponTeleconsult: profile.disponTeleconsult,
        };
        console.log('[getMedecinAvailabilityById] result workDays sample:', JSON.stringify(result.workDays?.slice(0, 2)));
        return result;
    }
    async getOccupiedSlots(id, startDate, endDate) {
        try {
            const profile = await this.medecinProfileRepository.findOne({
                where: { userId: id },
            });
            if (!profile) {
                return [];
            }
            const doctorId = profile.userId;
            const appointments = await this.appointmentRepository
                .createQueryBuilder('appointment')
                .where('appointment.doctorId = :id', { id: doctorId })
                .andWhere('appointment.status IN (:...statuses)', {
                statuses: [appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.REQUESTED],
            })
                .andWhere('appointment.appointmentDate >= :startDate', { startDate })
                .andWhere('appointment.appointmentDate <= :endDate', { endDate })
                .select(['appointment.appointmentDate', 'appointment.durationMinutes'])
                .getMany();
            return appointments.map((a) => ({
                appointmentDate: a.appointmentDate,
                durationMinutes: a.durationMinutes,
            }));
        }
        catch (err) {
            console.warn('[getOccupiedSlots] error:', err?.message);
            return [];
        }
    }
    async getRevenus(doctorId, from, to) {
        return RevenusService.getRevenus(this.appointmentRepository, doctorId, from, to);
    }
    async saveBase64Image(base64String, folder) {
        try {
            const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                throw new common_1.BadRequestException('Format d\'image invalide');
            }
            const extension = matches[1];
            const imageData = matches[2];
            const buffer = Buffer.from(imageData, 'base64');
            const uploadDir = path.join(process.cwd(), 'uploads', folder);
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const fileName = `${(0, uuid_1.v4)()}.${extension}`;
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            return `/uploads/${folder}/${fileName}`;
        }
        catch (error) {
            console.error('Error saving image:', error);
            throw new common_1.BadRequestException('Erreur lors de la sauvegarde de l\'image');
        }
    }
};
exports.MedecinsService = MedecinsService;
exports.MedecinsService = MedecinsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(medecin_profile_entity_1.MedecinProfile)),
    __param(1, (0, typeorm_1.InjectRepository)(doctor_patient_entity_1.DoctorPatient)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(4, (0, typeorm_1.InjectRepository)(patient_entity_1.Patient)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], MedecinsService);
class RevenusService {
    static async getRevenus(appointmentRepo, doctorId, from, to) {
        const qb = appointmentRepo
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.patient', 'patient')
            .where('a.doctorId = :doctorId', { doctorId })
            .andWhere('a.status IN (:...statuses)', {
            statuses: [appointment_entity_1.AppointmentStatus.CONFIRMED, appointment_entity_1.AppointmentStatus.COMPLETED],
        });
        if (from)
            qb.andWhere('a.appointmentDate >= :from', { from: new Date(from) });
        if (to)
            qb.andWhere('a.appointmentDate <= :to', { to: new Date(to + 'T23:59:59') });
        qb.orderBy('a.appointmentDate', 'DESC');
        const appointments = await qb.getMany();
        const TARIF = 50;
        const factures = appointments.map((a, idx) => ({
            numero: `FAC-${String(idx + 1).padStart(4, '0')}`,
            date: a.appointmentDate,
            patientNom: `${a.patient?.firstName ?? ''} ${a.patient?.lastName ?? ''}`.trim() || 'Patient',
            type: a.consultationType,
            statut: a.status,
            montant: TARIF,
            devise: 'TND',
        }));
        const totalRevenu = factures.reduce((s, f) => s + f.montant, 0);
        const nbConsult = factures.length;
        const nbTeleconsult = factures.filter(f => f.type === 'TELECONSULTATION').length;
        const nbPhysique = factures.filter(f => f.type === 'PHYSICAL').length;
        const parMois = {};
        for (const f of factures) {
            const key = new Date(f.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            parMois[key] = (parMois[key] ?? 0) + f.montant;
        }
        return {
            factures,
            stats: { totalRevenu, nbConsult, nbTeleconsult, nbPhysique, tarif: TARIF },
            parMois,
        };
    }
}
exports.RevenusService = RevenusService;
//# sourceMappingURL=medecins.service.js.map