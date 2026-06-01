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
exports.QrCodeService = void 0;
var common_1 = require("@nestjs/common");
var crypto = require("crypto");
var QRCode = require("qrcode");
var QrCodeService = /** @class */ (function () {
    function QrCodeService(configService) {
        this.configService = configService;
    }
    QrCodeService.prototype.generateQrData = function (patientId, userId) {
        var signingKey = this.configService.get("QR_SIGNING_KEY") || "default-key";
        var payload = "PAT:" + patientId + ":" + userId;
        var signature = crypto
            .createHmac("sha256", signingKey)
            .update(payload)
            .digest("hex")
            .substring(0, 12);
        var token = patientId + ":" + userId + ":" + signature;
        var encoded = Buffer.from(token).toString("base64url");
        return "https://localhost:4200/scan/" + encoded;
    };
    QrCodeService.prototype.generateQrImage = function (qrData) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, QRCode.toDataURL(qrData, {
                        width: 300,
                        margin: 2,
                        color: { dark: "#0f172a", light: "#ffffff" },
                        errorCorrectionLevel: "H"
                    })];
            });
        });
    };
    QrCodeService.prototype.verifyQrCode = function (qrData) {
        try {
            var parts = qrData.split(":");
            if (parts.length < 4 || parts[0] !== "MEDICONNECT" || parts[1] !== "PAT") {
                return { valid: false };
            }
            var patientId = parts[2];
            var userId = parts[3];
            var signature = parts[4];
            var signingKey = this.configService.get("QR_SIGNING_KEY") || "default-key";
            var payload = "PAT:" + patientId + ":" + userId;
            var expectedSig = crypto
                .createHmac("sha256", signingKey)
                .update(payload)
                .digest("hex")
                .substring(0, 12);
            if (signature !== expectedSig)
                return { valid: false };
            return { valid: true, patientId: patientId, userId: userId };
        }
        catch (_a) {
            return { valid: false };
        }
    };
    QrCodeService = __decorate([
        common_1.Injectable()
    ], QrCodeService);
    return QrCodeService;
}());
exports.QrCodeService = QrCodeService;
