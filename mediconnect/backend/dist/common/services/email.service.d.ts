import { ConfigService } from "@nestjs/config";
export declare class EmailService {
    private configService;
    private transporter;
    private readonly logger;
    private readonly fromEmail;
    private readonly fromName;
    constructor(configService: ConfigService);
    sendPasswordResetEmail(toEmail: string, toName: string, resetUrl: string): Promise<boolean>;
    sendWelcomeEmail(toEmail: string, toName: string): Promise<boolean>;
    verifyConnection(): Promise<boolean>;
    private buildResetEmailHtml;
    private buildWelcomeEmailHtml;
}
