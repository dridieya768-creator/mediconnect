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
Object.defineProperty(exports, "__esModule", { value: true });
exports.QrCodeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const QRCode = require("qrcode");
let QrCodeService = class QrCodeService {
    constructor(configService) {
        this.configService = configService;
    }
    generateQrData(patientId, userId) {
        const signingKey = this.configService.get("QR_SIGNING_KEY") || "default-key";
        const payload = `PAT:${patientId}:${userId}`;
        const signature = crypto
            .createHmac("sha256", signingKey)
            .update(payload)
            .digest("hex")
            .substring(0, 12);
        const token = `${patientId}:${userId}:${signature}`;
        const encoded = Buffer.from(token).toString("base64url");
        return `https://localhost:4200/scan/${encoded}`;
    }
    async generateQrImage(qrData) {
        return QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: { dark: "#0f172a", light: "#ffffff" },
            errorCorrectionLevel: "H",
        });
    }
    verifyQrCode(qrData) {
        try {
            const parts = qrData.split(":");
            if (parts.length < 4 || parts[0] !== "MEDICONNECT" || parts[1] !== "PAT") {
                return { valid: false };
            }
            const patientId = parts[2];
            const userId = parts[3];
            const signature = parts[4];
            const signingKey = this.configService.get("QR_SIGNING_KEY") || "default-key";
            const payload = `PAT:${patientId}:${userId}`;
            const expectedSig = crypto
                .createHmac("sha256", signingKey)
                .update(payload)
                .digest("hex")
                .substring(0, 12);
            if (signature !== expectedSig)
                return { valid: false };
            return { valid: true, patientId, userId };
        }
        catch {
            return { valid: false };
        }
    }
};
exports.QrCodeService = QrCodeService;
exports.QrCodeService = QrCodeService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QrCodeService);
//# sourceMappingURL=qr-code.service.js.map