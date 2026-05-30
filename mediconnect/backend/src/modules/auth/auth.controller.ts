

import {
  Controller, Post, Body, HttpCode, HttpStatus,
  UseGuards, Request, UseInterceptors, UploadedFiles,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nestjs/platform-express"; // ← changer ici
import { diskStorage } from "multer";
import { extname, join } from "path";
import * as fs from "fs";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Enable2faDto } from "./dto/enable-2fa.dto";
import { Verify2faDto } from "./dto/verify-2fa.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "US1 - Créer un compte" })
  @ApiConsumes("multipart/form-data", "application/json")
  @UseInterceptors(AnyFilesInterceptor({  
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = join(process.cwd(), "uploads", "doctor-docs");
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Seuls les fichiers PDF sont acceptés"), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async register(
    @Body() dto: any,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files?.length) {
      dto.documents = files.map(f => ({
        type:         f.fieldname.replace("doc_", ""),
        filename:     f.filename,
        originalName: f.originalname,
        path:         f.path,
      }));
    }
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US2 - Se connecter" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("sso/google")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US3 - Login via Google SSO" })
  googleLogin(@Body() body: { token: string }) {
    return this.authService.googleLogin(body.token);
  }

  @Post("sso/facebook")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US3 - Login via Facebook SSO" })
  facebookLogin(@Body() body: { token: string }) {
    return this.authService.facebookLogin(body.token);
  }

  @Post("2fa/setup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "US4 - Générer QR code 2FA" })
  setup2fa(@Request() req: any) {
    return this.authService.setup2fa(req.user.id);
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "US4 - Activer le 2FA" })
  enable2fa(@Request() req: any, @Body() dto: Enable2faDto) {
    return this.authService.enable2fa(req.user.id, dto);
  }

  @Post("2fa/disable")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "US4 - Désactiver le 2FA" })
  disable2fa(@Request() req: any) {
    return this.authService.disable2fa(req.user.id);
  }

  @Post("2fa/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US4 - Vérifier code 2FA" })
  verify2fa(@Body() dto: Verify2faDto) {
    return this.authService.verify2fa(dto);
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US5 - Demander réinitialisation mot de passe" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Changer le mot de passe (utilisateur connecté)" })
  changePassword(@Request() req: any, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "US5 - Réinitialiser le mot de passe" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}