import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Configuración de CORS habilitada para conectar el Frontend (Local, Render, Vercel, etc.)
  app.enableCors({
    origin: true, // Permite cualquier origen reflejando la petición
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
