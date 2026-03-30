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
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ size: 'A4', margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                doc.fontSize(20).fillColor('#1a56db').text('MediConnect', 50, 50);
                doc.fontSize(10).fillColor('#64748b').text('Plateforme e-Santé', 50, 75);
                doc.fontSize(18).fillColor('#0f172a').text('ORDONNANCE MÉDICALE', 300, 50, { align: 'right' });
                doc.fontSize(10).fillColor('#64748b').text(`N° ${(prescription.qrCode || prescription.id || '').substring(0, 16).toUpperCase()}`, 300, 75, { align: 'right' });
                doc.moveTo(50, 100).lineTo(545, 100).strokeColor('#1a56db').lineWidth(2).stroke();
                doc.fontSize(9).fillColor('#94a3b8').text('MÉDECIN PRESCRIPTEUR', 50, 120);
                doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(`Dr. ${doctorName}`, 50, 135);
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PATIENT', 300, 120);
                doc.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(patientName, 300, 135);
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
                doc.moveTo(50, 210).lineTo(545, 210).strokeColor('#e2e8f0').lineWidth(1).stroke();
                doc.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDICAMENTS PRESCRITS', 50, 225);
                doc.rect(50, 240, 495, 24).fillColor('#1a56db').fill();
                doc.fontSize(10).fillColor('white').font('Helvetica-Bold');
                doc.text('Médicament', 58, 248);
                doc.text('Dosage', 220, 248);
                doc.text('Posologie', 310, 248);
                doc.text('Durée', 440, 248);
                doc.text('Qté', 500, 248);
                const meds = prescription.medications ?? [];
                let y = 270;
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