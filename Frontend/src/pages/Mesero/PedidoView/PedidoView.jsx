import { useState, memo } from 'react';
import { Container, Card, Badge, Spinner, Alert, Row, Col, Button, Modal, Form, Table, Accordion, InputGroup } from 'react-bootstrap';
import { usePedidoView } from './usePedidoView';
import NotificationToast from '../../../components/NotificationToast';
import ConfirmModal from '../../../components/ConfirmModal';
import './PedidoView.css';

/**
 * Celda de entrega completamente aislada con estado local propio.
 * React.memo = cero re-renders del padre al tocar +/−/checkbox.
 * onRegister solo escribe en deliveryPendingMap (ref) en usePedidoView.
 */
const DeliveryCell = memo(({ det, onRegister }) => {
    const [entregada, setEntregada] = useState(det.cantidad_entregada ?? 0);
    const total = det.cantidad;

    const updateDelta = (delta) => {
        setEntregada(prev => {
            const next = Math.max(0, Math.min(prev + delta, total));
            if (next !== prev) {
                onRegister(det.id, next);
            }
            return next;
        });
    };

    const updateAbsolute = (val) => {
        setEntregada(prev => {
            const next = Math.max(0, Math.min(val, total));
            if (next !== prev) {
                onRegister(det.id, next);
            }
            return next;
        });
    };

    const allDone = entregada >= total;
    const noneDone = entregada <= 0;

    return (
        <div className="d-flex align-items-center justify-content-center gap-1">
            <button
                type="button"
                className="btn btn-outline-secondary btn-sm px-2 py-1 fw-bold"
                style={{ minWidth: '35px', height: '35px', lineHeight: 1, touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={noneDone}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateDelta(-1); }}
            >−</button>

            <span
                className={`fw-bold fs-5 ${allDone ? 'text-success' : 'text-primary'}`}
                style={{ minWidth: '40px', textAlign: 'center', display: 'inline-block', userSelect: 'none' }}
            >
                {entregada}
            </span>
            <span className="text-muted fs-6">/ {total}</span>

            <button
                type="button"
                className="btn btn-outline-primary btn-sm px-2 py-1 fw-bold"
                style={{ minWidth: '35px', height: '35px', lineHeight: 1, touchAction: 'manipulation', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={allDone}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateDelta(1); }}
            >+</button>

            {/* Checkbox Todo — comparte el mismo estado local */}
            <input
                type="checkbox"
                className="form-check-input ms-2"
                style={{ width: '1.5rem', height: '1.5rem', cursor: 'pointer', flexShrink: 0, touchAction: 'manipulation' }}
                checked={allDone}
                onChange={(e) => updateAbsolute(e.target.checked ? total : 0)}
                title={allDone ? 'Desmarcar entrega completa' : 'Marcar todo como entregado'}
            />
        </div>
    );
});


