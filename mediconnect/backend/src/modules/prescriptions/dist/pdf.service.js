"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.PdfService = void 0;
var common_1 = require("@nestjs/common");
var PdfService = /** @class */ (function () {
    function PdfService() {
    }
    PdfService.prototype.generatePrescriptionPdf = function (prescription, doctorName, patientName) {
        return __awaiter(this, void 0, Promise, function () {
            var PDFDocument, QRCode, qrData, qrImageBuffer, qrErr_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        PDFDocument = require('pdfkit');
                        QRCode = require('qrcode');
                        qrData = prescription.qrCode || prescription.id || 'N/A';
                        qrImageBuffer = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, QRCode.toBuffer(qrData, {
                                type: 'png',
                                width: 120,
                                margin: 1,
                                color: { dark: '#0f172a', light: '#ffffff' }
                            })];
                    case 2:
                        qrImageBuffer = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        qrErr_1 = _a.sent();
                        console.warn('[PdfService] QR generation failed:', qrErr_1 === null || qrErr_1 === void 0 ? void 0 : qrErr_1.message);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, new Promise(function (resolve, reject) {
                            var _a, _b, _c;
                            try {
                                var doc_1 = new PDFDocument({ size: 'A4', margin: 50 });
                                var chunks_1 = [];
                                doc_1.on('data', function (chunk) { return chunks_1.push(chunk); });
                                doc_1.on('end', function () { return resolve(Buffer.concat(chunks_1)); });
                                doc_1.on('error', reject);
                                doc_1.fontSize(20).fillColor('#1a56db').text('MediConnect', 50, 50);
                                doc_1.fontSize(10).fillColor('#64748b').text('Plateforme e-Santé', 50, 75);
                                doc_1.fontSize(14)
                                    .fillColor('#0f172a')
                                    .font('Helvetica-Bold')
                                    .text('ORDONNANCE MÉDICALE', 340, 45, {
                                    width: 180,
                                    align: 'center'
                                });
                                doc_1.fontSize(11)
                                    .fillColor('#64748b')
                                    .font('Helvetica')
                                    .text("N\u00B0 QR-ORD : " + (prescription.qrCode || prescription.id || '').toUpperCase(), 340, 75, {
                                    width: 180,
                                    align: 'center'
                                });
                                doc_1.moveTo(50, 100).lineTo(545, 100).strokeColor('#1a56db').lineWidth(2).stroke();
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDECIN PRESCRIPTEUR', 50, 115);
                                doc_1.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text("Dr. " + doctorName, 50, 130);
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('PATIENT', 220, 115);
                                doc_1.fontSize(13).fillColor('#0f172a').font('Helvetica-Bold').text(patientName, 220, 130);
                                var issuedStr = prescription.issuedAt
                                    ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : '—';
                                var expiresStr = prescription.expiresAt
                                    ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                                    : '—';
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'ÉMISSION", 220, 152);
                                doc_1.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(issuedStr, 220, 164);
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text("DATE D'EXPIRATION", 220, 180);
                                doc_1.fontSize(10).fillColor('#0f172a').font('Helvetica-Bold').text(expiresStr, 220, 192);
                                // Colonne QR Code (x=400, width=95) — reste dans la zone utile (max 545)
                                if (qrImageBuffer) {
                                    doc_1.image(qrImageBuffer, 400, 108, { width: 95, height: 95 });
                                    doc_1.fontSize(7).fillColor('#64748b').font('Helvetica')
                                        .text('Scanner pour vérifier', 400, 206, { width: 95, align: 'center' });
                                }
                                doc_1.moveTo(50, 225).lineTo(545, 225).strokeColor('#e2e8f0').lineWidth(1).stroke();
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('MÉDICAMENTS PRESCRITS', 50, 238);
                                doc_1.rect(50, 253, 495, 24).fillColor('#1a56db').fill();
                                doc_1.fontSize(10).fillColor('white').font('Helvetica-Bold');
                                doc_1.text('Médicament', 58, 261);
                                doc_1.text('Dosage', 220, 261);
                                doc_1.text('Posologie', 310, 261);
                                doc_1.text('Durée', 440, 261);
                                doc_1.text('Qté', 500, 261);
                                var meds = ((_a = prescription.medications) !== null && _a !== void 0 ? _a : []).filter(function (m) { return m.name && m.name.trim(); });
                                var y_1 = 283;
                                meds.forEach(function (m, i) {
                                    if (i % 2 === 0) {
                                        doc_1.rect(50, y_1 - 4, 495, 22).fillColor('#f8fafc').fill();
                                    }
                                    doc_1.fontSize(11).fillColor('#0f172a').font('Helvetica');
                                    doc_1.text(m.name || '', 58, y_1, { width: 155 });
                                    doc_1.text(m.dosage || '', 220, y_1, { width: 85 });
                                    doc_1.text(m.posology || '', 310, y_1, { width: 125 });
                                    doc_1.text((m.durationDays || '') + "j", 440, y_1);
                                    doc_1.text(String(m.quantity || ''), 500, y_1);
                                    y_1 += 26;
                                });
                                if (prescription.notes) {
                                    y_1 += 10;
                                    doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('NOTES', 50, y_1);
                                    y_1 += 14;
                                    doc_1.fontSize(11).fillColor('#475569').font('Helvetica-Oblique').text(prescription.notes, 50, y_1, { width: 495 });
                                    y_1 += 30;
                                }
                                var imaging = (_b = prescription.imagingRequests) !== null && _b !== void 0 ? _b : [];
                                if (imaging.length > 0) {
                                    y_1 += 10;
                                    doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('BON D\'IMAGERIE MÉDICALE', 50, y_1);
                                    y_1 += 14;
                                    doc_1.rect(50, y_1, 495, 22).fillColor('#0f275a').fill();
                                    doc_1.fontSize(10).fillColor('white').font('Helvetica-Bold');
                                    doc_1.text('Type d\'examen', 58, y_1 + 6);
                                    doc_1.text('Région', 220, y_1 + 6);
                                    doc_1.text('Urgence', 360, y_1 + 6);
                                    y_1 += 26;
                                    imaging.forEach(function (img, i) {
                                        if (i % 2 === 0)
                                            doc_1.rect(50, y_1 - 4, 495, 22).fillColor('#f0f7ff').fill();
                                        doc_1.fontSize(11).fillColor('#0f172a').font('Helvetica');
                                        doc_1.text(img.type || '—', 58, y_1, { width: 155 });
                                        doc_1.text(img.region || '—', 220, y_1, { width: 135 });
                                        var urgBadge = img.urgency === 'URGENT' ? '⚠ URGENT' : 'Normal';
                                        doc_1.fillColor(img.urgency === 'URGENT' ? '#dc2626' : '#16a34a').text(urgBadge, 360, y_1);
                                        y_1 += 22;
                                        if (img.clinicalReason) {
                                            doc_1.fontSize(9).fillColor('#64748b').font('Helvetica-Oblique')
                                                .text("Motif : " + img.clinicalReason, 68, y_1, { width: 470 });
                                            y_1 += 16;
                                        }
                                    });
                                    y_1 += 10;
                                }
                                // Bon d'analyse médicale 
                                var analyses = (_c = prescription.analysisRequests) !== null && _c !== void 0 ? _c : [];
                                if (analyses.length > 0) {
                                    y_1 += 10;
                                    doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('BON D\'ANALYSE MÉDICALE', 50, y_1);
                                    y_1 += 14;
                                    doc_1.rect(50, y_1, 495, 22).fillColor('#064e3b').fill();
                                    doc_1.fontSize(10).fillColor('white').font('Helvetica-Bold');
                                    doc_1.text('Type d\'analyse', 58, y_1 + 6);
                                    doc_1.text('Motif / Indication', 260, y_1 + 6);
                                    y_1 += 26;
                                    analyses.forEach(function (ana, i) {
                                        if (i % 2 === 0)
                                            doc_1.rect(50, y_1 - 4, 495, 22).fillColor('#f0fdf4').fill();
                                        doc_1.fontSize(11).fillColor('#0f172a').font('Helvetica');
                                        doc_1.text(ana.typeAnalyse || '—', 58, y_1, { width: 195 });
                                        doc_1.text(ana.motif || '—', 260, y_1, { width: 280 });
                                        y_1 += 22;
                                    });
                                    y_1 += 10;
                                }
                                doc_1.moveTo(50, y_1).lineTo(545, y_1).strokeColor('#e2e8f0').lineWidth(1).stroke();
                                y_1 += 16;
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('CACHET ET SIGNATURE DU MÉDECIN', 50, y_1);
                                y_1 += 14;
                                doc_1.rect(50, y_1, 200, 90).strokeColor('#e2e8f0').lineWidth(1).stroke();
                                doc_1.fontSize(11).fillColor('#0f172a').font('Helvetica-Bold').text("Dr. " + doctorName, 60, y_1 + 8);
                                doc_1.fontSize(9).fillColor('#64748b').font('Helvetica').text('Médecin MediConnect', 60, y_1 + 22);
                                if (prescription.signatureImage) {
                                    try {
                                        var sigBuffer = Buffer.from(prescription.signatureImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                                        doc_1.image(sigBuffer, 60, y_1 + 34, { width: 120, height: 40 });
                                    }
                                    catch ( /* ignore si image invalide */_d) { /* ignore si image invalide */ }
                                }
                                if (prescription.signedAt) {
                                    var signedStr = new Date(prescription.signedAt).toLocaleDateString('fr-FR', {
                                        day: '2-digit', month: 'long', year: 'numeric'
                                    }) + ' à ' + new Date(prescription.signedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                    doc_1.fontSize(8).fillColor('#16a34a').font('Helvetica').text("Sign\u00E9 le " + signedStr, 60, y_1 + 76);
                                    var sigDisplay = prescription.electronicSignature
                                        ? prescription.electronicSignature.replace('HMAC-SHA256:', '').substring(0, 20) + '...'
                                        : '';
                                    if (sigDisplay) {
                                        doc_1.fontSize(7).fillColor('#94a3b8').font('Helvetica').text("Sig: " + sigDisplay, 60, y_1 + 86, { width: 185 });
                                    }
                                }
                                else {
                                    doc_1.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Signature en attente', 60, y_1 + 76);
                                }
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica').text('VALIDITÉ ET AUTHENTICITÉ', 310, y_1 - 14);
                                doc_1.rect(310, y_1, 235, 80).strokeColor('#e2e8f0').lineWidth(1).stroke();
                                doc_1.fontSize(9).fillColor('#374151').font('Helvetica').text('Ordonnance valable 90 jours', 320, y_1 + 10);
                                doc_1.fontSize(9).fillColor('#374151').text("\u00C9mise le : " + (prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR') : '—'), 320, y_1 + 26);
                                doc_1.fontSize(9).fillColor('#374151').text("Expire le : " + (prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR') : '—'), 320, y_1 + 42);
                                doc_1.fontSize(8).fillColor('#94a3b8').font('Helvetica-Oblique').text('Document généré par MediConnect', 320, y_1 + 60);
                                doc_1.moveTo(50, 760).lineTo(545, 760).strokeColor('#e2e8f0').lineWidth(1).stroke();
                                doc_1.fontSize(9).fillColor('#94a3b8').font('Helvetica');
                                doc_1.text("Code QR: " + (prescription.qrCode || 'N/A'), 50, 770);
                                doc_1.text('Document officiel MediConnect — e-Santé', 300, 770, { align: 'right', width: 245 });
                                doc_1.end();
                            }
                            catch (err) {
                                reject(err);
                            }
                        })];
                }
            });
        });
    };
    PdfService = __decorate([
        common_1.Injectable()
    ], PdfService);
    return PdfService;
}());
exports.PdfService = PdfService;
