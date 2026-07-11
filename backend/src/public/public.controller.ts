import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../producto/entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';

@Controller('public')
export class PublicController {
    constructor(
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(Categoria)
        private categoriaRepository: Repository<Categoria>,
    ) { }

    @Get('menu')
    async getMenu() {
        const productos = await this.productoRepository.find({
            where: { D_E_L_E_T_E_D: false, disponible: true },
            relations: ['categoria'],
            order: { id: 'ASC' },
        });

        return productos.map(producto => ({
            ...producto,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                nombre: producto.categoria.nombre,
            } : null,
        }));
    }

    @Get('categorias')
    async getCategorias() {
        return this.categoriaRepository.find({
            where: { D_E_L_E_T_E_D: false },
            order: { id: 'ASC' },
        });
    }

    @Get('productos/:id')
    async getProducto(@Param('id') id: string) {
        const producto = await this.productoRepository.findOne({
            where: { id: +id, D_E_L_E_T_E_D: false },
            relations: ['categoria'],
        });

        if (!producto) return null;

        return {
            ...producto,
            categoria: producto.categoria ? {
                id: producto.categoria.id,
                nombre: producto.categoria.nombre,
            } : null,
        };
    }
}
