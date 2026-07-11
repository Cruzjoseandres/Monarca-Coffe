import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DetallePedidoService } from './detalle-pedido.service';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('detalle-pedido')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DetallePedidoController {
  constructor(private readonly detallePedidoService: DetallePedidoService) { }

  @Post()
  @Roles('ADMINISTRADOR', 'MESERO')
  async create(@Body() createDetallePedidoDto: CreateDetallePedidoDto) {
    return await this.detallePedidoService.create(createDetallePedidoDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'MESERO')
  async findAll() {
    return await this.detallePedidoService.findAll();
  }

  @Get('pedido/:idPedido')
  @Roles('ADMINISTRADOR', 'MESERO')
  async findByPedido(@Param('idPedido') idPedido: string) {
    return await this.detallePedidoService.findByPedido(+idPedido);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async findOne(@Param('id') id: string) {
    return await this.detallePedidoService.findOne(+id);
  }

  @Patch('bulk-entrega')
  @Roles('ADMINISTRADOR', 'MESERO')
  async bulkUpdateEntrega(@Body() items: { id: number; cantidad_entregada: number }[]) {
    return await this.detallePedidoService.bulkUpdateEntrega(items);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async update(@Param('id') id: string, @Body() updateDetallePedidoDto: UpdateDetallePedidoDto) {
    return await this.detallePedidoService.update(+id, updateDetallePedidoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async remove(@Param('id') id: string) {
    return await this.detallePedidoService.remove(+id);
  }
}
