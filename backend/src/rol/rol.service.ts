import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) { }

  async create(createRolDto: CreateRolDto) {
    const rol = this.rolRepository.create({
      nombre: createRolDto.nombre,
      estado: createRolDto.id_estado ? { id: createRolDto.id_estado } as any : undefined,
    });
    return this.rolRepository.save(rol);
  }

  async findAll() {
    return this.rolRepository.find({
      where: { D_E_L_E_T_E_D: false },
      relations: ['estado'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const rol = await this.rolRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
      relations: ['estado'],
    });
    if (!rol) {
      throw new NotFoundException(`Rol #${id} no encontrado`);
    }
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.findOne(id);
    if (updateRolDto.nombre) rol.nombre = updateRolDto.nombre;
    if (updateRolDto.id_estado) {
      rol.estado = { id: updateRolDto.id_estado } as any;
    }
    return this.rolRepository.save(rol);
  }

  async remove(id: number) {
    const rol = await this.findOne(id);
    rol.D_E_L_E_T_E_D = true;
    await this.rolRepository.save(rol);
    return { message: `Rol #${id} eliminado` };
  }
}
