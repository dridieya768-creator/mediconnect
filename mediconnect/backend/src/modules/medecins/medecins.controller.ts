import { Controller, Get, Delete, Put, Body, UseGuards, Param, Patch, Query } from '@nestjs/common';
import { MedecinsService } from './medecins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '@modules/users/entities/user.entity';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UpdateAvailabilityDto } from './update-availability.dto';
import { SearchMedecinsDto } from './dto/search-medecins.dto';
import { GetSlotsQueryDto } from './dto/get-slots-query.dto';

// DTO
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
    console.log('[availability] body received:', dto);
    return this.medecinsService.updateAvailability(user.id, dto);
  }

  @Get('availability')
  async getAvailability(@CurrentUser() user: User) {
    return this.medecinsService.getAvailability(user.id);
  }

  // ✅ CORRECTION : Utiliser @CurrentUser() au lieu de @Request()
  @Patch('appointments/:appointmentId/accept')
  async acceptAppointment(
    @CurrentUser() user: User,
    @Param('appointmentId') appointmentId: string
  ) {
    console.log(`[Controller] Accepting appointment ${appointmentId} for doctor ${user.id}`);
    return this.medecinsService.acceptAppointment(user.id, appointmentId);
  }

  @Get('me')
  async getMe(@CurrentUser() user: User) {
    const profile = await this.medecinsService.getProfile(user.id);
    return {
      ...user,
      id: user.id,
      data: {
        ...user,
        id: user.id,
        profile: profile,
      }
    };
  }

  @Delete('patients/:patientId')
  async removePatient(
    @CurrentUser() user: User,
    @Param('patientId') patientId: string
  ) {
    return this.medecinsService.removePatientFromDoctorList(user.id, patientId);
  }

  @Get('patients/:patientId/check')
  async checkPatient(
    @CurrentUser() user: User,
    @Param('patientId') patientId: string
  ) {
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

  @Get(':id/availability')
  async getMedecinAvailabilityById(@Param('id') id: string) {
    console.log(`[Controller] GET availability for medecin: ${id}`);
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