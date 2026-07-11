import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetallePedido } from '../detalle-pedido/entities/detalle-pedido.entity';
import { Pedido } from '../pedido/entities/pedido.entity';

@Injectable()
export class ReporteService {
    constructor(
        @InjectRepository(DetallePedido)
        private readonly detallePedidoRepository: Repository<DetallePedido>,
        @InjectRepository(Pedido)
        private readonly pedidoRepository: Repository<Pedido>,
    ) { }

    async getVentasGenerales(startDate?: string, endDate?: string) {
        let query = this.pedidoRepository
            .createQueryBuilder('pedido')
            .innerJoin('pedido.estado', 'estado')
            .select("TO_CHAR(pedido.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz', 'YYYY-MM-DD')", 'fecha')
            .addSelect('SUM(pedido.total)', 'total_ventas')
            .addSelect('COALESCE(SUM(pedido.monto_efectivo), 0)', 'total_efectivo')
            .addSelect('COALESCE(SUM(pedido.monto_qr), 0)', 'total_qr')
            .where('pedido.D_E_L_E_T_E_D = false')
            .andWhere("estado.nombre IN ('PAGADO', 'COMPLETADO')");

        if (startDate && endDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate AND pedido.updated_at::date <= :endDate", { startDate, endDate });
        } else if (startDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate", { startDate });
        } else if (endDate) {
            query = query.andWhere("pedido.updated_at::date <= :endDate", { endDate });
        }

        const result = await query
            .groupBy("TO_CHAR(pedido.updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/La_Paz', 'YYYY-MM-DD')")
            .orderBy('fecha', 'ASC')
            .getRawMany();

        return result.map((item) => ({
            fecha: item.fecha,
            total_ventas: parseFloat(item.total_ventas) || 0,
            total_efectivo: parseFloat(item.total_efectivo) || 0,
            total_qr: parseFloat(item.total_qr) || 0,
        }));
    }

    async getVentasProducto(startDate?: string, endDate?: string) {
        let query = this.detallePedidoRepository
            .createQueryBuilder('dp')
            .innerJoin('dp.producto', 'producto')
            .innerJoin('dp.pedido', 'pedido')
            .innerJoin('pedido.estado', 'estado')
            .select('producto.nombre', 'producto')
            .addSelect('SUM(dp.cantidad)', 'cantidad_vendida')
            .addSelect('SUM(dp.subtotal)', 'ingreso_generado')
            .where('dp.D_E_L_E_T_E_D = false')
            .andWhere("estado.nombre IN ('PAGADO', 'COMPLETADO')");

        if (startDate && endDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate AND pedido.updated_at::date <= :endDate", { startDate, endDate });
        } else if (startDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate", { startDate });
        } else if (endDate) {
            query = query.andWhere("pedido.updated_at::date <= :endDate", { endDate });
        }

        const result = await query
            .groupBy('producto.id')
            .addGroupBy('producto.nombre')
            .orderBy('cantidad_vendida', 'DESC')
            .getRawMany();

        return result.map((item) => ({
            producto: item.producto,
            cantidad_vendida: parseInt(item.cantidad_vendida, 10),
            ingreso_generado: parseFloat(item.ingreso_generado) || 0,
        }));
    }

    async getRendimientoPersonal(startDate?: string, endDate?: string) {
        let query = this.pedidoRepository
            .createQueryBuilder('pedido')
            .innerJoin('pedido.usuario', 'usuario')
            .innerJoin('usuario.persona', 'persona')
            .innerJoin('pedido.estado', 'estado')
            .select("CONCAT(persona.nombre, ' ', persona.apellido)", 'mesero')
            .addSelect('usuario.id', 'usuario_id')
            .addSelect('COUNT(pedido.id)', 'pedidos_atendidos')
            .addSelect('COALESCE(SUM(pedido.total), 0)', 'total_recaudado')
            .where('pedido.D_E_L_E_T_E_D = false')
            .andWhere("estado.nombre IN ('PAGADO', 'COMPLETADO')");

        if (startDate && endDate) {
            query = query.andWhere("pedido.created_at::date >= :startDate AND pedido.created_at::date <= :endDate", { startDate, endDate });
        } else if (startDate) {
            query = query.andWhere("pedido.created_at::date >= :startDate", { startDate });
        }

        const result = await query
            .groupBy('usuario.id')
            .addGroupBy('persona.nombre')
            .addGroupBy('persona.apellido')
            .orderBy('pedidos_atendidos', 'DESC')
            .getRawMany();

        return result.map((item) => ({
            usuario_id: item.usuario_id,
            mesero: item.mesero,
            pedidos_atendidos: parseInt(item.pedidos_atendidos, 10),
            total_recaudado: parseFloat(item.total_recaudado) || 0
        }));
    }

