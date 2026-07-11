import { Controller, Get, Query, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReporteService } from './reporte.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reporte')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReporteController {
    constructor(private readonly reporteService: ReporteService) { }

    @Get('ventas-generales')
    @Roles('ADMINISTRADOR')
    async getVentasGenerales(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getVentasGenerales(startDate, endDate);
    }

    @Get('ventas-producto')
    @Roles('ADMINISTRADOR')
    async getVentasProducto(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getVentasProducto(startDate, endDate);
    }

    @Get('rendimiento-personal')
    @Roles('ADMINISTRADOR')
    async getRendimientoPersonal(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getRendimientoPersonal(startDate, endDate);
    }

    @Get('dashboard-kpis')
    @Roles('ADMINISTRADOR')
    async getDashboardKpis(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getDashboardKpis(startDate, endDate);
    }

    @Get('pedidos-eliminados')
    @Roles('ADMINISTRADOR')
    async getPedidosEliminados(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getPedidosEliminados(startDate, endDate);
    }

    @Get('actividad-reciente')
    @Roles('ADMINISTRADOR')
    async getActividadReciente() {
        return await this.reporteService.getActividadReciente();
    }

    @Get('rendimiento-personal/:usuarioId/pedidos')
    @Roles('ADMINISTRADOR')
    async getPedidosMeseroRendimiento(
        @Param('usuarioId', ParseIntPipe) usuarioId: number,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return await this.reporteService.getPedidosMeseroRendimiento(usuarioId, startDate, endDate);
    }
}
