import React, { useState, useEffect, useMemo } from 'react';
import { getAllProductos } from '../../../../services/ProductoService';
import { getAllCategorias } from '../../../../services/CategoriaService';
import { createPedido, cobrarPedido, generateWhatsAppPdf } from '../../../../services/PedidoService';
import './PuntoDeVenta.css';

const PuntoDeVenta = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros del catálogo
  const [selectedCategoria, setSelectedCategoria] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Ticket actual
  const [nombreCliente, setNombreCliente] = useState('Cliente Mostrador');
  const [ticketItems, setTicketItems] = useState([]);

  // Modales de cobro y confirmación
  const [modalCobro, setModalCobro] = useState(null); // 'EFECTIVO' | 'QR' | null
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(null); // guarda el resultado para mostrar éxito

  useEffect(() => {
    fetchCatalogo();
  }, []);

  const fetchCatalogo = async () => {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([
        getAllProductos(),
        getAllCategorias(),
      ]);
      setProductos(prodsData || []);
      setCategorias(catsData || []);
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de productos en memoria
  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      // Verificar si coincide con categoría
      const matchCat =
        selectedCategoria === 'ALL' ||
        (prod.categoria && prod.categoria.id === selectedCategoria);

      // Verificar si coincide con búsqueda
      const matchSearch =
        !searchTerm.trim() ||
        prod.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim());

      return matchCat && matchSearch;
    });
  }, [productos, selectedCategoria, searchTerm]);

  // Cálculo del total
  const totalTicket = useMemo(() => {
    return ticketItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [ticketItems]);

  // Manejo de items en el ticket
  const agregarAlTicket = (producto) => {
    setTicketItems((prev) => {
      const existe = prev.find((item) => item.id_producto === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id_producto === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id_producto: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio) || 0,
            cantidad: 1,
            observacion: '',
          },
        ];
      }
    });
  };

  const modificarCantidad = (idProducto, delta) => {
    setTicketItems((prev) => {
      return prev
        .map((item) => {
          if (item.id_producto === idProducto) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const eliminarDelTicket = (idProducto) => {
    setTicketItems((prev) => prev.filter((item) => item.id_producto !== idProducto));
  };

  const limpiarTicket = () => {
    setTicketItems([]);
    setNombreCliente('Cliente Mostrador');
    setEfectivoRecibido('');
  };

  // Cambio / Vuelto
  const montoRecibidoNum = parseFloat(efectivoRecibido) || 0;
  const cambioEfectivo = Math.max(0, montoRecibidoNum - totalTicket);

  // Confirmar cobro e ingresar orden al backend
  const handleCobrar = async (tipoPago) => {
    if (ticketItems.length === 0) return;

    if (tipoPago === 'Efectivo' && montoRecibidoNum < totalTicket) {
      alert('El monto en efectivo recibido es menor al total del pedido.');
      return;
    }

    try {
      setProcesando(true);

      const detallesPayload = ticketItems.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
        observaciones: item.observacion || '',
      }));

      const payload = {
        nombre_cliente: nombreCliente || 'Cliente Mostrador',
        detalles: detallesPayload,
        cobrar_inmediato: tipoPago !== 'Pendiente',
        tipo_pago: tipoPago === 'Pendiente' ? undefined : tipoPago,
        monto_pagado: tipoPago === 'Efectivo' ? montoRecibidoNum : totalTicket,
      };

      const res = await createPedido(payload);
      setPedidoExitoso({
        id: res.id,
        nombre_cliente: res.nombre_cliente,
        total: totalTicket,
        tipo_pago: tipoPago,
        cambio: tipoPago === 'Efectivo' ? cambioEfectivo : 0,
      });

      setModalCobro(null);
      limpiarTicket();
    } catch (err) {
      console.error('Error al procesar el cobro:', err);
      alert('Hubo un error al registrar el pedido/cobro.');
    } finally {
      setProcesando(false);
    }
  };

  const handlePdfWhatsApp = async (pedidoId) => {
    try {
      const url = await generateWhatsAppPdf(pedidoId);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error al generar PDF de WhatsApp:', err);
      alert('No se pudo generar el enlace de WhatsApp/PDF.');
    }
  };

  return (
    <div className="pos-container">
      {/* PANEL IZQUIERDO: CATÁLOGO */}
      <div className="pos-catalog">
        {/* BARRA SUPERIOR COMPACTA DE BÚSQUEDA */}
        <div className="pos-top-toolbar">
          <div className="pos-search" style={{ width: '100%' }}>
            <input
              type="text"
              placeholder="🔍 Buscar producto por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* CATEGORÍAS */}
        <div className="pos-categories">
          <button
            className={`pos-cat-btn ${selectedCategoria === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedCategoria('ALL')}
          >
            Todos los Productos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`pos-cat-btn ${selectedCategoria === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategoria(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* GRILLA DE PRODUCTOS */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            Cargando menú ágil...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#f87171' }}>
            {error}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No se encontraron productos para esta búsqueda.
          </div>
        ) : (
          <div className="pos-grid">
            {productosFiltrados.map((prod) => {
              const itemTicket = ticketItems.find((i) => i.id_producto === prod.id);
              return (
                <div
                  key={prod.id}
                  className="pos-card"
                  onClick={() => agregarAlTicket(prod)}
                >
                  <img
                    src={prod.imagen || '/placeholder.png'}
                    alt={prod.nombre}
                    className="pos-card-img"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x150/f8fafc/0f172a?text=Monarca+Coffee';
                    }}
                  />
                  {itemTicket && (
                    <div className="pos-card-badge">{itemTicket.cantidad}</div>
                  )}
                  <div className="pos-card-body">
                    <div className="pos-card-name">{prod.nombre}</div>
                    <div className="pos-card-price">Bs. {parseFloat(prod.precio).toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PANEL DERECHO: TICKET EN MOSTRADOR */}
      <div className="pos-ticket">
        <div className="pos-ticket-header">
          <h2 className="pos-ticket-title">Pedido Actual</h2>
          {ticketItems.length > 0 && (
            <button className="pos-ticket-clear" onClick={limpiarTicket}>
              Limpiar todo
            </button>
          )}
        </div>

        <div className="pos-client-input">
          <input
            type="text"
            placeholder="Nombre del Cliente (Opcional)"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
          />
        </div>

        <div className="pos-items-list">
          {ticketItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '3rem' }}>
              Selecciona productos del catálogo para armar el pedido rápidamente.
            </div>
          ) : (
            ticketItems.map((item) => (
              <div key={item.id_producto} className="pos-item">
                <div className="pos-item-info">
                  <div className="pos-item-name">{item.nombre}</div>
                  <div className="pos-item-unit">Bs. {item.precio.toFixed(2)} c/u</div>
                </div>
                <div className="pos-item-actions">
                  <button
                    className="pos-qty-btn"
                    onClick={() => modificarCantidad(item.id_producto, -1)}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: '700', minWidth: '22px', textAlign: 'center' }}>
                    {item.cantidad}
                  </span>
                  <button
                    className="pos-qty-btn"
                    onClick={() => modificarCantidad(item.id_producto, 1)}
                  >
                    +
                  </button>
                </div>
                <div className="pos-item-total">
                  Bs. {(item.precio * item.cantidad).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* PIE DEL TICKET CON COBRO 1 CLIC */}
        <div className="pos-ticket-footer">
          <div className="pos-summary-row">
            <span>Artículos:</span>
            <span>{ticketItems.reduce((s, i) => s + i.cantidad, 0)}</span>
          </div>
          <div className="pos-summary-total">
            <span>TOTAL A PAGAR:</span>
            <span>Bs. {totalTicket.toFixed(2)}</span>
          </div>

          <div className="pos-pay-grid">
            <button
              className="pos-btn-pay pos-btn-cash"
              disabled={ticketItems.length === 0}
              onClick={() => {
                setEfectivoRecibido(totalTicket.toString());
                setModalCobro('EFECTIVO');
              }}
            >
              💵 Cobrar Efectivo
            </button>
            <button
              className="pos-btn-pay pos-btn-qr"
              disabled={ticketItems.length === 0}
              onClick={() => setModalCobro('QR')}
            >
              📱 Cobrar QR
            </button>
          </div>

          <button
            className="pos-btn-pending"
            disabled={ticketItems.length === 0}
            onClick={() => handleCobrar('Pendiente')}
          >
            ⏱️ Guardar Pedido Pendiente
          </button>
        </div>
      </div>

      {/* MODAL COBRO EFECTIVO */}
      {modalCobro === 'EFECTIVO' && (
        <div className="pos-modal-overlay">
          <div className="pos-modal">
            <div className="pos-modal-title">💵 Cobro en Efectivo</div>
            <div style={{ color: '#cbd5e1', marginBottom: '0.75rem' }}>
              Total del pedido: <strong style={{ color: '#fff' }}>Bs. {totalTicket.toFixed(2)}</strong>
            </div>

            <label style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Monto recibido (Bs.):
            </label>
            <input
              type="number"
              className="pos-cash-input"
              value={efectivoRecibido}
              onChange={(e) => setEfectivoRecibido(e.target.value)}
              autoFocus
            />

            <div className="pos-quick-cash">
              <button
                className="pos-quick-btn"
                onClick={() => setEfectivoRecibido(totalTicket.toString())}
              >
                Exacto
              </button>
              <button className="pos-quick-btn" onClick={() => setEfectivoRecibido('20')}>
                Bs. 20
              </button>
              <button className="pos-quick-btn" onClick={() => setEfectivoRecibido('50')}>
                Bs. 50
              </button>
              <button className="pos-quick-btn" onClick={() => setEfectivoRecibido('100')}>
                Bs. 100
              </button>
            </div>

            <div className="pos-change-box">
              <div className="pos-change-label">Cambio / Vuelto a entregar:</div>
              <div className="pos-change-val">Bs. {cambioEfectivo.toFixed(2)}</div>
            </div>

            <div className="pos-modal-actions">
              <button
                className="pos-btn-pending"
                style={{ flex: 1 }}
                onClick={() => setModalCobro(null)}
              >
                Cancelar
              </button>
              <button
                className="pos-btn-pay pos-btn-cash"
                style={{ flex: 1 }}
                disabled={procesando || montoRecibidoNum < totalTicket}
                onClick={() => handleCobrar('Efectivo')}
              >
                {procesando ? 'Procesando...' : 'Confirmar Cobro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COBRO QR */}
      {modalCobro === 'QR' && (
        <div className="pos-modal-overlay">
          <div className="pos-modal" style={{ textAlign: 'center' }}>
            <div className="pos-modal-title" style={{ justifyContent: 'center' }}>
              📱 Cobro QR Monarca
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Muestra el código o verifica la transferencia por:
            </p>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#fbbf24', margin: '1rem 0' }}>
              Bs. {totalTicket.toFixed(2)}
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              ¿El cliente completó exitosamente la transferencia QR?
            </p>

            <div className="pos-modal-actions">
              <button
                className="pos-btn-pending"
                style={{ flex: 1 }}
                onClick={() => setModalCobro(null)}
              >
                Volver
              </button>
              <button
                className="pos-btn-pay pos-btn-qr"
                style={{ flex: 1 }}
                disabled={procesando}
                onClick={() => handleCobrar('QR')}
              >
                {procesando ? 'Confirmando...' : 'Sí, Pago Confirmado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÉXITO Y RECIBO WHATSAPP */}
      {pedidoExitoso && (
        <div className="pos-modal-overlay">
          <div className="pos-modal" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✅</div>
            <div className="pos-modal-title" style={{ justifyContent: 'center' }}>
              ¡Cobro Registrado!
            </div>
            <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
              Pedido #{pedidoExitoso.id} - <strong>{pedidoExitoso.nombre_cliente}</strong>
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Total Cobrado:</span>
                <span style={{ fontWeight: '700', color: '#fff' }}>Bs. {pedidoExitoso.total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: '#94a3b8' }}>Método:</span>
                <span style={{ fontWeight: '700', color: '#fbbf24' }}>{pedidoExitoso.tipo_pago}</span>
              </div>
              {pedidoExitoso.tipo_pago === 'Efectivo' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Cambio entregado:</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>Bs. {pedidoExitoso.cambio.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                className="pos-btn-pay"
                style={{ background: '#25D366', color: '#fff', width: '100%' }}
                onClick={() => handlePdfWhatsApp(pedidoExitoso.id)}
              >
                📲 Enviar Recibo por WhatsApp
              </button>
              <button
                className="pos-btn-pending"
                style={{ width: '100%' }}
                onClick={() => setPedidoExitoso(null)}
              >
                Siguiente Pedido (Limpiar)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuntoDeVenta;
