import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from '../detalle-pedido/entities/detalle-pedido.entity';
import { Producto } from '../producto/entities/producto.entity';
import { Estado } from '../estado/entities/estado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, DetallePedido, Producto, Estado])],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule { }

