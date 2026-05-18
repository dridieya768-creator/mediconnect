/// <reference types="multer" />
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Enable2faDto } from "./dto/enable-2fa.dto";
import { Verify2faDto } from "./dto/verify-2fa.dto";
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: any, files?: Express.Multer.File[]): Promise<{
        pendingApproval?: boolean;
        message?: string;
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
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
    googleLogin(body: {
        token: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    facebookLogin(body: {
        token: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
        user: any;
    }>;
    setup2fa(req: any): Promise<{
        secret: string;
        otpauthUrl: string;
        qrCodeUrl: string;
        instructions: string;
    }>;
    enable2fa(req: any, dto: Enable2faDto): Promise<{
        message: string;
    }>;
    disable2fa(req: any): Promise<{
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
    changePassword(req: any, body: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
