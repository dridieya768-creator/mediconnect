import { Controller, Get, Delete, Put, Body, UseGuards, Param, Patch, Query } from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '@modules/users/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UpdateAvailabilityDto } from './update-availability.dto';
import { SearchMedecinsDto } from './dto/search-medecins.dto';
import { GetSlotsQueryDto } from './dto/get-slots-query.dto';

export class UpdateMedecinProfileDto {
  titre?: string;
  specialite?: string;
  numeroOrdrePro?: string;
  diplomes?: string;
  photoPro?: string;
  photosCabinet?: string;
  languesParlees?: string;
  biographie?: string;
  adresseCabinet?: string;
  geoGoogleMaps?: string;
  ville?: string;
  telephonePro?: string;
  emailPro?: string;
  tarifs?: string;
  actesCouverts?: string;
  assurancesAcceptees?: string;
  agendaConnecte?: boolean;
  disponTeleconsult?: boolean;
  connexionVideoIntegree?: boolean;
  profilSEO?: boolean;
  statsAnalytics?: boolean;
}

@Controller('medecins')
@UseGuards(JwtAuthGuard)
export class MedecinsController {
  constructor(private readonly medecinsService: MedecinsService) {}

  @Put('availability')
  async updateAvailability(@CurrentUser() user: User, @Body() dto: UpdateAvailabilityDto) {
    return this.medecinsService.updateAvailability(user.id, dto);
  }

  @Get('availability')
  async getAvailability(@CurrentUser() user: User) {
    return this.medecinsService.getAvailability(user.id);
  }

  @Patch('appointments/:appointmentId/accept')
  async acceptAppointment(
    @CurrentUser() user: User,
    @Param('appointmentId') appointmentId: string,
  ) {
    const result = await this.medecinsService.acceptAppointment(user.id, appointmentId);
    try {
      const appt = result.appointment;
      // Résoudre le patient.id depuis le patientId (qui peut être un user_id)
      const patientRows = await (this.medecinsService as any).appointmentRepository?.manager?.query(
        `SELECT id FROM patients WHERE id = $1 OR user_id = $1 LIMIT 1`,
        [appt?.patientId]
      );
      const realPatientId = patientRows?.[0]?.id;
      if (realPatientId) {
        await (this.medecinsService as any).appointmentRepository?.manager?.query(
          `INSERT INTO dossier_historique
             (id, patient_id, modifie_par_id, role_auteur, champs_modifies, snapshot_avant, commentaire, created_at)
           VALUES (gen_random_uuid(), $1, $2, 'MEDECIN', $3::jsonb, '{}'::jsonb, $4, NOW())`,
          [
            realPatientId,
            user.id,
            JSON.stringify({ rdv_confirme: { avant: { status: 'REQUESTED' }, apres: { status: 'CONFIRMED', appointmentId } } }),
            'Rendez-vous confirme',
          ],
        );
      }
    } catch { /* silencieux */ }
    return result;
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    const profile = await this.medecinsService.getProfile(user.id);
    return { ...user, id: user.id, data: { ...user, id: user.id, profile } };
  }

  @Delete('patients/:patientId')
  async removePatient(@CurrentUser() user: User, @Param('patientId') patientId: string) {
    return this.medecinsService.removePatientFromDoctorList(user.id, patientId);
  }

  @Get('patients/:patientId/check')
  async checkPatient(@CurrentUser() user: User, @Param('patientId') patientId: string) {
    return this.medecinsService.isPatientInDoctorList(user.id, patientId);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.medecinsService.getProfile(user.id);
  }

  @Put('profile')
  async updateProfile(@CurrentUser() user: User, @Body() updateDto: UpdateMedecinProfileDto) {
    return this.medecinsService.updateProfile(user.id, updateDto);
  }

  @Get()
  async getAllMedecins(@Query() query: SearchMedecinsDto) {
    return this.medecinsService.getAllMedecinsWithProfiles(query.search, query.specialite, query.ville);
  }

  @Get('my-patients')
async getMyPatients(@CurrentUser() user: User) {
  return this.medecinsService.getMyPatientsFromAppointments(user.id);
}

@Get('revenus/stats')
async getRevenus(
  @CurrentUser() user: User,
  @Query('from') from?: string,
  @Query('to') to?: string,
) {
  return this.medecinsService.getRevenus(user.id, from, to);
}

// ── Routes :id — TOUJOURS EN DERNIER ──
@Get(':id/availability')
async getMedecinAvailabilityById(@Param('id') id: string) {
  return this.medecinsService.getMedecinAvailabilityById(id);
}

@Get(':id/slots')
async getOccupiedSlots(@Param('id') id: string, @Query() query: GetSlotsQueryDto) {
  return this.medecinsService.getOccupiedSlots(id, query.startDate, query.endDate);
}

@Get(':id')
async getMedecinById(@Param('id') id: string) {
  return this.medecinsService.getMedecinById(id);
}
}
