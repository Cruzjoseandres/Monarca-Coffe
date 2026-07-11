import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categoria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) { }

  @Post()
  @Roles('ADMINISTRADOR')
  async create(@Body() createCategoriaDto: CreateCategoriaDto) {
    return await this.categoriaService.create(createCategoriaDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'MESERO')
  async findAll() {
    return await this.categoriaService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async findOne(@Param('id') id: string) {
    return await this.categoriaService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  async update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto) {
    return await this.categoriaService.update(+id, updateCategoriaDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return await this.categoriaService.remove(+id);
  }
}
