import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) { }

  @Post()
  @Roles('ADMINISTRADOR')
  async create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  async findAll() {
    return await this.usuarioService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  async findOne(@Param('id') id: string) {
    return await this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  async update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return await this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return await this.usuarioService.remove(+id);
  }
}
