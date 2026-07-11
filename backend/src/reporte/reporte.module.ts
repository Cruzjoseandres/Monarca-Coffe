import { Module } from '@nestjs/common';
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from '../pedido/entities/pedido.entity';
import { DetallePedido } from '../detalle-pedido/entities/detalle-pedido.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Pedido, DetallePedido])],
    controllers: [ReporteController],
    providers: [ReporteService],
})
export class ReporteModule { }

