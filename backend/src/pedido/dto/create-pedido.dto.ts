export class CreatePedidoDto {
    id_usuario?: number;
    nombre_cliente?: string;
    detalles?: Array<{
        id_producto: number;
        cantidad: number;
        comentario?: string;
    }>;
    cobro?: {
        tipo_pago: string; // 'Efectivo' | 'QR' | 'Mixto' | 'Pendiente'
        monto_pagado?: number;
        monto_efectivo?: number;
        monto_qr?: number;
        comprobante_qr?: string;
    };
}

