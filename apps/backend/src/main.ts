import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { NextFunction, Request, Response } from 'express';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

function isAddressInUseError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'EADDRINUSE';
}

function resolveFrontendDistPath() {
  const candidates = [
    join(process.cwd(), 'apps', 'frontend', 'dist'),
    join(process.cwd(), '..', 'frontend', 'dist'),
    join(__dirname, '..', '..', 'frontend', 'dist'),
  ];

  return candidates.find((candidate) => existsSync(join(candidate, 'index.html'))) ?? candidates[0];
}

function shouldServeSpaFallback(path: string, method: string) {
  if (!['GET', 'HEAD'].includes(method)) return false;
  if (path === '/api' || path.startsWith('/api/')) return false;

  const staticPrefixes = ['/assets/', '/images/', '/videos/', '/icons/'];
  if (staticPrefixes.some((prefix) => path.startsWith(prefix))) return false;

  const staticFiles = ['/manifest.webmanifest', '/service-worker.js', '/favicon.ico', '/robots.txt'];
  if (staticFiles.includes(path)) return false;

  return true;
}

function configureFrontendStaticServing(app: Awaited<ReturnType<typeof NestFactory.create>>, logger: Logger) {
  const frontendDistPath = resolveFrontendDistPath();
  const indexHtmlPath = join(frontendDistPath, 'index.html');

  if (!existsSync(indexHtmlPath)) {
    logger.warn(`Frontend dist no encontrado en ${frontendDistPath}. El backend seguira sirviendo solo la API.`);
    return;
  }

  app.use(express.static(frontendDistPath, { index: false }));

  const server = app.getHttpAdapter().getInstance();
  server.use((request: Request, response: Response, next: NextFunction) => {
    if (!shouldServeSpaFallback(request.path, request.method)) {
      return next();
    }

    return response.sendFile(indexHtmlPath);
  });

  logger.log(`Frontend React servido desde ${frontendDistPath}`);
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';
  const configuredPort = configService.get<string>('PORT') ?? '3000';
  const port = Number(configuredPort);
  const corsOrigin = configService.get<string>('CORS_ORIGIN') ?? configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  const allowedOrigins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED') === 'true' || nodeEnv !== 'production';

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`PORT invalido: ${configuredPort}. Usa un numero valido, por ejemplo PORT=3000.`);
  }

  if (!databaseUrl) {
    throw new Error('DATABASE_URL es obligatorio.');
  }

  if (!jwtSecret || (nodeEnv === 'production' && jwtSecret === 'change_this_secret_before_production')) {
    throw new Error('JWT_SECRET seguro es obligatorio en produccion.');
  }

  if (!allowedOrigins.length) {
    throw new Error('CORS_ORIGIN o FRONTEND_URL es obligatorio.');
  }

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Innova Solutions API')
      .setDescription('API base del sistema integral de gestion.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument);
  }

  configureFrontendStaticServing(app, logger);

  try {
    await app.listen(port);
  } catch (error) {
    if (isAddressInUseError(error)) {
      logger.error(`El puerto ${port} ya esta en uso. Cierra la otra instancia del backend o cambia PORT en el archivo .env.`);
      logger.error(`Windows: netstat -ano | findstr :${port}`);
      logger.error('Luego libera el proceso con: taskkill /PID <PID> /F');
      logger.error(`Alternativa: cambia PORT=${port === 3000 ? 3001 : 3000} en apps/backend/.env.`);
      await app.close();
      process.exit(1);
    }

    throw error;
  }
  logger.log(`Innova Solutions API running on port ${port} (${nodeEnv})`);
}

void bootstrap();
