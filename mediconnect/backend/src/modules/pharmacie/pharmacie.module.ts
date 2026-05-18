import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { DossierHistorique } from '../dossier-medical/entities/dossier-historique.entity';
import { QrCodesModule } from '../qr-codes/qr-codes.module';
import { DossierMedicalModule } from '../dossier-medical/dossier-medical.module';
import { DelivranceController } from './delivrance.controller';
import { DelivranceService } from './delivrance.service';
import { TicketPdfService } from './ticket-pdf.service';
import { StockItem } from './entities/stock-item.entity';
import { StockMouvement } from './entities/stock-mouvement.entity';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { PharmacienProfile } from './entities/pharmacien-profile.entity';
import { PharmaciePublicController } from './pharmacie-public.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prescription, DossierHistorique, StockItem, StockMouvement, PharmacienProfile, User]),
    QrCodesModule,
    DossierMedicalModule,
  ],
  controllers: [DelivranceController, StockController, PharmaciePublicController],
  providers: [DelivranceService, TicketPdfService, StockService],
  exports: [StockService, TypeOrmModule],
})
export class PharmacieModule {}
