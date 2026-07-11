import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private categoriaRepository: Repository<Categoria>,
  ) { }

  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.categoriaRepository.create({
      nombre: createCategoriaDto.nombre,
    });
    return this.categoriaRepository.save(categoria);
  }

  async findAll() {
    return this.categoriaRepository.find({
      where: { D_E_L_E_T_E_D: false },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const categoria = await this.categoriaRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
    });
    if (!categoria) {
      throw new NotFoundException(`Categoría #${id} no encontrada`);
    }
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.findOne(id);
    if (updateCategoriaDto.nombre) categoria.nombre = updateCategoriaDto.nombre;
    return this.categoriaRepository.save(categoria);
  }

  async remove(id: number) {
    const categoria = await this.findOne(id);
    categoria.D_E_L_E_T_E_D = true;
    await this.categoriaRepository.save(categoria);
    return { message: `Categoría #${id} eliminada` };
  }
}
