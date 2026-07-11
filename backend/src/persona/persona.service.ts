import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Persona } from './entities/persona.entity';

@Injectable()
export class PersonaService {
  constructor(
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) { }

  async create(createPersonaDto: CreatePersonaDto) {
    const persona = this.personaRepository.create({
      nombre: createPersonaDto.nombre,
      apellido: createPersonaDto.apellido,
      telefono: createPersonaDto.telefono || '',
      email: createPersonaDto.email || '',
    });
    return this.personaRepository.save(persona);
  }

  async findAll() {
    return this.personaRepository.find({
      where: { D_E_L_E_T_E_D: false },
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const persona = await this.personaRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
    });
    if (!persona) {
      throw new NotFoundException(`Persona #${id} no encontrada`);
    }
    return persona;
  }

  async update(id: number, updatePersonaDto: UpdatePersonaDto) {
    const persona = await this.findOne(id);
    if (updatePersonaDto.nombre) persona.nombre = updatePersonaDto.nombre;
    if (updatePersonaDto.apellido) persona.apellido = updatePersonaDto.apellido;
    if (updatePersonaDto.telefono !== undefined) persona.telefono = updatePersonaDto.telefono;
    if (updatePersonaDto.email !== undefined) persona.email = updatePersonaDto.email;
    return this.personaRepository.save(persona);
  }

  async remove(id: number) {
    const persona = await this.findOne(id);
    persona.D_E_L_E_T_E_D = true;
    await this.personaRepository.save(persona);
    return { message: `Persona #${id} eliminada` };
  }
}
