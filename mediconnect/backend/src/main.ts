import { webcrypto } from 'crypto';
// @ts-ignore
if (!globalThis.crypto) (globalThis as any).crypto = webcrypto;

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ["http://localhost:4200", "http://localhost:3000"],
      credentials: true,
    },
    logger: ["log", "error", "warn"],
  });

  const configService = app.get(ConfigService);

  // ✅ CORRECTION : Augmenter la limite payload pour les PDF en base64
  // Doit être AVANT helmet et les autres middlewares
  app.use(require('express').json({ limit: '50mb' }));
  app.use(require('express').urlencoded({ limit: '50mb', extended: true }));

  app.use(helmet({ crossOriginEmbedderPolicy: false }));

  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
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

  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   🏥  MediConnect API — Démarré !            ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║   API:     http://localhost:${port}/api/v1/auth/login  ║`);
  console.log(`║   Swagger: http://localhost:${port}/api/docs           ║`);
  console.log("╚══════════════════════════════════════════════╝\n");
}

bootstrap().catch((err) => {
  console.error("\n❌ Erreur au démarrage:", err.message);
  console.error("Stack complète:", err.stack);
  if (err.message.includes("password")) {
    console.error("💡 Vérifiez DB_PASSWORD dans le fichier .env");
  }
  process.exit(1);
});