    async getPedidosMeseroRendimiento(usuarioId: number, startDate?: string, endDate?: string) {
        let query = this.pedidoRepository
            .createQueryBuilder('pedido')
            .innerJoinAndSelect('pedido.estado', 'estado')
            .where('pedido.D_E_L_E_T_E_D = false')
            .andWhere('pedido.id_usuario = :usuarioId', { usuarioId })
            .andWhere("estado.nombre IN ('PAGADO', 'COMPLETADO')");

        if (startDate && endDate) {
            query = query.andWhere("pedido.created_at::date >= :startDate AND pedido.created_at::date <= :endDate", { startDate, endDate });
        } else if (startDate) {
            query = query.andWhere("pedido.created_at::date >= :startDate", { startDate });
        }

        const pedidos = await query
            .orderBy('pedido.created_at', 'DESC')
            .getMany();

        return pedidos.map((pedido) => ({
            id: pedido.id,
            fecha: pedido.created_at,
            cliente: pedido.nombre_cliente || 'General',
            estado_nombre: pedido.estado?.nombre || 'PAGADO',
            total_recaudado: Number(pedido.total) || 0
        }));
    }

    async getDashboardKpis(startDate?: string, endDate?: string) {
        let startOfDayUTC: Date;
        let endOfDayUTC: Date;

        if (startDate && endDate) {
            startOfDayUTC = new Date(`${startDate}T00:00:00.000Z`);
            startOfDayUTC.setUTCHours(startOfDayUTC.getUTCHours() + 4);
            endOfDayUTC = new Date(`${endDate}T23:59:59.999Z`);
            endOfDayUTC.setUTCHours(endOfDayUTC.getUTCHours() + 4);
        } else {
            const localNow = new Date(new Date().getTime() - (4 * 60 * 60 * 1000));
            const todayStr = localNow.toISOString().split('T')[0];

            startOfDayUTC = new Date(`${todayStr}T00:00:00.000Z`);
            startOfDayUTC.setUTCHours(startOfDayUTC.getUTCHours() + 4);

            endOfDayUTC = new Date(`${todayStr}T23:59:59.999Z`);
            endOfDayUTC.setUTCHours(endOfDayUTC.getUTCHours() + 4);
        }

        const ventasHoy = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .innerJoin('pedido.estado', 'estado')
            .select('SUM(pedido.total)', 'total_ventas')
            .addSelect('COALESCE(SUM(pedido.monto_efectivo), 0)', 'sum_efectivo')
            .addSelect('COALESCE(SUM(pedido.monto_qr), 0)', 'sum_qr')
            .where('pedido.D_E_L_E_T_E_D = false')
            .andWhere("estado.nombre IN ('PAGADO', 'COMPLETADO')")
            .andWhere('pedido.updated_at >= :startOfDay AND pedido.updated_at <= :endOfDay', { startOfDay: startOfDayUTC, endOfDay: endOfDayUTC })
            .getRawOne();

        const total_sales_today = parseFloat(ventasHoy?.total_ventas) || 0;
        const ventas_efectivo = parseFloat(ventasHoy?.sum_efectivo) || 0;
        const ventas_qr = parseFloat(ventasHoy?.sum_qr) || 0;

        const pedidosHoy = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .select('COUNT(pedido.id)', 'total_pedidos')
            .where('pedido.D_E_L_E_T_E_D = false')
            .andWhere('pedido.created_at >= :startOfDay AND pedido.created_at <= :endOfDay', { startOfDay: startOfDayUTC, endOfDay: endOfDayUTC })
            .getRawOne();

        const orders_processed_today = parseInt(pedidosHoy?.total_pedidos, 10) || 0;

        const popularItemResult = await this.detallePedidoRepository
            .createQueryBuilder('dp')
            .innerJoin('dp.producto', 'producto')
            .select('producto.nombre', 'nombre')
            .addSelect('SUM(dp.cantidad)', 'cantidad')
            .where('dp.D_E_L_E_T_E_D = false')
            .groupBy('producto.id')
            .addGroupBy('producto.nombre')
            .orderBy('cantidad', 'DESC')
            .limit(1)
            .getRawOne();

        const popular_item = popularItemResult ? {
            name: popularItemResult.nombre,
            orders: parseInt(popularItemResult.cantidad, 10)
        } : null;

        const recentOrders = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .leftJoinAndSelect('pedido.detalles', 'detalles')
            .leftJoinAndSelect('detalles.producto', 'producto')
            .leftJoinAndSelect('pedido.estado', 'estado')
            .where('pedido.D_E_L_E_T_E_D = false')
            .orderBy('pedido.created_at', 'DESC')
            .take(8)
            .getMany();

        const mappedRecentOrders = recentOrders.map(pedido => {
            const itemsText = pedido.detalles && pedido.detalles.length > 0
                ? pedido.detalles.map(d => `${d.cantidad}x ${d.producto?.nombre || 'Producto'}`).join(', ')
                : 'Sin items';
            return {
                id: `#P${pedido.id.toString().padStart(4, '0')}`,
                items: itemsText,
                amount: Number(pedido.total) || 0,
                status: pedido.estado?.nombre || (pedido.estado as any) === 2 ? 'Completado' : 'Pendiente'
            };
        });

        return {
            total_sales_today,
            ventas_efectivo,
            ventas_qr,
            orders_processed_today,
            sales_growth_percentage: 0,
            orders_growth_percentage: 0,
            popular_item,
            recent_orders: mappedRecentOrders
        };
    }

