import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { Patient } from "../patients/entities/patient.entity";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Enable2faDto } from "./dto/enable-2fa.dto";
import { Verify2faDto } from "./dto/verify-2fa.dto";
import { NotificationsService } from '../notifications/notifications.service';
export declare class AuthService {
    private userRepository;
    private patientRepository;
    private jwtService;
    private configService;
    private notificationsService;
    private resetTokens;
    constructor(userRepository: Repository<User>, patientRepository: Repository<Patient>, jwtService: JwtService, configService: ConfigService, notificationsService: NotificationsService);
    validateUser(email: string, password: string): Promise<User | null>;
    register(registerDto: RegisterDto): Promise<{
        pendingApproval?: boolean;
        message?: string;
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    login(loginDto: LoginDto): Promise<{
        requires2fa: boolean;
        userId: string;
        message: string;
    } | {
        access_token: string;
        refresh_token: string;
        user: any;
        requires2fa?: undefined;
        userId?: undefined;
        message?: undefined;
    }>;
    setup2fa(userId: string): Promise<{
        secret: string;
        otpauthUrl: string;
        qrCodeUrl: string;
        instructions: string;
    }>;
    enable2fa(userId: string, dto: Enable2faDto): Promise<{
        message: string;
    }>;
    disable2fa(userId: string): Promise<{
        message: string;
    }>;
    verify2fa(dto: Verify2faDto): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    handleSsoLogin(ssoData: {
        provider: "google" | "facebook";
        providerId: string;
        email: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    googleLogin(googleToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    facebookLogin(fbToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    private createPatientProfile;
    generateTokens(user: User): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    private sanitizeUser;
}
