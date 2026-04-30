import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  async generatePrescriptionPdf(prescription: any, doctorName: string, patientName: string): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const PDFDocument = require('pdfkit');

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks as any)));
        doc.on('error', reject);

        // ── En-tête ──────────────────────────────────────────
        doc.fontSize(20).fillColor('#1a56db').text('MediConnect', 50, 50);
        doc.fontSize(10).fillColor('#64748b').text('Plateforme e-Santé', 50, 75);

        doc.fontSize(18).fillColor('#0f172a').text('ORDONNANCE MÉDICALE', 300, 50, { align: 'right' });
        doc.fontSize(10).fillColor('#64748b').text(
          `N° ${(prescription.qrCode || prescription.id || '').toUpperCase()}`,
          300, 75, { align: 'right' }
        );

        // Ligne séparatrice
        doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#1a56db').lineWidth(2).stroke();

        // ── Médecin & Patient ─────────────────────────────────
        doc.fontSize(9).fillColor('#94a3b8').text('MÉDECIN PRESCRIPTEUR', 50, 120);
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(`Dr. ${doctorName}`, 50, 135);

        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PATIENT', 300, 120);
        doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(patientName, 300, 135);

        // ── Dates ─────────────────────────────────────────────
        const issuedStr = prescription.issuedAt
          ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
          : '—';
        const expiresStr = prescription.expiresAt
          ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
          : '—';

        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'ÉMISSION", 50, 165);
        doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text(issuedStr, 50, 180);

        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'EXPIRATION", 300, 165);
        doc.fontSize(12).fillColor('#0f172a').font('Helvetica-Bold').text(expiresStr, 300, 180);

        // Ligne séparatrice
        doc.moveTo(50, 210).lineTo(545, 210).strokeColor('#e2e8f0').lineWidth(1).stroke();

        // ── Médicaments ───────────────────────────────────────
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDICAMENTS PRESCRITS', 50, 225);

        // En-tête tableau
        doc.rect(50, 240, 495, 24).fillColor('#1a56db').fill();
        doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
        doc.text('Médicament', 58, 248);
        doc.text('Dosage', 220, 248);
        doc.text('Posologie', 310, 248);
        doc.text('Durée', 440, 248);
        doc.text('Qté', 500, 248);

        // Lignes médicaments — ignorer les lignes vides
        const meds = (prescription.medications ?? []).filter((m: any) => m.name && m.name.trim());
        let y = 270;
        meds.forEach((m: any, i: number) => {
          if (i % 2 === 0) {
            doc.rect(50, y - 4, 495, 22).fillColor('#f8fafc').fill();
          }
          doc.fontSize(11).fillColor('#0f172a').font('Helvetica');
          doc.text(m.name || '', 58, y, { width: 155 });
          doc.text(m.dosage || '', 220, y, { width: 85 });
          doc.text(m.posology || '', 310, y, { width: 125 });
          doc.text(`${m.durationDays || ''}j`, 440, y);
          doc.text(String(m.quantity || ''), 500, y);
          y += 26;
        });

        // ── Notes ─────────────────────────────────────────────
        if (prescription.notes) {
          y += 10;
          doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('NOTES', 50, y);
          y += 14;
          doc.fontSize(11).fillColor('#475569').font('Helvetica-Oblique').text(prescription.notes, 50, y, { width: 495 });
          y += 30;
        }

        // ── Bon d'imagerie médicale ────────────────────────────
        const imaging = prescription.imagingRequests ?? [];
        if (imaging.length > 0) {
          y += 10;
          doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('BON D\'IMAGERIE MÉDICALE', 50, y);
          y += 14;

          // En-tête tableau imagerie
          doc.rect(50, y, 495, 22).fillColor('#0f275a').fill();
          doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
          doc.text('Type d\'examen', 58, y + 6);
          doc.text('Région', 220, y + 6);
          doc.text('Urgence', 360, y + 6);
          y += 26;

          imaging.forEach((img: any, i: number) => {
            if (i % 2 === 0) doc.rect(50, y - 4, 495, 22).fillColor('#f0f7ff').fill();
            doc.fontSize(11).fillColor('#0f172a').font('Helvetica');
            doc.text(img.type || '—', 58, y, { width: 155 });
            doc.text(img.region || '—', 220, y, { width: 135 });
            const urgBadge = img.urgency === 'URGENT' ? '⚠ URGENT' : 'Normal';
            doc.fillColor(img.urgency === 'URGENT' ? '#dc2626' : '#16a34a').text(urgBadge, 360, y);
            y += 22;
            if (img.clinicalReason) {
              doc.fontSize(9).fillColor('#64748b').font('Helvetica-Oblique')
                .text(`Motif : ${img.clinicalReason}`, 68, y, { width: 470 });
              y += 16;
            }
          });
          y += 10;
        }

        // ── Signature électronique ────────────────────────────
        y = Math.max(y + 20, 580);
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
        y += 16;

        // Colonne gauche : signature manuscrite + cachet
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('CACHET ET SIGNATURE DU MÉDECIN', 50, y);
        y += 14;
        doc.rect(50, y, 200, 90).strokeColor('#e2e8f0').lineWidth(1).stroke();
        doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text(`Dr. ${doctorName}`, 60, y + 8);
        doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('Médecin MediConnect', 60, y + 22);

        // Image de signature manuscrite si disponible
        if (prescription.signatureImage) {
          try {
            const sigBuffer = Buffer.from(
              prescription.signatureImage.replace(/^data:image\/\w+;base64,/, ''),
              'base64'
            );
            doc.image(sigBuffer, 60, y + 34, { width: 120, height: 40 });
          } catch { /* ignore si image invalide */ }
        }

        if (prescription.signedAt) {
          const signedStr = new Date(prescription.signedAt).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric'
          }) + ' à ' + new Date(prescription.signedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
          doc.fontSize(8).fillColor('#16a34a').font('Helvetica').text(`Signé le ${signedStr}`, 60, y + 76);

          // Hash court de la signature HMAC
          const sigDisplay = prescription.electronicSignature
            ? prescription.electronicSignature.replace('HMAC-SHA256:', '').substring(0, 20) + '...'
            : '';
          if (sigDisplay) {
            doc.fontSize(7).fillColor('#94a3b8').font('Helvetica').text(`Sig: ${sigDisplay}`, 60, y + 86, { width: 185 });
          }
        } else {
          doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Signature en attente', 60, y + 76);
        }

        // Colonne droite : infos légales
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('VALIDITÉ ET AUTHENTICITÉ', 310, y - 14);
        doc.rect(310, y, 235, 80).strokeColor('#e2e8f0').lineWidth(1).stroke();
        doc.fontSize(9).fillColor('#374151').font('Helvetica').text('Ordonnance valable 90 jours', 320, y + 10);
        doc.fontSize(9).fillColor('#374151').text(`Émise le : ${prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR') : '—'}`, 320, y + 26);
        doc.fontSize(9).fillColor('#374151').text(`Expire le : ${prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR') : '—'}`, 320, y + 42);
        doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Document généré par MediConnect', 320, y + 60);

        y += 100;

        // ── Pied de page ──────────────────────────────────────
        doc.moveTo(50, 760).lineTo(545, 760).strokeColor('#e2e8f0').lineWidth(1).stroke();
        doc.fontSize(9).fillColor('#94a3b8').font('Helvetica');
        doc.text(`Code QR: ${prescription.qrCode || 'N/A'}`, 50, 770);
        doc.text('Document officiel MediConnect — e-Santé', 300, 770, { align: 'right', width: 245 });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
