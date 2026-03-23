"use strict";
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
var crypto_1 = require("crypto");
// @ts-ignore
if (!globalThis.crypto)
    globalThis.crypto = crypto_1.webcrypto;
var core_1 = require("@nestjs/core");
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var config_1 = require("@nestjs/config");
var helmet_1 = require("helmet");
var app_module_1 = require("./app.module");
var http_exception_filter_1 = require("./common/filters/http-exception.filter");
var transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function () {
        var app, configService, config, document, port;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, core_1.NestFactory.create(app_module_1.AppModule, {
                        cors: {
                            origin: ["http://localhost:4200", "http://localhost:3000"],
                            credentials: true
                        },
                        logger: ["log", "error", "warn"]
                    })];
                case 1:
                    app = _a.sent();
                    configService = app.get(config_1.ConfigService);
                    // ✅ CORRECTION : Augmenter la limite payload pour les PDF en base64
                    // Doit être AVANT helmet et les autres middlewares
                    app.use(require('express').json({ limit: '50mb' }));
                    app.use(require('express').urlencoded({ limit: '50mb', extended: true }));
                    app.use(helmet_1["default"]({ crossOriginEmbedderPolicy: false }));
                    app.setGlobalPrefix("api/v1");
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: false,
                        transform: true
                    }));
                    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
                    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
                    config = new swagger_1.DocumentBuilder()
                        .setTitle("MediConnect API")
                        .setDescription("Plateforme e-Santé MediConnect")
                        .setVersion("1.0")
                        .addBearerAuth()
                        .addTag("auth", "Authentification")
                        .addTag("patients", "Patients")
                        .addTag("appointments", "Rendez-vous")
                        .addTag("prescriptions", "Ordonnances")
                        .addTag("qr-codes", "QR Codes")
                        .build();
                    document = swagger_1.SwaggerModule.createDocument(app, config);
                    swagger_1.SwaggerModule.setup("api/docs", app, document, {
                        swaggerOptions: { persistAuthorization: true }
                    });
                    port = configService.get("PORT", 3000);
                    return [4 /*yield*/, app.listen(port)];
                case 2:
                    _a.sent();
                    console.log("\n╔══════════════════════════════════════════════╗");
                    console.log("║   🏥  MediConnect API — Démarré !            ║");
                    console.log("╠══════════════════════════════════════════════╣");
                    console.log("\u2551   API:     http://localhost:" + port + "/api/v1/auth/login  \u2551");
                    console.log("\u2551   Swagger: http://localhost:" + port + "/api/docs           \u2551");
                    console.log("╚══════════════════════════════════════════════╝\n");
                    return [2 /*return*/];
            }
        });
    });
}
bootstrap()["catch"](function (err) {
    console.error("\n❌ Erreur au démarrage:", err.message);
    console.error("Stack complète:", err.stack);
    if (err.message.includes("password")) {
        console.error("💡 Vérifiez DB_PASSWORD dans le fichier .env");
    }
    process.exit(1);
});
