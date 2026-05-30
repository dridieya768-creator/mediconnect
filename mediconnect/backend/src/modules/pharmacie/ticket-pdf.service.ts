import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TicketData {
  delivranceId: string;
  delivreAt: Date;
  patient: { nom: string; prenom: string; nss: string };
  pharmacien: { nom: string; prenom: string };
  qrOrdCode: string;
  medicaments: {
    cip: string;
    nom: string;
    dosage?: string;
    posologie?: string;
    duree?: string;
    quantiteDelivree: number;
    prixUnitaire: number;
    partCnam: number;
    partPatient: number;
  }[];
  financier: {
    totalCnam: number;
    totalPatient: number;
    totalGeneral: number;
  };
}

@Injectable()
export class TicketPdfService {
  async generateTicket(data: TicketData): Promise<string> {
    
    const PDFDocument = require('pdfkit');
    const ticketsDir = path.join(process.cwd(), 'uploads', 'tickets');
    fs.mkdirSync(ticketsDir, { recursive: true });

    const fileName = `ticket-${data.delivranceId}.pdf`;
    const filePath = path.join(ticketsDir, fileName);

    await new Promise<void>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);
        stream.on('finish', resolve);
        stream.on('error', reject);
        doc.on('error', reject);

        
        doc.fontSize(20).fillColor('#1a56db').text('MediConnect', 50, 50);
        doc.fontSize(10).fillColor('#64748b').text('Plateforme e-Santé', 50, 75);
        doc.fontSize(18).fillColor('#0f172a').text('TICKET DE DÉLIVRANCE', 300, 50, { align: 'right' });
        doc.fontSize(10).fillColor('#64748b').text(
          `N° ${data.delivranceId.substring(0, 16).toUpperCase()}`,
          300, 75, { align: 'right' }
        );

        const dateStr = new Date(data.delivreAt).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
        });
        const heureStr = new Date(data.delivreAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit', minute: '2-digit',
        });
        doc.fontSize(10).fillColor('#64748b').text(`Délivré le ${dateStr} à ${heureStr}`, 300, 90, { align: 'right' });

        doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#1a56db').lineWidth(2).stroke();

        
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PATIENT', 50, 130);
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(`${data.patient.prenom} ${data.patient.nom}`, 50, 145);
        doc.fontSize(10).fillColor('#475569').font('Helvetica').text(`NSS : ${data.patient.nss}`, 50, 162);

        
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PHARMACIEN', 300, 130);
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(`${data.pharmacien.prenom} ${data.pharmacien.nom}`, 300, 145);

        doc.moveTo(50, 185).lineTo(545, 185).strokeColor('#e2e8f0').lineWidth(1).stroke();

        
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDICAMENTS DÉLIVRÉS', 50, 200);

        doc.rect(50, 215, 495, 24).fillColor('#1a56db').fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text('Médicament', 58, 223);
        doc.text('Dosage', 175, 223);
        doc.text('Posologie', 245, 223);
        doc.text('Durée', 340, 223);
        doc.text('Qté', 390, 223);
        doc.text('CNAM', 420, 223);
        doc.text('Patient', 475, 223);

        let y = 245;
        data.medicaments.forEach((med, i) => {
          if (i % 2 === 0) {
            doc.rect(50, y - 4, 495, 22).fillColor('#f8fafc').fill();
          }
          doc.fontSize(10).fillColor('#0f172a').font('Helvetica');
          doc.text(med.nom, 58, y, { width: 112 });
          doc.text(med.dosage || '—', 175, y, { width: 65 });
          doc.text(med.posologie || '—', 245, y, { width: 90 });
          doc.text(med.duree || '—', 340, y, { width: 45 });
          doc.text(String(med.quantiteDelivree), 390, y, { width: 25 });
          doc.text(`${med.partCnam.toFixed(2)} TND`, 420, y, { width: 50 });
          doc.text(`${med.partPatient.toFixed(2)} TND`, 475, y, { width: 65 });
          y += 22;
        });

        y += 8;
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
        y += 16;

        
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('RÉCAPITULATIF FINANCIER', 50, y);
        y += 16;

        doc.rect(300, y, 245, 100).fillColor('#f8fafc').fill();
        doc.rect(300, y, 245, 100).strokeColor('#e2e8f0').lineWidth(1).stroke();

        doc.fontSize(11).fillColor('#0f172a').font('Helvetica');
        doc.text('Total Général :', 310, y + 10);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${data.financier.totalGeneral.toFixed(2)} TND`, 430, y + 10, { align: 'right', width: 105 });

        doc.font('Helvetica').fillColor('#64748b').text('Part CNAM :', 310, y + 30);
        doc.font('Helvetica-Bold').fillColor('#64748b').text(`${data.financier.totalCnam.toFixed(2)} TND`, 430, y + 30, { align: 'right', width: 105 });

        doc.moveTo(310, y + 52).lineTo(540, y + 52).strokeColor('#94a3b8').lineWidth(1).stroke();

        doc.fontSize(13).font('Helvetica-Bold').fillColor('#1a56db').text('À PAYER PAR LE PATIENT :', 310, y + 60);
        doc.fontSize(15).font('Helvetica-Bold').fillColor('#1a56db').text(`${data.financier.totalPatient.toFixed(2)} TND`, 430, y + 58, { align: 'right', width: 105 });

        y += 120;

      
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
        y += 16;
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('RÉFÉRENCE ORDONNANCE', 50, y);
        y += 14;
        doc.fontSize(10).fillColor('#475569').font('Helvetica-Oblique').text(`QR-ORD : ${data.qrOrdCode}`, 50, y);

        
        doc.moveTo(50, 760).lineTo(545, 760).strokeColor('#e2e8f0').lineWidth(1).stroke();
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica');
        doc.text(`Délivrance ID : ${data.delivranceId}`, 50, 770);
        doc.text('Document officiel MediConnect — e-Santé', 300, 770, { align: 'right', width: 245 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });

    return `/uploads/tickets/${fileName}`;
  }
}
