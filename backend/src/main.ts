import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enforce validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Set API prefix
  app.setGlobalPrefix('api');

  // Enable CORS
  app.enableCors();

  // Serve static files from public/uploads folder
  app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`GoConnexions Backend is running on: http://localhost:${port}/api`);
}
bootstrap();