const PedidoView = () => {
    const {
        pedido, cuentas, detallesPorCuenta, productosFiltrados, categorias, totalPedido,
        viewMode, getClasificacionDetalle,
        loading, error, saving,
        hasUnsavedChanges, handleGuardarCambios, handleCancelarCambios,
        showAddCuentaModal, setShowAddCuentaModal,
        showAddItemModal, setShowAddItemModal,
        nombreCliente, setNombreCliente,
        asignarNombre, setAsignarNombre,
        busquedaProducto, setBusquedaProducto,
        filtroCategoria, setFiltroCategoria,
        productosSeleccionados, toggleProductoChecklist, updateChecklistCount, setChecklistCount, updateChecklistComment,
        handleAddCuenta, handleDeleteCuenta,
        handleOpenAddItem, handleAddMultipleItems,
        handleCambiarCantidadDetalle, handleDeleteDetalle, handleEntregarItem,
        handleTerminarPedido, handleCancelarPedido, confirmCancelarPedido, navigateBack,
        showJustificativoModal, setShowJustificativoModal,
        justificativoText, setJustificativoText,
        toast, confirm, hideToast,
        showPaymentModal, setShowPaymentModal,
        paymentData, setPaymentData,
        handleOpenPaymentModal,
        handleClosePaymentModal,
        handlePaymentDataChange,
        handleProcessPayment,
        showWhatsappModal, setShowWhatsappModal,
        whatsappPhone, setWhatsappPhone,
        handleOpenWhatsappModal,
        handleCloseWhatsappModal,
        handleShareWhatsapp
    } = usePedidoView();

    const isReadOnly = viewMode === 'view';
    const isDeliver = viewMode === 'deliver';
    const isEdit = viewMode === 'edit';
    const isPedidoCompletado = pedido?.estado?.id === 3 || pedido?.estado?.nombre === 'INACTIVO' || pedido?.estado?.nombre === 'COMPLETADO' || pedido?.estado?.nombre === 'PAGADO';

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (error || !pedido) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error || 'Pedido no encontrado'}</Alert>
                <Button variant="secondary" onClick={navigateBack}>Volver a Mesas</Button>
            </Container>
        );
    }

    return (
        <Container fluid className="pedido-view-container p-3 p-md-4">
            <NotificationToast show={toast.show} message={toast.message} variant={toast.variant} onClose={hideToast} />
            <ConfirmModal show={confirm.show} message={confirm.message} onConfirm={confirm.onConfirm} confirmText={confirm.confirmText} confirmVariant={confirm.confirmVariant} />

            {/* HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 fade-in gap-3">
                <div className="d-flex align-items-center gap-3">
                    <button type="button" onClick={navigateBack} className="admin-back-btn" title="Volver a mesas">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="mb-0 d-flex align-items-center gap-2">
                            📋 Pedido #{pedido.id}
                            <Badge bg="info" className="ms-2">Mesa {pedido.mesa?.numero}</Badge>
                        </h1>
                        <small className="text-muted-custom mt-1 d-block">
                            👤 {pedido.usuario?.persona?.nombre} {pedido.usuario?.persona?.apellido}
                            {' · '}🕐 {new Date(pedido.fecha_apertura).toLocaleString()}
                            <Badge bg={viewMode === 'deliver' ? 'success' : viewMode === 'view' ? 'secondary' : 'warning'} className="ms-2">
                                Modo: {viewMode.toUpperCase()}
                            </Badge>
                        </small>
                    </div>
                </div>
                
                {(isEdit || isReadOnly) && (
                    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-start justify-content-md-end mt-3 mt-md-0">
                        <Button variant="info" className="d-flex align-items-center justify-content-center gap-1 shadow-sm text-white fw-bold px-3 py-1 rounded" onClick={handleOpenWhatsappModal} disabled={saving} style={{ fontSize: "0.85rem" }}>
                            <span className="material-symbols-outlined fs-6">share</span> Compartir
                        </Button>
                        {isEdit && !isPedidoCompletado && (
                            <>
                                {hasUnsavedChanges ? (
                                    <>
                                        <Button variant="warning" className="d-flex align-items-center justify-content-center gap-1 shadow-sm text-dark fw-bold px-3 py-1 rounded" onClick={handleCancelarCambios} disabled={saving} style={{ fontSize: "0.85rem" }}>
                                            <span className="material-symbols-outlined fs-6">undo</span> Cancelar
                                        </Button>
                                        <Button variant="primary" className="d-flex align-items-center justify-content-center gap-1 shadow-sm fw-bold heartbeat-btn px-3 py-1 rounded" onClick={() => handleGuardarCambios(false)} disabled={saving} style={{ fontSize: "0.85rem" }}>
                                            {saving ? <Spinner size="sm" animation="border" /> : <span className="material-symbols-outlined fs-6">save</span>} 
                                            Guardar
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="success" className="d-flex align-items-center justify-content-center gap-1 shadow-sm fw-bold px-3 py-1 rounded" onClick={handleTerminarPedido} disabled={saving} style={{ fontSize: "0.85rem" }}>
                                            <span className="material-symbols-outlined fs-6">check_circle</span> Terminar
                                        </Button>
                                        <Button variant="danger" className="d-flex align-items-center justify-content-center gap-1 shadow-sm fw-bold px-3 py-1 rounded" onClick={handleCancelarPedido} disabled={saving} style={{ fontSize: "0.85rem" }}>
                                            <span className="material-symbols-outlined fs-6">delete_forever</span> Eliminar
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ENCABEZADO DE ESTADO CANCELADO */}
            {pedido.estado?.nombre === 'ELIMINADO' && (
                <Alert variant="danger" className="mb-4 d-flex flex-column shadow-sm border-danger">
                    <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="material-symbols-outlined fs-3">warning</span>
                        <h4 className="alert-heading m-0 fw-bold">Pedido Anulado</h4>
                    </div>
                    <p className="mb-0">
                        <strong>Motivo registrado:</strong> {pedido.justificativo_eliminacion || 'Sin justificación'}
                    </p>
                </Alert>
            )}

            {/* CUENTAS Y DETALLES - Sin Card anidada para maximizar el ancho disponible */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
                    <h4 className="mb-0 fw-bold fs-5">Cuentas del Pedido</h4>
                    <div className="d-flex gap-2 flex-wrap align-items-center">
                        {isEdit && !isPedidoCompletado && cuentas.filter(c => !c.estado || c.estado.id !== 3).length > 1 && (
                            <Button variant="success" size="sm" className="d-flex align-items-center gap-1 fw-bold shadow-sm rounded px-3 py-1 text-white" onClick={() => handleOpenPaymentModal('ALL')}>
                                <span className="material-symbols-outlined fs-6">payments</span>
                                Cobrar Todo (Bs. {cuentas.filter(c => !c.estado || c.estado.id !== 3).reduce((sum, c) => sum + Number(c.total||0), 0).toFixed(2)})
                            </Button>
                        )}
                        {isEdit && !isPedidoCompletado && (
                            <Button variant="primary" size="sm" onClick={() => setShowAddCuentaModal(true)} className="d-flex align-items-center gap-1 fw-bold rounded px-3 py-1">
                                <span className="material-symbols-outlined fs-6">person_add</span> Nueva Cuenta
                            </Button>
                        )}
                    </div>
                </div>

                {cuentas.length === 0 ? (
                    <div className="py-5 text-center px-3 bg-white rounded border shadow-sm">
                        <span className="material-symbols-outlined text-muted mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>receipt_long</span>
                        <h5 className="text-muted">No hay cuentas activas</h5>
                        <p className="text-muted mb-0">Comienza creando una cuenta para agregar productos al pedido.</p>
                    </div>
                ) : (
                    <Accordion defaultActiveKey={cuentas.map((_, i) => String(i))} alwaysOpen className="custom-accordion">
                        {cuentas.map((cuenta, index) => {
                            const detalles = detallesPorCuenta[cuenta.id] || [];
                            return (
                                <Accordion.Item eventKey={String(index)} key={cuenta.id} className="mb-3 border rounded shadow-sm overflow-hidden">
                                    <Accordion.Header>
                                        <div className="d-flex justify-content-between w-100 me-3 align-items-center pe-2">
                                            <span className="fs-5"><strong>👤 {cuenta.nombre_cliente}</strong></span>
                                            <Badge bg="primary" className="fs-6 py-2 px-3">
                                                Bs. {Number(cuenta.total || 0).toFixed(2)}
                                            </Badge>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="p-1 p-sm-3 bg-white">
                                        {isEdit && (
                                            <div className="d-flex flex-row flex-nowrap justify-content-end gap-2 p-2 mb-2 bg-light rounded border" style={{ overflowX: 'auto' }}>
                                                {cuenta.estado?.id !== 3 ? (
                                                    <>
                                                        <Button variant="outline-danger" size="sm" className="d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded text-nowrap"
                                                            onClick={() => handleDeleteCuenta(cuenta.id)}>
                                                            <span className="material-symbols-outlined fs-6">delete</span> Eliminar
                                                        </Button>
                                                        <Button variant="primary" size="sm" className="d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded fw-bold text-nowrap"
                                                            onClick={() => handleOpenAddItem(cuenta.id)}>
                                                            <span className="material-symbols-outlined fs-6">add_circle</span> Añadir
                                                        </Button>
                                                        <Button variant="success" size="sm" className="d-flex align-items-center justify-content-center gap-1 px-3 py-1 rounded fw-bold text-white text-nowrap"
                                                            onClick={() => handleOpenPaymentModal(cuenta.id)}>
                                                            <span className="material-symbols-outlined fs-6">payments</span> Cobrar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Badge bg="success" className="py-2 px-3 d-flex align-items-center gap-1 justify-content-center">
                                                        <span className="material-symbols-outlined fs-6">check_circle</span> Cuenta Pagada
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                        
                                        {detalles.length === 0 ? (
                                            <div className="text-center py-4 rounded border border-dashed my-2">
                                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '2rem', opacity: 0.5 }}>restaurant_menu</span>
                                                <p className="text-muted mt-2 mb-0">Sin productos en esta cuenta</p>
                                            </div>
                                        ) : (
                                            <div className="d-flex flex-column">
                                                {[
                                                    { titulo: 'Pedido Inicial', items: detalles.filter(d => getClasificacionDetalle(d) === 'Pedido Inicial') },
                                                    { titulo: 'Extras', items: detalles.filter(d => getClasificacionDetalle(d) === 'Extras') }
                                                ].map((grupo, gIdx) => grupo.items.length > 0 && (
                                                    <div key={gIdx} className="mb-2 border rounded overflow-hidden">
                                                        <div className="bg-light border-bottom px-2 py-1 fw-bold text-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.9rem' }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                                                                {grupo.titulo === 'Extras' ? 'extension' : 'receipt'}
                                                            </span>
                                                            {grupo.titulo}
                                                        </div>
                                                        <div className="d-flex flex-column">
                                                            {grupo.items.map((det) => {
                                                                const isCompletado = det.cantidad_entregada === det.cantidad;
                                                                return isDeliver ? (
                                                                    <div
                                                                        key={det.id}
                                                                        className={`d-flex align-items-center justify-content-between py-2 px-2 border-bottom ${isCompletado ? 'bg-light' : 'bg-white'}`}
                                                                        style={{ gap: '8px' }}
                                                                    >
                                                                        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ minWidth: 0 }}>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-link p-0 border-0 text-decoration-none d-flex align-items-center flex-shrink-0"
                                                                                onClick={() => handleEntregarItem(det.id, isCompletado ? 0 : det.cantidad)}
                                                                                title={isCompletado ? 'Marcar como pendiente' : 'Entregar todo'}
                                                                            >
                                                                                <span
                                                                                    className="material-symbols-outlined"
                                                                                    style={{
                                                                                        fontSize: '1.5rem',
                                                                                        color: isCompletado ? '#198754' : '#adb5bd',
                                                                                        fontVariationSettings: isCompletado ? "'FILL' 1" : "'FILL' 0",
                                                                                        cursor: 'pointer'
                                                                                    }}
                                                                                >
                                                                                    {isCompletado ? 'check_circle' : 'radio_button_unchecked'}
                                                                                </span>
                                                                            </button>
                                                                            <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                                                                <span
                                                                                    className={`fw-bold ${isCompletado ? 'text-decoration-line-through text-muted' : 'text-dark'}`}
                                                                                    style={{ fontSize: '0.95rem', wordBreak: 'normal', lineHeight: '1.25' }}
                                                                                >
                                                                                    {det.producto?.nombre}
                                                                                </span>
                                                                                {det.comentario && (
                                                                                    <span className="text-muted small mt-1 d-flex align-items-center gap-1">
                                                                                        <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>notes</span>
                                                                                        {det.comentario}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-flex align-items-center flex-shrink-0">
                                                                            <Button
                                                                                variant="outline-secondary"
                                                                                size="sm"
                                                                                className="btn-qty px-2 rounded-start d-flex align-items-center justify-content-center"
                                                                                style={{ height: '32px', width: '30px' }}
                                                                                disabled={det.cantidad_entregada <= 0}
                                                                                onClick={() => handleEntregarItem(det.id, det.cantidad_entregada - 1)}
                                                                            >
                                                                                -
                                                                            </Button>
                                                                            <div
                                                                                className="px-1 border-top border-bottom fw-bold bg-light d-flex align-items-center justify-content-center"
                                                                                style={{ height: '32px', minWidth: '45px' }}
                                                                            >
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    className={`p-0 text-center fw-bold border-0 bg-transparent ${isCompletado ? 'text-success' : 'text-primary'}`}
                                                                                    style={{ width: '32px', boxShadow: 'none' }}
                                                                                    value={det.cantidad_entregada ?? 0}
                                                                                    onChange={(e) => {
                                                                                        let val = parseInt(e.target.value);
                                                                                        if (isNaN(val) || val < 0) val = 0;
                                                                                        if (val > det.cantidad) val = det.cantidad;
                                                                                        handleEntregarItem(det.id, val);
                                                                                    }}
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') e.target.blur();
                                                                                    }}
                                                                                />
                                                                                <span className="text-muted small">/</span>
                                                                                <span className="text-muted small">{det.cantidad}</span>
                                                                            </div>
                                                                            <Button
                                                                                variant="outline-secondary"
                                                                                size="sm"
                                                                                className="btn-qty px-2 rounded-end d-flex align-items-center justify-content-center"
                                                                                style={{ height: '32px', width: '30px' }}
                                                                                disabled={det.cantidad_entregada >= det.cantidad}
                                                                                onClick={() => handleEntregarItem(det.id, det.cantidad_entregada + 1)}
                                                                            >
                                                                                +
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        key={det.id}
                                                                        className="d-flex align-items-center justify-content-between py-2 px-2 border-bottom bg-white"
                                                                        style={{ gap: '8px' }}
                                                                    >
                                                                        <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
                                                                            <span className="fw-bold text-dark" style={{ fontSize: '0.95rem', wordBreak: 'normal', lineHeight: '1.25' }}>
                                                                                {det.producto?.nombre}
                                                                            </span>
                                                                            {det.comentario && (
                                                                                <span className="text-muted small mt-1 d-flex align-items-center gap-1">
                                                                                    <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>notes</span>
                                                                                    {det.comentario}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                                                                            {(isEdit && cuenta.estado?.id !== 3) ? (
                                                                                <div className="d-flex align-items-center">
                                                                                    <Button variant="outline-secondary" size="sm" className="btn-qty px-2 rounded-start"
                                                                                        style={{ height: '32px', width: '28px' }}
                                                                                        onClick={() => handleCambiarCantidadDetalle(det.id, det.cantidad - 1)}>
                                                                                        -
                                                                                    </Button>
                                                                                    <div className="px-1 border-top border-bottom fw-bold bg-light d-flex align-items-center justify-content-center"
                                                                                        style={{ height: '32px', minWidth: '38px' }}>
                                                                                        <Form.Control
                                                                                            type="number"
                                                                                            className="p-0 text-center fw-bold border-0 bg-transparent"
                                                                                            style={{ width: '34px', boxShadow: 'none' }}
                                                                                            defaultValue={det.cantidad}
                                                                                            key={`edit-${det.id}-${det.cantidad}`}
                                                                                            onBlur={(e) => {
                                                                                                let val = parseInt(e.target.value);
                                                                                                if (isNaN(val) || val < 0) val = 0;
                                                                                                e.target.value = val;
                                                                                                if (val !== det.cantidad) {
                                                                                                    handleCambiarCantidadDetalle(det.id, val);
                                                                                                }
                                                                                            }}
                                                                                            onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter') e.target.blur();
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <Button variant="outline-secondary" size="sm" className="btn-qty px-2 rounded-end"
                                                                                        style={{ height: '32px', width: '28px' }}
                                                                                        onClick={() => handleCambiarCantidadDetalle(det.id, det.cantidad + 1)}>
                                                                                        +
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-center fw-bold bg-light px-2 py-1 rounded border small">
                                                                                    <span className={`${det.cantidad_entregada === det.cantidad ? 'text-success' : 'text-primary'}`}>{det.cantidad_entregada}</span>
                                                                                    <span className="text-muted mx-1">/</span>
                                                                                    <span className="text-muted">{det.cantidad}</span>
                                                                                </div>
                                                                            )}

                                                                            <span className="fw-bold text-success text-end" style={{ minWidth: '70px', fontSize: '0.95rem' }}>
                                                                                Bs. {Number(det.subtotal).toFixed(2)}
                                                                            </span>

                                                                            {isEdit && cuenta.estado?.id !== 3 && (
                                                                                <Button variant="outline-danger" size="sm" className="p-1 d-flex align-items-center justify-content-center border-0"
                                                                                    onClick={() => handleDeleteDetalle(det.id)}>
                                                                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Accordion.Body>
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>
                )}

                {cuentas.length > 0 && (
                    <div className="total-pedido-container mt-4 p-3 p-md-4 rounded text-end shadow-sm d-flex justify-content-between align-items-center bg-white border">
                        <h4 className="mb-0 text-muted">Total del Pedido</h4>
                        <h2 className="mb-0 fw-bold text-primary display-6">Bs. {totalPedido.toFixed(2)}</h2>
                    </div>
                )}
            </div>

            {/* ========== MODAL AGREGAR CUENTA ========== */}
            <Modal show={showAddCuentaModal} onHide={() => { setShowAddCuentaModal(false); setAsignarNombre(false); setNombreCliente(''); }}>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span> Nueva Cuenta
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Toggle: asignar nombre */}
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded mb-3">
                        <Form.Check
                            type="switch"
                            id="asignar-nombre-switch"
                            label={asignarNombre ? 'Con nombre asignado' : 'Sin nombre (automático)'}
                            checked={asignarNombre}
                            onChange={(e) => {
                                setAsignarNombre(e.target.checked);
                                if (!e.target.checked) setNombreCliente('');
                            }}
                        />
                    </div>

                    {asignarNombre && (
                        <Form.Group className="fade-in">
                            <Form.Label>Nombre del cliente</Form.Label>
                            <Form.Control
                                type="text"
                                value={nombreCliente}
                                onChange={(e) => setNombreCliente(e.target.value)}
                                placeholder="Ej: Juan, Mesa completa, etc."
                                className="bg-light"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddCuenta(); }}
                            />
                        </Form.Group>
                    )}

                    {!asignarNombre && (
                        <p className="text-muted small mb-0">
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>info</span>
                            {' '}Se creará automáticamente como <strong>"Cuenta {cuentas.length + 1}"</strong>. Podés asignarle un nombre activando el interruptor de arriba.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 pt-0">
                    <Button variant="secondary" onClick={() => { setShowAddCuentaModal(false); setAsignarNombre(false); setNombreCliente(''); }}>Cancelar</Button>
                    <Button
                        variant="primary"
                        onClick={handleAddCuenta}
                        disabled={asignarNombre && !nombreCliente.trim()}
                        className="px-4"
                    >
                        Crear Cuenta
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* ========== MODAL AGREGAR PRODUCTOS (CHECKLIST) ========== */}
            <Modal show={showAddItemModal} onHide={() => setShowAddItemModal(false)} size="xl" fullscreen="lg-down">
                <Modal.Header closeButton className="border-bottom-0 pb-2 px-3 px-md-4">
                    <Modal.Title className="d-flex align-items-center gap-2 w-100 fs-5 pe-2">
                        <span className="material-symbols-outlined text-dark fs-4">restaurant_menu</span>
                        <span className="fw-bold fs-5">Seleccionar Productos</span>
                        <Badge bg="dark" pill className="ms-auto fs-6 fw-normal px-3 py-1">
                            {Object.keys(productosSeleccionados).length} seleccionados
                        </Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0 bg-light d-flex flex-column" style={{ overflow: 'hidden' }}>
                    {/* Fixed Header Area */}
                    <div className="p-3 bg-white border-bottom flex-shrink-0">
                        <div className="mb-3">
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0"><span className="material-symbols-outlined fs-5 text-muted">search</span></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    className="bg-light border-start-0 shadow-none"
                                    placeholder="Buscar por nombre, descripción o categoría..."
                                    value={busquedaProducto}
                                    onChange={(e) => setBusquedaProducto(e.target.value)}
                                    autoFocus
                                />
                                {busquedaProducto && (
                                    <Button variant="light" className="border" onClick={() => setBusquedaProducto('')}>
                                        <span className="material-symbols-outlined fs-6 d-flex text-muted">close</span>
                                    </Button>
                                )}
                            </InputGroup>
                        </div>
                        <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                            <Button
                                size="sm"
                                variant={!filtroCategoria ? "dark" : "outline-secondary"}
                                className="rounded-pill px-3 py-1 fw-medium"
                                onClick={() => setFiltroCategoria('')}
                            >
                                Todas las categorías
                            </Button>
                            {categorias.map((cat) => (
                                <Button
                                    key={cat.id}
                                    size="sm"
                                    variant={parseInt(filtroCategoria) === cat.id ? "dark" : "outline-secondary"}
                                    className="rounded-pill px-3 py-1 fw-medium"
                                    onClick={() => setFiltroCategoria(parseInt(filtroCategoria) === cat.id ? '' : cat.id.toString())}
                                >
                                    {cat.nombre}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="productos-lista checklist-container p-2 p-md-4 overflow-auto flex-grow-1" style={{ maxHeight: '65vh' }}>
                        {productosFiltrados.length === 0 ? (
                            <div className="text-center py-5">
                                <span className="material-symbols-outlined text-muted" style={{ fontSize: '3rem', opacity: 0.5 }}>search_off</span>
                                <h5 className="text-muted mt-3">No se encontraron productos</h5>
                            </div>
                        ) : (
                            <Row className="g-2 g-md-3">
                                {productosFiltrados.map((p) => {
                                    const seleccionado = productosSeleccionados[p.id];
                                    const isAgotado = !p.disponible;
                                    
                                    return (
                                        <Col xs={12} lg={6} xl={4} key={p.id}>
                                            <div className={`p-3 border rounded d-flex flex-column h-100 transition-all ${seleccionado ? 'border-dark bg-light' : 'bg-white'} ${isAgotado ? 'opacity-50 grayscale' : ''}`}>
                                                
                                                <div className="d-flex align-items-center mb-2 cursor-pointer" 
                                                     onClick={() => !isAgotado && toggleProductoChecklist(p.id)}
                                                >
                                                    <div className="me-3">
                                                        <Form.Check 
                                                            type="checkbox"
                                                            checked={!!seleccionado}
                                                            onChange={() => {}} // handled by parent div
                                                            className="scale-125"
                                                            disabled={isAgotado}
                                                        />
                                                    </div>
                                                    
                                                    {p.imagePaths && p.imagePaths.length > 0 ? (
                                                        <img src={p.imagePaths[0]} alt={p.nombre} className="rounded object-fit-cover me-3 border" style={{ width: '48px', height: '48px', minWidth: '48px' }} />
                                                    ) : (
                                                        <div className="bg-light border rounded d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', minWidth: '48px' }}>
                                                            <span className="material-symbols-outlined text-muted">image</span>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                        <h6 className="mb-0 fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>{p.nombre}</h6>
                                                        <small className="text-muted text-truncate d-block" style={{ fontSize: '0.8rem' }}>{p.categoria?.nombre}</small>
                                                        {isAgotado && <Badge bg="secondary" className="mt-1 fw-normal" style={{ fontSize: '0.7rem' }}>Agotado</Badge>}
                                                    </div>
                                                    
                                                    <div className="fw-semibold text-dark text-end ms-2 text-nowrap flex-shrink-0 fs-6">
                                                        Bs. {parseFloat(p.precio).toFixed(2)}
                                                    </div>
                                                </div>

                                                {/* Expanded options for selected item */}
                                                {seleccionado && (
                                                    <div className="mt-auto pt-3 border-top mt-2 fade-in">
                                                        <Row className="g-2">
                                                            <Col xs={5}>
                                                                <div className="d-flex align-items-center border bg-white rounded">
                                                                    <Button variant="light" className="border-0 px-2 rounded-start" onClick={() => updateChecklistCount(p.id, -1)}>-</Button>
                                                                    <Form.Control 
                                                                        type="number"
                                                                        className="border-0 text-center fw-bold p-1 hide-arrows rounded-0"
                                                                        style={{ width: '45px', minWidth: '45px' }}
                                                                        value={seleccionado.cantidad}
                                                                        onChange={(e) => setChecklistCount(p.id, e.target.value)}
                                                                        onBlur={(e) => {
                                                                            if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                                                                setChecklistCount(p.id, '1');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Button variant="light" className="border-0 px-2 rounded-end" onClick={() => updateChecklistCount(p.id, 1)}>+</Button>
                                                                </div>
                                                            </Col>
                                                            <Col xs={7}>
                                                                <Form.Control 
                                                                    type="text" 
                                                                    size="sm"
                                                                    placeholder="Nota: Ej. Sin hielo" 
                                                                    value={seleccionado.comentario}
                                                                    onChange={(e) => updateChecklistComment(p.id, e.target.value)}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-top bg-white px-4 py-3">
                    <Button variant="outline-secondary" onClick={() => setShowAddItemModal(false)} className="px-4 py-2">Cancelar</Button>
                    <Button variant="dark" onClick={handleAddMultipleItems} disabled={Object.keys(productosSeleccionados).length === 0} className="px-4 py-2 d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined fs-5">check</span>
                        Agregar al Pedido {Object.keys(productosSeleccionados).length > 0 ? `(${Object.keys(productosSeleccionados).length})` : ''}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL PAGO DE CUENTA */}
            <Modal show={showPaymentModal} onHide={handleClosePaymentModal} backdrop="static" size="md">
                <Modal.Header closeButton className="bg-success text-white border-bottom-0 pb-4">
                    <Modal.Title className="d-flex align-items-center gap-2 m-0 fs-4 fw-bold">
                        <span className="material-symbols-outlined">point_of_sale</span>
                        {paymentData?.cuentaId === 'ALL' ? 'Procesar Pago Completo' : 'Procesar Pago'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4 pt-1 position-relative">
                    <div className="bg-white rounded-circle position-absolute start-50 translate-middle-x shadow-sm d-flex align-items-center justify-content-center" style={{ top: '-30px', width: '60px', height: '60px' }}>
                        <span className="material-symbols-outlined text-success" style={{ fontSize: '2rem' }}>receipt_long</span>
                    </div>

                    <div className="text-center mt-4 mb-4">
                        <h6 className="text-muted text-uppercase mb-1" style={{ letterSpacing: '1px', fontSize: '0.8rem' }}>Total a Pagar</h6>
                        <h1 className="display-4 fw-bold text-dark m-0">Bs. {paymentData.totalCuenta?.toFixed(2)}</h1>
                    </div>

                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-secondary">Método de Pago</Form.Label>
                            <div className="d-flex gap-3">
                                <div 
                                    className={`payment-method-card flex-grow-1 p-3 border rounded text-center cursor-pointer transition-all ${paymentData.tipo_pago === 'Efectivo' ? 'border-success bg-success bg-opacity-10' : 'bg-light'}`}
                                    onClick={() => handlePaymentDataChange('tipo_pago', 'Efectivo')}
                                >
                                    <span className={`material-symbols-outlined fs-2 mb-2 ${paymentData.tipo_pago === 'Efectivo' ? 'text-success' : 'text-muted'}`}>payments</span>
                                    <p className={`m-0 fw-bold ${paymentData.tipo_pago === 'Efectivo' ? 'text-success' : 'text-muted'}`}>Efectivo</p>
                                </div>
                                <div 
                                    className={`payment-method-card flex-grow-1 p-3 border rounded text-center cursor-pointer transition-all ${paymentData.tipo_pago === 'QR' ? 'border-success bg-success bg-opacity-10' : 'bg-light'}`}
                                    onClick={() => handlePaymentDataChange('tipo_pago', 'QR')}
                                >
                                    <span className={`material-symbols-outlined fs-2 mb-2 ${paymentData.tipo_pago === 'QR' ? 'text-success' : 'text-muted'}`}>qr_code_2</span>
                                    <p className={`m-0 fw-bold ${paymentData.tipo_pago === 'QR' ? 'text-success' : 'text-muted'}`}>Pago QR</p>
                                </div>
                                <div 
                                    className={`payment-method-card flex-grow-1 p-3 border rounded text-center cursor-pointer transition-all ${paymentData.tipo_pago === 'Mixto' ? 'border-success bg-success bg-opacity-10' : 'bg-light'}`}
                                    onClick={() => handlePaymentDataChange('tipo_pago', 'Mixto')}
                                >
                                    <span className={`material-symbols-outlined fs-2 mb-2 ${paymentData.tipo_pago === 'Mixto' ? 'text-success' : 'text-muted'}`}>compare_arrows</span>
                                    <p className={`m-0 fw-bold ${paymentData.tipo_pago === 'Mixto' ? 'text-success' : 'text-muted'}`}>Mixto</p>
                                </div>
                            </div>
                        </Form.Group>

                        {/* CONTROLES PARA EFECTIVO */}
                        {paymentData.tipo_pago === 'Efectivo' && (
                            <div className="payment-details fade-in">
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-secondary">Monto Recibido</Form.Label>
                                    <InputGroup size="lg">
                                        <InputGroup.Text className="bg-light fw-bold text-muted">Bs.</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            placeholder="0.00"
                                            className="fw-bold"
                                            value={paymentData.monto_pagado}
                                            onChange={(e) => handlePaymentDataChange('monto_pagado', e.target.value)}
                                            autoFocus
                                        />
                                    </InputGroup>
                                </Form.Group>
                                
                                <div className="d-flex justify-content-between align-items-center p-3 rounded bg-light border">
                                    <span className="fw-bold text-muted">Cambio a devolver:</span>
                                    <span className={`fs-4 fw-bold ${paymentData.monto_cambio > 0 ? 'text-primary' : 'text-muted'}`}>
                                        Bs. {paymentData.monto_cambio?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* CONTROLES PARA QR */}
                        {paymentData.tipo_pago === 'QR' && (
                            <div className="payment-details fade-in d-flex flex-column align-items-center">
                                <div className="qr-box p-2 border rounded bg-white shadow-sm mb-3">
                                    <img 
                                        src={paymentData.qrUrl} 
                                        alt="Código QR del Local" 
                                        style={{ width: '200px', height: '200px', objectFit: 'contain' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                                <p className="text-center text-muted mb-3">Muestra este código al cliente para que realice la transferencia de <strong>Bs. {paymentData.totalCuenta?.toFixed(2)}</strong>.</p>
                                
                                <div className="w-100 mt-2">
                                    <Form.Label className="fw-bold text-secondary">Comprobantes (Opcional)</Form.Label>
                                    <div className="input-group">
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            id="comprobantes-upload" 
                                            multiple 
                                            accept="image/*"
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files).map(f => f.name);
                                                handlePaymentDataChange('comprobantes', files);
                                            }}
                                        />
                                    </div>
                                    <small className="text-muted mt-1 d-block">Sube capturas de pantalla de la transferencia.</small>
                                </div>
                            </div>
                        )}

                        {/* CONTROLES PARA MIXTO */}
                        {paymentData.tipo_pago === 'Mixto' && (
                            <div className="payment-details fade-in">
                                <div className="alert alert-info py-2 px-3 mb-3 d-flex align-items-center gap-2">
                                    <span className="material-symbols-outlined">info</span>
                                    <small>El cliente pagará <strong>parte en efectivo</strong> y <strong>parte por QR</strong>. Ingresa cada monto por separado.</small>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-secondary">Monto Transferido por QR</Form.Label>
                                    <InputGroup size="lg">
                                        <InputGroup.Text className="bg-light fw-bold text-muted">Bs.</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            placeholder="0.00"
                                            className="fw-bold"
                                            value={paymentData.monto_qr_transferido}
                                            onChange={(e) => handlePaymentDataChange('monto_qr_transferido', e.target.value)}
                                            autoFocus
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-bold text-secondary">Monto Recibido en Efectivo</Form.Label>
                                    <InputGroup size="lg">
                                        <InputGroup.Text className="bg-light fw-bold text-muted">Bs.</InputGroup.Text>
                                        <Form.Control 
                                            type="number" 
                                            placeholder="0.00"
                                            className="fw-bold"
                                            value={paymentData.monto_efectivo_recibido}
                                            onChange={(e) => handlePaymentDataChange('monto_efectivo_recibido', e.target.value)}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <div className="d-flex justify-content-between align-items-center p-3 rounded bg-light border">
                                    <span className="fw-bold text-muted">Cambio a devolver:</span>
                                    <span className={`fs-4 fw-bold ${paymentData.monto_cambio > 0 ? 'text-primary' : 'text-muted'}`}>
                                        Bs. {Number(paymentData.monto_cambio || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0 px-4 pb-4 border-top">
                    <Button variant="light" onClick={handleClosePaymentModal} className="px-4 border">Cancelar</Button>
                    <Button 
                        variant="success" 
                        onClick={handleProcessPayment} 
                        disabled={saving} 
                        className="px-4 d-flex align-items-center gap-2 fw-bold text-white fs-6 py-2 w-100 mt-3"
                    >
                        {saving ? <Spinner size="sm" animation="border" /> : <span className="material-symbols-outlined">check_circle</span>}
                        Confirmar Pago
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* MODAL COMPARTIR WHATSAPP */}
            <Modal show={showWhatsappModal} onHide={handleCloseWhatsappModal}>
                <Modal.Header closeButton className="bg-info text-white border-bottom-0 pb-4">
                    <Modal.Title className="d-flex align-items-center gap-2 m-0 fs-4 fw-bold">
                        <span className="material-symbols-outlined">share</span>
                        Compartir Detalle por WhatsApp
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4 pt-4 position-relative">
                    <div className="text-center mb-4">
                        <span className="material-symbols-outlined text-info" style={{ fontSize: '4rem' }}>forum</span>
                        <p className="text-muted mt-3">Ingresa el número de teléfono del cliente con el código de país (ej. +591 xxxxxxxx) para enviarle el PDF del pedido.</p>
                    </div>

                    <Form>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold text-secondary">Número de WhatsApp</Form.Label>
                            <InputGroup size="lg">
                                <InputGroup.Text className="bg-light fw-bold text-muted"><span className="material-symbols-outlined fs-5">call</span></InputGroup.Text>
                                <Form.Control 
                                    type="tel" 
                                    placeholder="+591 61234567"
                                    className="fw-bold"
                                    value={whatsappPhone}
                                    onChange={(e) => setWhatsappPhone(e.target.value)}
                                    autoFocus
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="border-top-0 pt-0 px-4 pb-4 border-top">
                    <Button variant="light" onClick={handleCloseWhatsappModal} className="px-4 border">Cancelar</Button>
                    <Button 
                        variant="info" 
                        onClick={handleShareWhatsapp} 
                        disabled={saving || !whatsappPhone} 
                        className="px-4 d-flex align-items-center gap-2 fw-bold text-white fs-6 py-2"
                    >
                        {saving ? <Spinner size="sm" animation="border" /> : <span className="material-symbols-outlined">send</span>}
                        Enviar Mensaje
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={showJustificativoModal} onHide={() => !saving && setShowJustificativoModal(false)}>
                <Modal.Header closeButton={!saving}>
                    <Modal.Title className="d-flex align-items-center gap-2 text-danger">
                        <span className="material-symbols-outlined fs-3">warning</span>
                        Justificar Eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted">Por favor, ingresa el motivo por el cual estás eliminando este pedido. Esta acción quedará registrada para auditoría.</p>
                    <Form.Group>
                        <Form.Label>Motivo de la eliminación (obligatorio):</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Ej. El cliente se retiró antes de ser atendido..."
                            value={justificativoText}
                            onChange={(e) => setJustificativoText(e.target.value)}
                            disabled={saving}
                            autoFocus
                        />
                        {justificativoText.trim().length > 0 && justificativoText.trim().length < 5 && (
                            <Form.Text className="text-danger">El justificativo debe tener al menos 5 caracteres.</Form.Text>
                        )}
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowJustificativoModal(false)} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmCancelarPedido} disabled={saving || justificativoText.trim().length < 5}>
                        {saving ? <><Spinner size="sm" className="me-2" />Eliminando...</> : 'Confirmar Eliminación'}
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default PedidoView;
