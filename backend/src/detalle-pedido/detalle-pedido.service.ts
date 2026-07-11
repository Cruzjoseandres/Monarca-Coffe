import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { Producto } from '../producto/entities/producto.entity';

@Injectable()
export class DetallePedidoService {
  constructor(
    @InjectRepository(DetallePedido)
    private detalleRepository: Repository<DetallePedido>,
    @InjectRepository(Producto)
    private productoRepository: Repository<Producto>,
  ) { }

  async create(createDetallePedidoDto: CreateDetallePedidoDto) {
    const producto = await this.productoRepository.findOne({
      where: { id: Number(createDetallePedidoDto.id_producto) },
    });
    if (!producto) {
      throw new NotFoundException(`Producto #${createDetallePedidoDto.id_producto} no encontrado`);
    }

    const cantidad = Number(createDetallePedidoDto.cantidad);
    const subtotal = Number(producto.precio) * cantidad;

    const detalle = {
      cantidad,
      subtotal,
      comentario: createDetallePedidoDto.comentario || '',
      producto: { id: producto.id } as any,
      estado: { id: 1 } as any, // ACTIVO
    };

    const detalleCreado = await this.detalleRepository.save(detalle);
    return this.findOne(detalleCreado.id);
  }

  async findByPedido(idPedido: number) {
    return this.detalleRepository.find({
      where: { pedido: { id: idPedido }, D_E_L_E_T_E_D: false },
      relations: ['producto', 'pedido', 'estado'],
      order: { id: 'ASC' },
    });
  }

  async findAll() {
    return this.detalleRepository.find({
      where: { D_E_L_E_T_E_D: false },
      relations: ['producto', 'pedido', 'estado'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number) {
    const detalle = await this.detalleRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
      relations: ['producto', 'pedido', 'estado'],
    });
    if (!detalle) {
      throw new NotFoundException(`Detalle #${id} no encontrado`);
    }
    return detalle;
  }

  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto) {
    const detalle = await this.findOne(id);

    if (updateDetallePedidoDto.cantidad !== undefined) {
      detalle.cantidad = Number(updateDetallePedidoDto.cantidad);
      const producto = await this.productoRepository.findOne({ where: { id: detalle.producto.id } });
      if (producto) {
        detalle.subtotal = Number(producto.precio) * detalle.cantidad;
      }
    }
    if (updateDetallePedidoDto.comentario !== undefined) {
      detalle.comentario = updateDetallePedidoDto.comentario;
    }
    if (updateDetallePedidoDto.cantidad_entregada !== undefined) {
      detalle.cantidad_entregada = Number(updateDetallePedidoDto.cantidad_entregada);
    }

    await this.detalleRepository.save(detalle);
    return this.findOne(id);
  }

  async bulkUpdateEntrega(items: { id: number; cantidad_entregada: number }[]) {
    if (!items || items.length === 0) return { updated: 0 };

    await Promise.all(
      items.map(({ id, cantidad_entregada }) =>
        this.detalleRepository.update(id, { cantidad_entregada: Number(cantidad_entregada) })
      )
    );

    return { updated: items.length };
  }

  async remove(id: number) {
    const detalle = await this.findOne(id);
    detalle.D_E_L_E_T_E_D = true;
    await this.detalleRepository.save(detalle);

    return { message: `Detalle #${id} eliminado` };
  }
}
