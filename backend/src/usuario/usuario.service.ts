import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { Persona } from '../persona/entities/persona.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Persona)
    private personaRepository: Repository<Persona>,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Crear persona primero
    const persona = this.personaRepository.create({
      nombre: createUsuarioDto.nombre,
      apellido: createUsuarioDto.apellido,
      telefono: createUsuarioDto.telefono || '',
      email: createUsuarioDto.email || '',
    });
    const savedPersona = await this.personaRepository.save(persona);

    // Hash password
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Crear usuario
    const usuario = this.usuarioRepository.create({
      username: createUsuarioDto.username,
      password: hashedPassword,
      persona: savedPersona,
      rol: { id: createUsuarioDto.id_rol } as any,
      estado: createUsuarioDto.id_estado ? { id: createUsuarioDto.id_estado } as any : undefined,
    });

    const saved = await this.usuarioRepository.save(usuario);
    return this.findOne(saved.id);
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: { username, D_E_L_E_T_E_D: false },
      relations: ['rol', 'persona', 'estado'],
    });
  }

  async findAll() {
    return this.usuarioRepository.find({
      where: { D_E_L_E_T_E_D: false },
      relations: ['rol', 'persona', 'estado'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
      relations: ['rol', 'persona', 'estado'],
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario #${id} no encontrado`);
    }
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    // Actualizar persona si viene datos
    if (usuario.persona && (updateUsuarioDto.nombre || updateUsuarioDto.apellido || updateUsuarioDto.telefono || updateUsuarioDto.email)) {
      if (updateUsuarioDto.nombre) usuario.persona.nombre = updateUsuarioDto.nombre;
      if (updateUsuarioDto.apellido) usuario.persona.apellido = updateUsuarioDto.apellido;
      if (updateUsuarioDto.telefono !== undefined) usuario.persona.telefono = updateUsuarioDto.telefono;
      if (updateUsuarioDto.email !== undefined) usuario.persona.email = updateUsuarioDto.email;
      await this.personaRepository.save(usuario.persona);
    }

    // Actualizar usuario
    if (updateUsuarioDto.username) usuario.username = updateUsuarioDto.username;
    if (updateUsuarioDto.password) {
      usuario.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }
    if (updateUsuarioDto.id_rol) {
      usuario.rol = { id: updateUsuarioDto.id_rol } as any;
    }
    if (updateUsuarioDto.id_estado) {
      usuario.estado = { id: updateUsuarioDto.id_estado } as any;
    }

    await this.usuarioRepository.save(usuario);
    return this.findOne(id);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    usuario.D_E_L_E_T_E_D = true;
    await this.usuarioRepository.save(usuario);
    return { message: `Usuario #${id} eliminado` };
  }
}
