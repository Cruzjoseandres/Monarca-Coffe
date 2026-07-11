import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { Producto } from '../producto/entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Producto, Categoria])],
    controllers: [PublicController],
})
export class PublicModule { }
