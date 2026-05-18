"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.fromName = "MediConnect";
        const host = this.configService.get("SMTP_HOST", "smtp.gmail.com");
        const port = this.configService.get("SMTP_PORT", 587);
        const user = this.configService.get("SMTP_USER", "");
        const pass = this.configService.get("SMTP_PASS", "");
        this.fromEmail = user;
        this.transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass },
            tls: { rejectUnauthorized: false },
        });
    }
    async sendPasswordResetEmail(toEmail, toName, resetUrl) {
        const html = this.buildResetEmailHtml(toName, resetUrl);
        const text = `Bonjour ${toName},\n\nCliquez sur ce lien pour réinitialiser votre mot de passe :\n${resetUrl}\n\nCe lien expire dans 1 heure.\n\nMediConnect`;
        try {
            await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: toEmail,
                subject: "🔐 Réinitialisation de votre mot de passe MediConnect",
                text,
                html,
            });
            this.logger.log(`Email reset envoyé à ${toEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur envoi email à ${toEmail}:`, error);
            return false;
        }
    }
    async sendPartageEmail(toEmail, patientNom, lien, expiresAt) {
        try {
            const expireStr = new Date(expiresAt).toLocaleString('fr-FR', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });
            await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: toEmail,
                subject: '🏥 Accès partagé à un dossier médical MediConnect',
                html: `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" style="background:white;border-radius:16px;overflow:hidden;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#0f172a,#134e4a);padding:40px;text-align:center;">
        <div style="font-size:36px;">🏥</div>
        <h1 style="color:white;margin:8px 0 0;font-weight:300;">MediConnect</h1>
        <p style="color:#67e8f9;margin:4px 0 0;font-size:13px;">Partage de dossier médical</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="color:#0f172a;">Un dossier médical a été partagé avec vous</h2>
        <p style="color:#64748b;line-height:1.7;">
          Le patient <strong style="color:#0f172a;">${patientNom}</strong> vous a accordé un accès temporaire
          à son dossier médical sur MediConnect.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:24px 0;">
          <p style="margin:0;font-size:13px;color:#166534;">
            ⏳ <strong>Accès valide jusqu'au :</strong> ${expireStr}
          </p>
        </div>
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:16px 20px;margin:0 0 24px;">
          <p style="margin:0;font-size:13px;color:#854d0e;">
            🔒 Ce lien est à usage unique et confidentiel. Ne le partagez pas.
          </p>
        </div>
        <a href="${lien}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:white;text-decoration:none;border-radius:10px;font-weight:700;">
          Accéder au dossier médical →
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
          Lien direct : <a href="${lien}" style="color:#0d9488;word-break:break-all;">${lien}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 MediConnect — Accès sécurisé et temporaire</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
            });
            this.logger.log(`Email partage dossier envoyé à ${toEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur envoi email partage à ${toEmail}:`, error);
            return false;
        }
    }
    async sendPrescriptionEmail(toEmail, prescription) {
        try {
            const pdfUrl = prescription.pdfUrl
                ? `${process.env.APP_URL || 'http://localhost:3000'}${prescription.pdfUrl}`
                : null;
            await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: toEmail,
                subject: '💊 Votre ordonnance MediConnect est disponible',
                html: `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" style="background:white;border-radius:16px;overflow:hidden;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#0f172a,#134e4a);padding:40px;text-align:center;">
        <div style="font-size:36px;">💊</div>
        <h1 style="color:white;margin:8px 0 0;font-weight:300;">MediConnect</h1>
        <p style="color:#67e8f9;margin:4px 0 0;font-size:13px;">Ordonnance médicale</p>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="color:#0f172a;">Votre ordonnance est disponible</h2>
        <p style="color:#64748b;line-height:1.7;">
          Votre médecin a émis une nouvelle ordonnance sur MediConnect.
        </p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:24px 0;">
          <p style="margin:0;font-size:13px;color:#166534;">
            📋 <strong>Référence :</strong> ${prescription.qrCode || prescription.id}<br>
            📅 <strong>Émise le :</strong> ${prescription.issuedAt ? new Date(prescription.issuedAt).toLocaleDateString('fr-FR') : '—'}<br>
            ⏳ <strong>Expire le :</strong> ${prescription.expiresAt ? new Date(prescription.expiresAt).toLocaleDateString('fr-FR') : '—'}
          </p>
        </div>
        ${pdfUrl ? `<a href="${pdfUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:white;text-decoration:none;border-radius:10px;font-weight:700;">Télécharger l'ordonnance PDF →</a>` : ''}
      </td>
    </tr>
    <tr>
      <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0;color:#94a3b8;font-size:12px;">© 2025 MediConnect — Document officiel</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
            });
            this.logger.log(`Email ordonnance envoyé à ${toEmail}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur envoi email ordonnance à ${toEmail}:`, error);
            return false;
        }
    }
    async sendWelcomeEmail(toEmail, toName) {
        try {
            await this.transporter.sendMail({
                from: `"${this.fromName}" <${this.fromEmail}>`,
                to: toEmail,
                subject: "🏥 Bienvenue sur MediConnect !",
                html: this.buildWelcomeEmailHtml(toName),
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Erreur envoi welcome email:`, error);
            return false;
        }
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            this.logger.log("Connexion SMTP OK");
            return true;
        }
        catch {
            this.logger.warn("SMTP non configuré — emails désactivés (mode dev)");
            return false;
        }
    }
    buildResetEmailHtml(name, resetUrl) {
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation mot de passe</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#134e4a);padding:40px 48px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">🏥</div>
              <h1 style="color:white;margin:0;font-size:24px;font-weight:300;letter-spacing:1px;">MediConnect</h1>
              <p style="color:#67e8f9;margin:4px 0 0;font-size:13px;">Plateforme e-Santé SaaS</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h2 style="color:#0f172a;margin:0 0 16px;font-size:22px;font-weight:600;">
                🔐 Réinitialisation de votre mot de passe
              </h2>
              <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Bonjour <strong style="color:#0f172a;">${name}</strong>,
              </p>
              <p style="color:#64748b;font-size:15px;line-height:1.7;margin:0 0 32px;">
                Vous avez demandé la réinitialisation de votre mot de passe MediConnect.
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
                Ce lien est valable <strong>1 heure</strong>.
              </p>
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 32px;">
                    <a href="${resetUrl}"
                      style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:white;text-decoration:none;border-radius:10px;font-size:16px;font-weight:700;letter-spacing:.5px;">
                      Réinitialiser mon mot de passe →
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Security note -->
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#64748b;">
                  🔒 <strong>Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation,
                  ignorez cet email. Votre mot de passe ne sera pas modifié.
                </p>
              </div>
              <!-- Fallback link -->
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                Lien direct (si le bouton ne fonctionne pas) :<br>
                <a href="${resetUrl}" style="color:#0d9488;word-break:break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 48px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                © 2025 MediConnect — Plateforme e-Santé Sécurisée<br>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
    buildWelcomeEmailHtml(name) {
        return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:40px;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="600" style="background:white;border-radius:16px;overflow:hidden;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <tr>
      <td style="background:linear-gradient(135deg,#0f172a,#134e4a);padding:40px;text-align:center;">
        <div style="font-size:36px;">🏥</div>
        <h1 style="color:white;margin:8px 0 0;font-weight:300;">MediConnect</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:40px;">
        <h2 style="color:#0f172a;">Bienvenue ${name} ! 🎉</h2>
        <p style="color:#64748b;line-height:1.7;">
          Votre compte MediConnect a été créé avec succès.
          Vous pouvez maintenant accéder à tous nos services de santé en ligne.
        </p>
        <ul style="color:#64748b;line-height:2;">
          <li>📅 Prise de rendez-vous en ligne</li>
          <li>📋 Dossier médical personnel</li>
          <li>💊 Gestion des ordonnances</li>
          <li>🧪 Résultats d'analyses</li>
        </ul>
        <a href="http://localhost:4200/auth/login"
          style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#0d9488,#14b8a6);color:white;text-decoration:none;border-radius:10px;font-weight:700;margin-top:16px;">
          Accéder à mon espace →
        </a>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map