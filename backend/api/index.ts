import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import { VercelRequest, VercelResponse } from '@vercel/node';

const expressServer = express();
let isInitialized = false;

const bootstrap = async (): Promise<express.Express> => {
  if (!isInitialized) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressServer),
      { logger: ['error', 'warn'] },
    );

    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    await app.init();
    isInitialized = true;
  }

  return expressServer;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await bootstrap();
  app(req as any, res as any);
};
