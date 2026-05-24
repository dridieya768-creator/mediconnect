"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
let PdfService = class PdfService {
    async generatePrescriptionPdf(prescription, doctorName, patientName) {
        const PDFDocument = require('pdfkit');
        const QRCode = require('qrcode');
        const qrData = prescription.qrCode || prescription.id || 'N/A';
        let qrImageBuffer = null;
        try {
            qrImageBuffer = await QRCode.toBuffer(qrData, {
                type: 'png',
                width: 120,
                margin: 1,
                color: { dark: '#0f172a', light: '#ffffff' },
            });
        }
        catch (qrErr) {
            console.warn('[PdfService] QR generation failed:', qrErr?.message);
        }
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                doc.fontSize(20).fillColor('#1a56db').text('MediConnect', 50, 50);
                doc.fontSize(10).fillColor('#64748b').text('Plateforme e-Santé', 50, 75);
                doc.fontSize(18).fillColor('#0f172a').text('ORDONNANCE MÉDICALE', 200, 50, { align: 'right', width: 200 });
                doc.fontSize(10).fillColor('#64748b').text(`N° ${(prescription.qrCode || prescription.id || '').toUpperCase()}`, 200, 75, { align: 'right', width: 200 });
                doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#1a56db').lineWidth(2).stroke();
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDECIN PRESCRIPTEUR', 50, 115);
                doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(`Dr. ${doctorName}`, 50, 130);
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PATIENT', 220, 115);
                doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(patientName, 220, 130);
                const issuedStr = prescription.issuedAt
                    ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—';
                const expiresStr = prescription.expiresAt
                    ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                    : '—';
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'ÉMISSION", 220, 152);
                doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(issuedStr, 220, 164);
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'EXPIRATION", 220, 180);
                doc.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(expiresStr, 220, 192);
                if (qrImageBuffer) {
                    doc.image(qrImageBuffer, 400, 108, { width: 95, height: 95 });
                    doc.fontSize(7).fillColor('#64748b').font('Helvetica')
                        .text('Scanner pour vérifier', 400, 206, { width: 95, align: 'center' });
                }
                doc.moveTo(50, 225).lineTo(545, 225).strokeColor('#e2e8f0').lineWidth(1).stroke();
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDICAMENTS PRESCRITS', 50, 238);
                doc.rect(50, 253, 495, 24).fillColor('#1a56db').fill();
                doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
                doc.text('Médicament', 58, 261);
                doc.text('Dosage', 220, 261);
                doc.text('Posologie', 310, 261);
                doc.text('Durée', 440, 261);
                doc.text('Qté', 500, 261);
                const meds = (prescription.medications ?? []).filter((m) => m.name && m.name.trim());
                let y = 283;
                meds.forEach((m, i) => {
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
                if (prescription.notes) {
                    y += 10;
                    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('NOTES', 50, y);
                    y += 14;
                    doc.fontSize(11).fillColor('#475569').font('Helvetica-Oblique').text(prescription.notes, 50, y, { width: 495 });
                    y += 30;
                }
                const imaging = prescription.imagingRequests ?? [];
                if (imaging.length > 0) {
                    y += 10;
                    doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('BON D\'IMAGERIE MÉDICALE', 50, y);
                    y += 14;
                    doc.rect(50, y, 495, 22).fillColor('#0f275a').fill();
                    doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
                    doc.text('Type d\'examen', 58, y + 6);
                    doc.text('Région', 220, y + 6);
                    doc.text('Urgence', 360, y + 6);
                    y += 26;
                    imaging.forEach((img, i) => {
                        if (i % 2 === 0)
                            doc.rect(50, y - 4, 495, 22).fillColor('#f0f7ff').fill();
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
                y = Math.max(y + 20, 580);
                doc.moveTo(50, y).lineTo(545, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
                y += 16;
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('CACHET ET SIGNATURE DU MÉDECIN', 50, y);
                y += 14;
                doc.rect(50, y, 200, 90).strokeColor('#e2e8f0').lineWidth(1).stroke();
                doc.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text(`Dr. ${doctorName}`, 60, y + 8);
                doc.fontSize(9).fillColor('#64748b').font('Helvetica').text('Médecin MediConnect', 60, y + 22);
                if (prescription.signatureImage) {
                    try {
                        const sigBuffer = Buffer.from(prescription.signatureImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                        doc.image(sigBuffer, 60, y + 34, { width: 120, height: 40 });
                    }
                    catch { }
                }
                if (prescription.signedAt) {
                    const signedStr = new Date(prescription.signedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: 'long', year: 'numeric'
                    }) + ' à ' + new Date(prescription.signedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    doc.fontSize(8).fillColor('#16a34a').font('Helvetica').text(`Signé le ${signedStr}`, 60, y + 76);
                    const sigDisplay = prescription.electronicSignature
                        ? prescription.electronicSignature.replace('HMAC-SHA256:', '').substring(0, 20) + '...'
                        : '';
                    if (sigDisplay) {
                        doc.fontSize(7).fillColor('#94a3b8').font('Helvetica').text(`Sig: ${sigDisplay}`, 60, y + 86, { width: 185 });
                    }
                }
                else {
                    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Signature en attente', 60, y + 76);
                }
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('VALIDITÉ ET AUTHENTICITÉ', 310, y - 14);
                doc.rect(310, y, 235, 80).strokeColor('#e2e8f0').lineWidth(1).stroke();
                doc.fontSize(9).fillColor('#374151').font('Helvetica').text('Ordonnance valable 90 jours', 320, y + 10);
                doc.fontSize(9).fillColor('#374151').text(`Émise le : ${prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR') : '—'}`, 320, y + 26);
                doc.fontSize(9).fillColor('#374151').text(`Expire le : ${prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR') : '—'}`, 320, y + 42);
                doc.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Document généré par MediConnect', 320, y + 60);
                doc.moveTo(50, 760).lineTo(545, 760).strokeColor('#e2e8f0').lineWidth(1).stroke();
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica');
                doc.text(`Code QR: ${prescription.qrCode || 'N/A'}`, 50, 770);
                doc.text('Document officiel MediConnect — e-Santé', 300, 770, { align: 'right', width: 245 });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map