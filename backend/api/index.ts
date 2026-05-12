import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';

const server = express();
let app: any;

async function bootstrap() {
  if (!app) {
    const nestApp = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { logger: ['error', 'warn'] },
    );

    nestApp.enableCors({
      origin: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await nestApp.init();
    app = nestApp;
  }
  return server;
}

export default async function handler(req: any, res: any) {
  const expressApp = await bootstrap();
  expressApp(req, res);
}
