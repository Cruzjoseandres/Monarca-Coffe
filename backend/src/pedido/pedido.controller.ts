import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pedido')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) { }

  @Post()
  @Roles('ADMINISTRADOR', 'MESERO')
  async create(@Body() createPedidoDto: CreatePedidoDto, @Req() req) {
    if (!createPedidoDto.id_usuario && req.user) {
      createPedidoDto.id_usuario = req.user.userId || req.user.sub || req.user.id;
    }
    return await this.pedidoService.create(createPedidoDto);
  }

  @Post(':id/cobrar')
  @Roles('ADMINISTRADOR', 'MESERO')
  async cobrar(@Param('id') id: string, @Body() cobroDto: any) {
    return await this.pedidoService.cobrarPedido(+id, cobroDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'MESERO')
  async findAll() {
    return await this.pedidoService.findAll();
  }

  @Get('mis-pedidos')
  @Roles('MESERO')
  async findMisPedidos(@Req() req) {
    const userId = req.user?.userId || req.user?.sub || req.user?.id;
    return await this.pedidoService.findMisPedidos(userId);
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async findOne(@Param('id') id: string) {
    return await this.pedidoService.findOne(+id);
  }

  @Post(':id/whatsapp-pdf')
  @Roles('ADMINISTRADOR', 'MESERO')
  async getWhatsAppPdf(@Param('id') id: string, @Req() req) {
    const protocol = req.protocol;
    const host = req.get('host');
    const apiUrl = `${protocol}://${host}`;
    
    const pdfUrl = await this.pedidoService.generateWhatsAppPdf(+id, apiUrl);
    return { pdfUrl };
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async update(@Param('id') id: string, @Body() updatePedidoDto: UpdatePedidoDto) {
    return await this.pedidoService.update(+id, updatePedidoDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'MESERO')
  async remove(@Param('id') id: string, @Body('justificativo') justificativo: string) {
    return await this.pedidoService.remove(+id, justificativo);
  }
}

