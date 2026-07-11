import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { PersonaModule } from './persona/persona.module';
import { UsuarioModule } from './usuario/usuario.module';
import { RolModule } from './rol/rol.module';
import { PedidoModule } from './pedido/pedido.module';
import { EstadoModule } from './estado/estado.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ProductoModule } from './producto/producto.module';
import { DetallePedidoModule } from './detalle-pedido/detalle-pedido.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { ReporteModule } from './reporte/reporte.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // TypeORM crea/actualiza las tablas automáticamente
        ssl: { rejectUnauthorized: false }, // Requerido por Supabase
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    PersonaModule,
    UsuarioModule,
    RolModule,
    PedidoModule,
    EstadoModule,
    CategoriaModule,
    ProductoModule,
    DetallePedidoModule,
    AuthModule,
    PublicModule,
    ReporteModule,
    CloudinaryModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule { }
