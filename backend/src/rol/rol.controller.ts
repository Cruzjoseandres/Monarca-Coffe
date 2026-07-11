import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolService } from './rol.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('rol')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolController {
  constructor(private readonly rolService: RolService) { }

  @Post()
  @Roles('ADMINISTRADOR')
  async create(@Body() createRolDto: CreateRolDto) {
    return await this.rolService.create(createRolDto);
  }

  @Get()
  @Roles('ADMINISTRADOR')
  async findAll() {
    return await this.rolService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR')
  async findOne(@Param('id') id: string) {
    return await this.rolService.findOne(+id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  async update(@Param('id') id: string, @Body() updateRolDto: UpdateRolDto) {
    return await this.rolService.update(+id, updateRolDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR')
  async remove(@Param('id') id: string) {
    return await this.rolService.remove(+id);
  }
}
