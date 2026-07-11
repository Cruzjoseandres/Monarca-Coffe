import React, { useState, useEffect, useMemo } from 'react';
import { getAllProductos } from '../../../../services/ProductoService';
import { getAllCategorias } from '../../../../services/CategoriaService';
import { createPedido, generateWhatsAppPdf } from '../../../../services/PedidoService';
import './PuntoDeVenta.css';

const PuntoDeVenta = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategoria, setSelectedCategoria] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [ticketItems, setTicketItems] = useState([]);
  const [ticketOpen, setTicketOpen] = useState(false);

  const [modalCobro, setModalCobro] = useState(null);
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(null);

  useEffect(() => { fetchCatalogo(); }, []);

  const fetchCatalogo = async () => {
    try {
      setLoading(true);
      const [prodsData, catsData] = await Promise.all([getAllProductos(), getAllCategorias()]);
      setProductos(prodsData || []);
      setCategorias(catsData || []);
    } catch (err) {
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((prod) => {
      const matchCat = selectedCategoria === 'ALL' || (prod.categoria && prod.categoria.id === selectedCategoria);
      const matchSearch = !searchTerm.trim() || prod.nombre.toLowerCase().includes(searchTerm.toLowerCase().trim());
      return matchCat && matchSearch;
    });
  }, [productos, selectedCategoria, searchTerm]);

  const totalTicket = useMemo(() => ticketItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0), [ticketItems]);

  const agregarAlTicket = (producto) => {
    setTicketItems((prev) => {
      const existe = prev.find((item) => item.id_producto === producto.id);
      if (existe) {
        return prev.map((item) => item.id_producto === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { id_producto: producto.id, nombre: producto.nombre, precio: parseFloat(producto.precio) || 0, cantidad: 1, observacion: '' }];
    });
  };

  const modificarCantidad = (idProducto, delta) => {
    setTicketItems((prev) =>
      prev.map((item) => {
        if (item.id_producto === idProducto) {
          const nuevaCant = item.cantidad + delta;
          return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
        }
        return item;
      }).filter(Boolean)
    );
  };

  const limpiarTicket = () => {
    setTicketItems([]);
    setEfectivoRecibido('');
    setTicketOpen(false);
  };

  const montoRecibidoNum = parseFloat(efectivoRecibido) || 0;
  const cambioEfectivo = Math.max(0, montoRecibidoNum - totalTicket);

  const handleCobrar = async (tipoPago) => {
    if (ticketItems.length === 0) return;
    if (tipoPago === 'Efectivo' && montoRecibidoNum < totalTicket) {
      alert('El monto recibido es menor al total del pedido.');
      return;
    }
    try {
      setProcesando(true);
      const payload = {
        nombre_cliente: 'Cliente Mostrador',
        detalles: ticketItems.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          observaciones: item.observacion || '',
        })),
        cobrar_inmediato: tipoPago !== 'Pendiente',
        tipo_pago: tipoPago === 'Pendiente' ? undefined : tipoPago,
        monto_pagado: tipoPago === 'Efectivo' ? montoRecibidoNum : totalTicket,
      };
      const res = await createPedido(payload);
      setPedidoExitoso({ id: res.id, nombre_cliente: res.nombre_cliente, total: totalTicket, tipo_pago: tipoPago, cambio: tipoPago === 'Efectivo' ? cambioEfectivo : 0 });
      setModalCobro(null);
      limpiarTicket();
    } catch (err) {
      alert('Hubo un error al registrar el pedido/cobro.');
    } finally {
      setProcesando(false);
    }
  };

  const handlePdfWhatsApp = async (pedidoId) => {
    try {
      const url = await generateWhatsAppPdf(pedidoId);
      if (url) window.open(url, '_blank');
    } catch {
      alert('No se pudo generar el enlace de WhatsApp/PDF.');
    }
  };

  const totalArt = ticketItems.reduce((s, i) => s + i.cantidad, 0);

  return (
    <div className="pos-wrapper">

      {/* ══ CATÁLOGO ══ */}
      <div className="pos-catalog">

        {/* Buscador */}
        <div className="pos-search-bar">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chips de categoría */}
        <div className="pos-cats">
          <button
            className={`pos-cat${selectedCategoria === 'ALL' ? ' active' : ''}`}
            onClick={() => setSelectedCategoria('ALL')}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`pos-cat${selectedCategoria === cat.id ? ' active' : ''}`}
              onClick={() => setSelectedCategoria(cat.id)}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* Grilla de productos — solo esta parte hace scroll */}
        <div className="pos-grid-wrapper">
          {loading ? (
            <div className="pos-msg">Cargando productos...</div>
          ) : error ? (
            <div className="pos-msg err">{error}</div>
          ) : productosFiltrados.length === 0 ? (
            <div className="pos-msg">No hay productos aquí.</div>
          ) : (
            <div className="pos-grid">
              {productosFiltrados.map((prod) => {
                const inTicket = ticketItems.find((i) => i.id_producto === prod.id);
                return (
                  <button
                    key={prod.id}
                    className={`pos-card${inTicket ? ' sel' : ''}`}
                    onClick={() => agregarAlTicket(prod)}
                  >
                    {inTicket && <span className="pos-badge">{inTicket.cantidad}</span>}
                    <span className="pos-card-name">{prod.nombre}</span>
                    <span className="pos-card-price">Bs. {parseFloat(prod.precio).toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* ══ TICKET / BOTTOM PANEL ══ */}
      <aside className={`pos-ticket${ticketOpen ? ' open' : ''}`}>

        {/* Pill handle (solo móvil) */}
        <button className="pos-handle" onClick={() => setTicketOpen((v) => !v)} aria-label="Ver ticket">
          <span className="pos-handle-pill" />
          <div className="pos-handle-row">
            <span className="pos-handle-items">{totalArt} {totalArt === 1 ? 'artículo' : 'artículos'}</span>
            <span className="pos-handle-total">Bs. {totalTicket.toFixed(2)}</span>
            <span className="pos-handle-chevron">{ticketOpen ? '▾' : '▴'}</span>
          </div>
        </button>

        {/* Lista de items (colapsable en móvil) */}
        <div className="pos-items">
          {ticketItems.length === 0 ? (
            <p className="pos-empty">Toca un producto para agregarlo.</p>
          ) : (
            ticketItems.map((item) => (
              <div key={item.id_producto} className="pos-item">
                <div className="pos-item-info">
                  <span className="pos-item-name">{item.nombre}</span>
                  <span className="pos-item-unit">Bs. {item.precio.toFixed(2)} c/u</span>
                </div>
                <div className="pos-item-ctrl">
                  <button className="pos-qty" onClick={() => modificarCantidad(item.id_producto, -1)}>−</button>
                  <span className="pos-qty-n">{item.cantidad}</span>
                  <button className="pos-qty" onClick={() => modificarCantidad(item.id_producto, 1)}>+</button>
                </div>
                <span className="pos-item-sub">Bs. {(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer siempre visible */}
        <div className="pos-footer">
          <div className="pos-total">
            <span>TOTAL</span>
            <strong>Bs. {totalTicket.toFixed(2)}</strong>
          </div>
          <div className="pos-pay-row">
            <button
              className="pos-pay cash"
              disabled={ticketItems.length === 0}
              onClick={() => { setEfectivoRecibido(totalTicket.toString()); setModalCobro('EFECTIVO'); }}
            >
              💵 Efectivo
            </button>
            <button
              className="pos-pay qr"
              disabled={ticketItems.length === 0}
              onClick={() => setModalCobro('QR')}
            >
              📱 QR
            </button>
          </div>
          <button className="pos-pending" disabled={ticketItems.length === 0} onClick={() => handleCobrar('Pendiente')}>
            Guardar Pendiente
          </button>
          {ticketItems.length > 0 && (
            <button className="pos-clear" onClick={limpiarTicket}>Limpiar todo</button>
          )}
        </div>
      </aside>

      {/* ══ MODAL EFECTIVO ══ */}
      {modalCobro === 'EFECTIVO' && (
        <div className="pos-overlay">
          <div className="pos-modal">
            <h3 className="pos-mh">💵 Cobro en Efectivo</h3>
            <p className="pos-ms">Total: <strong>Bs. {totalTicket.toFixed(2)}</strong></p>
            <label className="pos-ml">Monto recibido (Bs.)</label>
            <input type="number" className="pos-mi" value={efectivoRecibido} onChange={(e) => setEfectivoRecibido(e.target.value)} autoFocus />
            <div className="pos-qrow">
              <button className="pos-qbtn" onClick={() => setEfectivoRecibido(totalTicket.toString())}>Exacto</button>
              <button className="pos-qbtn" onClick={() => setEfectivoRecibido('20')}>Bs. 20</button>
              <button className="pos-qbtn" onClick={() => setEfectivoRecibido('50')}>Bs. 50</button>
              <button className="pos-qbtn" onClick={() => setEfectivoRecibido('100')}>Bs. 100</button>
            </div>
            <div className="pos-change">
              <span>Vuelto</span>
              <strong className="green">Bs. {cambioEfectivo.toFixed(2)}</strong>
            </div>
            <div className="pos-mrow">
              <button className="pos-mcancel" onClick={() => setModalCobro(null)}>Cancelar</button>
              <button className="pos-mconfirm cash" disabled={procesando || montoRecibidoNum < totalTicket} onClick={() => handleCobrar('Efectivo')}>
                {procesando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL QR ══ */}
      {modalCobro === 'QR' && (
        <div className="pos-overlay">
          <div className="pos-modal center">
            <h3 className="pos-mh">📱 Cobro QR</h3>
            <div className="pos-big-total">Bs. {totalTicket.toFixed(2)}</div>
            <p className="pos-ms">¿El cliente completó la transferencia?</p>
            <div className="pos-mrow">
              <button className="pos-mcancel" onClick={() => setModalCobro(null)}>Volver</button>
              <button className="pos-mconfirm qr" disabled={procesando} onClick={() => handleCobrar('QR')}>
                {procesando ? 'Confirmando...' : 'Sí, Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ÉXITO ══ */}
      {pedidoExitoso && (
        <div className="pos-overlay">
          <div className="pos-modal center">
            <div className="pos-success">✅</div>
            <h3 className="pos-mh">¡Cobro Registrado!</h3>
            <p className="pos-ms">Pedido #{pedidoExitoso.id}</p>
            <div className="pos-receipt">
              <div className="pos-rrow"><span>Total</span><strong>Bs. {pedidoExitoso.total.toFixed(2)}</strong></div>
              <div className="pos-rrow"><span>Método</span><strong>{pedidoExitoso.tipo_pago}</strong></div>
              {pedidoExitoso.tipo_pago === 'Efectivo' && (
                <div className="pos-rrow"><span>Cambio</span><strong className="green">Bs. {pedidoExitoso.cambio.toFixed(2)}</strong></div>
              )}
            </div>
            <button className="pos-pay cash" style={{ width: '100%', marginBottom: '0.6rem' }} onClick={() => handlePdfWhatsApp(pedidoExitoso.id)}>
              📲 Enviar por WhatsApp
            </button>
            <button className="pos-pending" style={{ width: '100%' }} onClick={() => setPedidoExitoso(null)}>
              Siguiente Pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuntoDeVenta;