    async getPedidosEliminados(startDate?: string, endDate?: string) {
        let query = this.pedidoRepository
            .createQueryBuilder('pedido')
            .leftJoinAndSelect('pedido.usuario', 'usuario')
            .leftJoinAndSelect('usuario.persona', 'persona')
            .where('pedido.D_E_L_E_T_E_D = true');

        if (startDate && endDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate AND pedido.updated_at::date <= :endDate", { startDate, endDate });
        } else if (startDate) {
            query = query.andWhere("pedido.updated_at::date >= :startDate", { startDate });
        } else if (endDate) {
            query = query.andWhere("pedido.updated_at::date <= :endDate", { endDate });
        }

        const deletedOrders = await query
            .orderBy('pedido.updated_at', 'DESC')
            .getMany();

        return deletedOrders.map(pedido => ({
            id: pedido.id,
            fecha: pedido.updated_at || pedido.created_at,
            responsable: pedido.usuario?.persona ? `${pedido.usuario.persona.nombre} ${pedido.usuario.persona.apellido}` : 'Usuario Desconocido',
            justificativo: pedido.justificativo_eliminacion || 'Sin justificativo registrado'
        }));
    }

    async getActividadReciente() {
        const pedidos = await this.pedidoRepository
            .createQueryBuilder('pedido')
            .leftJoinAndSelect('pedido.detalles', 'detalles')
            .leftJoinAndSelect('detalles.producto', 'producto')
            .leftJoinAndSelect('pedido.estado', 'estado')
            .orderBy('pedido.created_at', 'DESC')
            .take(30)
            .getMany();

        return pedidos.map(pedido => {
            const itemsText = pedido.detalles && pedido.detalles.length > 0
                ? pedido.detalles.map(d => `${d.cantidad}x ${d.producto?.nombre || 'Producto'}`).join(', ')
                : 'Sin items';
            return {
                id: `#P${pedido.id.toString().padStart(4, '0')}`,
                items: pedido.D_E_L_E_T_E_D ? `[ELIMINADO] ${itemsText}` : itemsText,
                amount: Number(pedido.total) || 0,
                status: pedido.D_E_L_E_T_E_D ? 'ELIMINADO' : (pedido.estado?.nombre || 'Completado'),
                justificativo: pedido.justificativo_eliminacion,
                date: pedido.created_at
            };
        });
    }
}

