export class CreatePedidoDto {
    id_usuario?: number;
    nombre_cliente?: string;
    cobrar_inmediato?: boolean;
    tipo_pago?: string;
    monto_pagado?: number;
    monto_efectivo?: number;
    monto_qr?: number;
    comprobante_qr?: string;
    detalles?: Array<{
        id_producto: number;
        cantidad: number;
        precio_unitario?: number;
        comentario?: string;
        observaciones?: string;
    }>;
    cobro?: {
        tipo_pago: string; // 'Efectivo' | 'QR' | 'Mixto' | 'Pendiente'
        monto_pagado?: number;
        monto_efectivo?: number;
        monto_qr?: number;
        comprobante_qr?: string;
    };
}


