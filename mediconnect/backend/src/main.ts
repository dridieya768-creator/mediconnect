import { webcrypto } from 'crypto';
// @ts-ignore
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;

// Fix SSL pour les APIs externes en développement (Windows)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: ["http://localhost:4200", "http://localhost:3001"],
      credentials: true,
    },
    logger: ["log", "error", "warn"],
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  const configService = app.get(ConfigService);

  // ✅ Augmenter la limite payload pour les PDF en base64
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '50mb' }));
  expressApp.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  // ✅ FIX : utiliser process.cwd() — même chemin que dans upload.service.ts
  const uploadsPath = join(process.cwd(), 'uploads');

  // Créer le dossier uploads s'il n'existe pas
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`[Static] Dossier uploads créé : ${uploadsPath}`);
  }

  console.log(`[Static] Servir les fichiers depuis : ${uploadsPath}`);

  // ✅ Servir les fichiers statiques depuis process.cwd()/uploads
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
  });

  // ✅ Helmet avec configuration appropriée
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = configService.get<number>("PORT", 3001);

  try {
    await app.listen(port);
    console.log("\n╔══════════════════════════════════════════════╗");
    console.log("║   🏥  MediConnect API — Démarré !            ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║   API:     http://localhost:${port}/api/v1/auth/login  ║`);
    console.log(`║   Swagger: http://localhost:${port}/api/docs           ║`);
    console.log("╚══════════════════════════════════════════════╝\n");
  } catch (err) {
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