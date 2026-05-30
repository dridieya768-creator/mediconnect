import { Controller, Get, Post, Put, Body, Req, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PharmacienProfile } from './entities/pharmacien-profile.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('pharmacies')
@Controller('pharmacies')
export class PharmaciePublicController {
  constructor(
    @InjectRepository(PharmacienProfile)
    private readonly pharmacienRepo: Repository<PharmacienProfile>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-profile')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    const profile = await this.pharmacienRepo.findOne({ where: { userId }, relations: ['user'] });
    if (!profile) return { success: true, data: {} };
    return {
      success: true,
      data: {
        nomPharmacie:    profile.nomPharmacie,
        numeroOrdre:     profile.numeroOrdre,
        adressePharmacie: profile.adressePharmacie,
        ville:           profile.ville,
        codePostal:      profile.codePostal,
        latitude:        profile.latitude,
        longitude:       profile.longitude,
        isGarde:         profile.isGarde,
        isOuverte24h:    profile.isOuverte24h,
        photoUrl:        profile.photoUrl,
        telephone:       (profile.user as any)?.phone,
      }
    };
  }

  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('my-profile')
  async updateMyProfile(@Body() body: any, @Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    let profile = await this.pharmacienRepo.findOne({ where: { userId } });
    if (!profile) {
      profile = this.pharmacienRepo.create({ userId });
    }
    Object.assign(profile, {
      nomPharmacie:    body.nomPharmacie,
      numeroOrdre:     body.numeroOrdre,
      adressePharmacie: body.adressePharmacie,
      ville:           body.ville,
      codePostal:      body.codePostal,
      latitude:        body.latitude ? +body.latitude : null,
      longitude:       body.longitude ? +body.longitude : null,
      isGarde:         body.isGarde ?? false,
      isOuverte24h:    body.isOuverte24h ?? false,
      photoUrl:        body.photoUrl,
    });
    await this.pharmacienRepo.save(profile);
    
    if (body.telephone) {
      await this.userRepo.update(userId, { phone: body.telephone } as any);
    }
    return { success: true, message: 'Profil mis à jour' };
  }

  
  @Get()
  async getPharmacies() {
    const profiles = await this.pharmacienRepo.find({ relations: ['user'] });
    const result = profiles
      .filter(p => p.user?.status === 'ACTIVE')
      .map(p => ({
        id:           p.id,
        userId:       p.userId,
        nomPharmacie: p.nomPharmacie || `Pharmacie ${p.user?.lastName ?? ''}`,
        pharmacien:   `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim(),
        email:        p.user?.email,
        adresse:      p.adressePharmacie,
        ville:        p.ville,
        telephone:    (p.user as any)?.phone,
        isGarde:      p.isGarde,
        isOuverte24h: p.isOuverte24h,
        photoUrl:     p.photoUrl,
        latitude:     p.latitude,
        longitude:    p.longitude,
      }));
    return { success: true, data: result };
  }

  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('send-qr')
  async sendQrToPharmacy(
    @Body() body: { pharmacieUserId: string; qrCode: string; patientName?: string },
    @Req() req: any,
  ) {
    const patientId = req.user?.sub || req.user?.id;
    try {
      await this.dataSource.query(
        `INSERT INTO pharmacie_qr_requests (patient_id, patient_name, pharmacie_user_id, qr_code, status, created_at)
         VALUES ($1, $2, $3, $4, 'PENDING', NOW())`,
        [patientId, body.patientName || 'Patient', body.pharmacieUserId, body.qrCode]
      );
      return { success: true, message: 'QR-ORD envoyé à la pharmacie' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('my-qr-requests')
  async getMyQrRequests(@Req() req: any) {
    const userId = req.user?.sub || req.user?.id;
    try {
      const requests = await this.dataSource.query(
        `SELECT * FROM pharmacie_qr_requests 
         WHERE pharmacie_user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      return { success: true, data: requests };
    } catch (e: any) {
      return { success: true, data: [] };
    }
  }
}
