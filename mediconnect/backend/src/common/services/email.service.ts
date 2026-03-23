import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly fromName = "MediConnect";

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>("SMTP_HOST", "smtp.gmail.com");
    const port = this.configService.get<number>("SMTP_PORT", 587);
    const user = this.configService.get<string>("SMTP_USER", "");
    const pass = this.configService.get<string>("SMTP_PASS", "");

    this.fromEmail = user;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    resetUrl: string,
  ): Promise<boolean> {
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
    } catch (error) {
      this.logger.error(`Erreur envoi email à ${toEmail}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(toEmail: string, toName: string): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: toEmail,
        subject: "🏥 Bienvenue sur MediConnect !",
        html: this.buildWelcomeEmailHtml(toName),
      });
      return true;
    } catch (error) {
      this.logger.error(`Erreur envoi welcome email:`, error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log("Connexion SMTP OK");
      return true;
    } catch {
      this.logger.warn("SMTP non configuré — emails désactivés (mode dev)");
      return false;
    }
  }

  private buildResetEmailHtml(name: string, resetUrl: string): string {
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

  private buildWelcomeEmailHtml(name: string): string {
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
}
