import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Stripe webhooks nécessitent le raw body
    rawBody: true,
  });

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // Cookie parser — doit être avant les guards JWT pour que req.cookies soit peuplé
  app.use(cookieParser());

  // Enforce validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set API prefix
  app.setGlobalPrefix('api');

  // Enable CORS — credentials: true obligatoire pour que les cookies cross-origin fonctionnent
  // FRONTEND_URL peut contenir plusieurs origines séparées par des virgules
  // (ex: "https://goconnexion.vercel.app,https://goconnexions.com")
  const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Requêtes sans header Origin (curl, serveur-à-serveur, apps mobiles) — pas soumises à la CORS du navigateur
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Autorise tous les sous-domaines *.vercel.app (previews de déploiement)
      try {
        const hostname = new URL(origin).hostname;
        if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // origin non parsable — refusé ci-dessous
      }

      return callback(new Error(`Origin ${origin} non autorisée par CORS`), false);
    },
    credentials: true,
  });

  // Serve static files from public/uploads folder
  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`GoConnexions Backend running on: http://localhost:${port}/api`);
}
bootstrap();
