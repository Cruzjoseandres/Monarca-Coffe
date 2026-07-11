import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductoService } from './producto.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('producto')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductoController {
  constructor(private readonly productoService: ProductoService) { }

  @Post()
  @Roles('ADMINISTRADOR')
  @UseInterceptors(FilesInterceptor('imagenes', 10))
  async create(@Body() createProductoDto: CreateProductoDto, @UploadedFiles() imagenes: Express.Multer.File[]) {
    return await this.productoService.create(createProductoDto, imagenes);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'MESERO')
  async findAll() {
    return await this.productoService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async findOne(@Param('id') id: string) {
    return await this.productoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @UseInterceptors(FilesInterceptor('imagenes', 10))
  async update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @UploadedFiles() imagenes: Express.Multer.File[]) {
    return await this.productoService.update(+id, updateProductoDto, imagenes);
  }

  @Delete(':id/imagen')
  @Roles('ADMINISTRADOR')
  async removeImage(@Param('id') id: string, @Body() body: { imageUrl: string }) {
    return await this.productoService.removeImage(+id, body.imageUrl);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return await this.productoService.remove(+id);
  }
}

