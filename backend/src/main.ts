import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
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

  // Enforce validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set API prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files from public/uploads folder
  app.use('/uploads', express.static(join(process.cwd(), 'public', 'uploads')));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`GoConnexions Backend running on: http://localhost:${port}/api`);
}
bootstrap();
