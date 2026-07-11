import { Controller, Get, Post, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from '../producto/entities/producto.entity';
import { Categoria } from '../categoria/entities/categoria.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('public')
export class PublicController {
    constructor(
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(Categoria)
        private categoriaRepository: Repository<Categoria>,
        private cloudinaryService: CloudinaryService,
    ) { }

    @Get('qr')
    async getQR() {
        const url = await this.cloudinaryService.getLatestQRUrl();
        return { url };
    }

    @Post('qr')
    @UseInterceptors(FileInterceptor('file'))
    async uploadQR(@UploadedFile() file: any) {
        if (!file) {
            return { url: null };
        }
        const url = await this.cloudinaryService.uploadImage(file.buffer, 'cafeteria_qr');
        return { url };
    }

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
