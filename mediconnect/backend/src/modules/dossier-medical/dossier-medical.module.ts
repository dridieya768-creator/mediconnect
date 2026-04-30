import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DossierHistorique } from './entities/dossier-historique.entity';
import { DossierAccesMedecin } from './entities/dossier-acces-medecin.entity';
import { Patient } from '../patients/entities/patient.entity';
import { DossierMedicalController } from './dossier-medical.controller';
import { DossierMedicalService } from './dossier-medical.service';
import { DossierHistoriqueService } from './dossier-historique.service';
import { DossierAccesService } from './dossier-acces.service';
import { DossierHistoriqueInterceptor } from './interceptors/dossier-historique.interceptor';
import { PartageLienService } from './partage-lien.service';
import { PartageLienController } from './partage-lien.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DossierHistorique, DossierAccesMedecin, Patient]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DossierMedicalController, PartageLienController],
  providers: [
    DossierMedicalService,
    DossierHistoriqueService,
    DossierAccesService,
    DossierHistoriqueInterceptor,
    PartageLienService,
  ],
  exports: [DossierHistoriqueService, DossierAccesService, DossierHistoriqueInterceptor],
})
export class DossierMedicalModule {}
