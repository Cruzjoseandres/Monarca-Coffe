import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from '../detalle-pedido/entities/detalle-pedido.entity';
import { Producto } from '../producto/entities/producto.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Estado } from '../estado/entities/estado.entity';
const PdfPrinter = require('pdfmake/js/Printer').default;
const virtualfs = require('pdfmake/js/virtual-fs').default;
const URLResolver = require('pdfmake/js/URLResolver').default;

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detallePedidoRepository: Repository<DetallePedido>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Estado)
    private readonly estadoRepository: Repository<Estado>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  private async getEstadoPorNombre(nombrePrincipal: string, nombreAlternativo?: string): Promise<Estado | undefined> {
    let estado = await this.estadoRepository.findOne({
      where: { nombre: nombrePrincipal, D_E_L_E_T_E_D: false },
    });
    if (!estado && nombreAlternativo) {
      estado = await this.estadoRepository.findOne({
        where: { nombre: nombreAlternativo, D_E_L_E_T_E_D: false },
      });
    }
    if (!estado) {
      const estados = await this.estadoRepository.find({
        where: { D_E_L_E_T_E_D: false },
        take: 1,
      });
      estado = estados[0];
    }
    return estado;
  }

  async create(createPedidoDto: CreatePedidoDto) {
    try {
      let totalPedido = 0;
      const detallesEntidades: DetallePedido[] = [];
      const estadoDetalle = await this.getEstadoPorNombre('ACTIVO', 'PENDIENTE');

      // Calcular ítems y subtotal si se enviaron detalles
      if (createPedidoDto.detalles && createPedidoDto.detalles.length > 0) {
        for (const det of createPedidoDto.detalles) {
          const producto = await this.productoRepository.findOne({
            where: { id: det.id_producto, D_E_L_E_T_E_D: false },
          });
          if (producto) {
            const precio = Number(det.precio_unitario ?? producto.precio) || 0;
            const subtotal = precio * det.cantidad;
            totalPedido += subtotal;

            const detalle = this.detallePedidoRepository.create({
              producto: { id: producto.id },
              cantidad: det.cantidad,
              subtotal: subtotal,
              comentario: det.comentario || det.observaciones || '',
              estado: estadoDetalle ? ({ id: estadoDetalle.id } as any) : undefined,
            });
            detallesEntidades.push(detalle);
          }
        }
      }

      const cobro = createPedidoDto.cobro || {
        tipo_pago: createPedidoDto.tipo_pago,
        monto_pagado: createPedidoDto.monto_pagado,
        monto_efectivo: createPedidoDto.monto_efectivo,
        monto_qr: createPedidoDto.monto_qr,
        comprobante_qr: createPedidoDto.comprobante_qr,
      };

      const tipoPago = cobro.tipo_pago || createPedidoDto.tipo_pago || 'Pendiente';
      const isPagado =
        createPedidoDto.cobrar_inmediato === true ||
        (tipoPago && tipoPago !== 'Pendiente');

      const estadoPedido = isPagado
        ? await this.getEstadoPorNombre('PAGADO', 'COMPLETADO')
        : await this.getEstadoPorNombre('PENDIENTE', 'ACTIVO');

      const montoPagado = Number(
        cobro.monto_pagado ?? createPedidoDto.monto_pagado ?? (isPagado ? totalPedido : 0),
      );
      const montoEfectivo = Number(
        cobro.monto_efectivo ?? createPedidoDto.monto_efectivo ?? (tipoPago === 'Efectivo' ? montoPagado : 0),
      );
      const montoQr = Number(
        cobro.monto_qr ?? createPedidoDto.monto_qr ?? (tipoPago === 'QR' ? montoPagado : 0),
      );
      const montoCambio = Math.max(0, montoPagado - totalPedido);

      const pedidoData: Pedido = this.pedidoRepository.create({
        nombre_cliente: createPedidoDto.nombre_cliente || 'Cliente',
        usuario: createPedidoDto.id_usuario ? ({ id: createPedidoDto.id_usuario } as any) : undefined,
        estado: estadoPedido ? ({ id: estadoPedido.id } as any) : undefined,
        fecha_apertura: new Date(),
        fecha_cierre: isPagado ? new Date() : undefined,
        total: totalPedido,
        tipo_pago: tipoPago,
        monto_pagado: montoPagado,
        monto_cambio: montoCambio,
        monto_efectivo: montoEfectivo,
        monto_qr: montoQr,
        comprobante_qr: cobro.comprobante_qr || createPedidoDto.comprobante_qr || undefined,
        detalles: detallesEntidades,
      } as any) as unknown as Pedido;

      const pedidoGuardado = await this.pedidoRepository.save(pedidoData);

      return await this.findOne(pedidoGuardado.id);
    } catch (error) {
      console.error('❌ Error al crear pedido en PedidoService.create:', error);
      throw new InternalServerErrorException(
        error?.detail || error?.message || 'Error al crear pedido en la base de datos',
      );
    }
  }

  async cobrarPedido(id: number, cobro: any) {
    const pedido = await this.findOne(id);
    const total = Number(pedido.total) || 0;
    const montoPagado = Number(cobro?.monto_pagado) || total;

    pedido.tipo_pago = cobro?.tipo_pago || 'Efectivo';
    pedido.monto_pagado = montoPagado;
    pedido.monto_cambio = Math.max(0, montoPagado - total);
    pedido.monto_efectivo = cobro?.monto_efectivo || (pedido.tipo_pago === 'Efectivo' ? montoPagado : 0);
    pedido.monto_qr = cobro?.monto_qr || (pedido.tipo_pago === 'QR' ? total : 0);
    pedido.comprobante_qr = cobro?.comprobante_qr || null;
    const estadoPagado = await this.getEstadoPorNombre('PAGADO', 'COMPLETADO');
    if (estadoPagado) {
      pedido.estado = { id: estadoPagado.id } as any;
    }
    pedido.fecha_cierre = new Date();

    await this.pedidoRepository.save(pedido);
    return await this.findOne(id);
  }

  async findAll() {
    return await this.pedidoRepository.find({
      relations: ['usuario', 'usuario.persona', 'estado', 'detalles', 'detalles.producto'],
      where: { D_E_L_E_T_E_D: false },
      order: { created_at: 'DESC' }
    });
  }

  async findMisPedidos(userId: number) {
    return await this.pedidoRepository.find({
      relations: ['estado', 'detalles', 'detalles.producto'],
      where: { D_E_L_E_T_E_D: false, usuario: { id: userId } },
      order: { created_at: 'DESC' }
    });
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id, D_E_L_E_T_E_D: false },
      relations: ['usuario', 'usuario.persona', 'estado', 'detalles', 'detalles.producto']
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    return pedido;
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id);
    if (updatePedidoDto.id_estado) {
      pedido.estado = { id: updatePedidoDto.id_estado } as any;
    }
    if (updatePedidoDto.nombre_cliente !== undefined) {
      pedido.nombre_cliente = updatePedidoDto.nombre_cliente;
    }
    if (updatePedidoDto.tipo_pago !== undefined) {
      pedido.tipo_pago = updatePedidoDto.tipo_pago;
    }
    if (updatePedidoDto.monto_pagado !== undefined) {
      pedido.monto_pagado = updatePedidoDto.monto_pagado;
    }
    if (updatePedidoDto.monto_cambio !== undefined) {
      pedido.monto_cambio = updatePedidoDto.monto_cambio;
    }
    return await this.pedidoRepository.save(pedido);
  }

  async remove(id: number, justificativo: string) {
    const pedido = await this.findOne(id);
    pedido.D_E_L_E_T_E_D = true;
    pedido.justificativo_eliminacion = justificativo;
    return await this.pedidoRepository.save(pedido);
  }

  async generateWhatsAppPdf(id: number, apiUrl: string) {
    const pedido = await this.findOne(id);
    const totalPedido = Number(pedido.total) || 0;

    const itemsTableBody: any[] = [
      [
        { text: 'Cant.', style: 'tableHeader' },
        { text: 'Producto', style: 'tableHeader' },
        { text: 'Subtotal', style: 'tableHeader' }
      ]
    ];

    if (pedido.detalles && pedido.detalles.length > 0) {
      for (const det of pedido.detalles) {
        itemsTableBody.push([
          { text: det.cantidad.toString(), style: 'tableCell' },
          { text: det.producto?.nombre || 'Producto', style: 'tableCell' },
          { text: `Bs. ${Number(det.subtotal).toFixed(2)}`, style: 'tableCell' }
        ]);
      }
    }

    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };

    const urlResolver = new URLResolver(virtualfs);
    const printer = new PdfPrinter(fonts, virtualfs, urlResolver);

    const docDefinition = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'Tiendita de Café - Recibo de Compra', style: 'header' },
        { text: `Pedido #${pedido.id}`, style: 'subheader' },
        { text: `Cliente: ${pedido.nombre_cliente || 'General'}`, margin: [0, 5, 0, 5] },
        { text: `Fecha: ${new Date(pedido.fecha_apertura || Date.now()).toLocaleString()}`, margin: [0, 0, 0, 10] },
        { text: `Forma de Pago: ${pedido.tipo_pago || 'Efectivo'}`, margin: [0, 0, 0, 10] },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto'],
            body: itemsTableBody
          },
          layout: 'lightHorizontalLines'
        },
        { text: `Total Pagado: Bs. ${totalPedido.toFixed(2)}`, style: 'totalInfo' },
        ...(pedido.monto_cambio && Number(pedido.monto_cambio) > 0 ? [
          { text: `Cambio entregado: Bs. ${Number(pedido.monto_cambio).toFixed(2)}`, style: 'cambioInfo' }
        ] : [])
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        subheader: { fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 13, color: 'black' },
        tableCell: { margin: [0, 5, 0, 5] },
        totalInfo: { fontSize: 16, bold: true, alignment: 'right', margin: [0, 15, 0, 5] },
        cambioInfo: { fontSize: 13, alignment: 'right', color: '#555555' }
      }
    };

    const pdfDoc = await printer.createPdfKitDocument(docDefinition as any);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve());
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
    const pdfBuffer = Buffer.concat(chunks);

    const publicId = `pedido_${pedido.id}_${Date.now()}`;
    const pdfUrl = await this.cloudinaryService.uploadPdf(pdfBuffer, publicId);

    return pdfUrl;
  }
}