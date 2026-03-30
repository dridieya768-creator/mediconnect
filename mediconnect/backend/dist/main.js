"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
if (!globalThis.crypto)
    globalThis.crypto = crypto_1.webcrypto;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const path_1 = require("path");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        cors: {
            origin: ["http://localhost:4200", "http://localhost:3001"],
            credentials: true,
        },
        logger: ["log", "error", "warn"],
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), { prefix: '/uploads' });
    const configService = app.get(config_1.ConfigService);
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(require('express').json({ limit: '50mb' }));
    expressApp.use(require('express').urlencoded({ limit: '50mb', extended: true }));
    const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
        console.log(`[Static] Dossier uploads créé : ${uploadsPath}`);
    }
    console.log(`[Static] Servir les fichiers depuis : ${uploadsPath}`);
    app.useStaticAssets(uploadsPath, {
        prefix: '/uploads/',
    });
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: false,
        forbidNonWhitelisted: false,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = configService.get("PORT", 3001);
    try {
        await app.listen(port);
        console.log("\n╔══════════════════════════════════════════════╗");
        console.log("║   🏥  MediConnect API — Démarré !            ║");
        console.log("╠══════════════════════════════════════════════╣");
        console.log(`║   API:     http://localhost:${port}/api/v1/auth/login  ║`);
        console.log(`║   Swagger: http://localhost:${port}/api/docs           ║`);
        console.log("╚══════════════════════════════════════════════╝\n");
    }
    catch (err) {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${port} occupé — exécutez: taskkill /IM node.exe /F`);
            process.exit(1);
        }
        throw err;
    }
}
bootstrap().catch((err) => {
    console.error("\n❌ Erreur au démarrage:", err.message);
    console.error("Stack complète:", err.stack);
    if (err.message.includes("password")) {
        console.error("💡 Vérifiez DB_PASSWORD dans le fichier .env");
    }
    process.exit(1);
});
//# sourceMappingURL=main.js.map