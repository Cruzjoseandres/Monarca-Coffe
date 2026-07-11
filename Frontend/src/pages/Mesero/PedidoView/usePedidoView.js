import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPedidoById, updatePedido, deletePedido, generateWhatsAppPdf } from '../../../../services/PedidoService';
import { createCuenta, getCuentasByPedido, deleteCuenta, updateCuenta, getQRUrl } from '../../../../services/CuentaService';
import { createDetalle, createBulkDetalles, getDetallesByCuenta, updateDetalle, bulkUpdateEntrega, deleteDetalle } from '../../../../services/DetallePedidoService';
import { getAllProductos } from '../../../../services/ProductoService';
import { getAllCategorias } from '../../../../services/CategoriaService';
import { useNotification } from '../../../../hooks/useNotification';

const generateTempId = () => -Math.floor(Math.random() * 1000000000);

export const usePedidoView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const queryParams = new URLSearchParams(location.search);
    const viewMode = queryParams.get('mode') || 'edit'; 
    
    // DB State
    const [pedido, setPedido] = useState(null);
    const [cuentas, setCuentas] = useState([]);
    const [detallesPorCuenta, setDetallesPorCuenta] = useState({});
    
    // UI State for Modals
    const [showJustificativoModal, setShowJustificativoModal] = useState(false);
    const [justificativoText, setJustificativoText] = useState('');

    // Draft State
    const [draftCuentas, setDraftCuentas] = useState([]);
    // Mapa de cambios de entrega pendientes: { [detalleId]: cantidad_entregada }
    const deliveryPendingMap = useRef({});
    const deliveryFlushTimeout = useRef(null);
    const [draftDetallesPorCuenta, setDraftDetallesPorCuenta] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [showAddCuentaModal, setShowAddCuentaModal] = useState(false);
    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [selectedCuentaId, setSelectedCuentaId] = useState(null);
    const [asignarNombre, setAsignarNombre] = useState(false);
    
    const [nombreCliente, setNombreCliente] = useState('');
    
    const [busquedaProducto, setBusquedaProducto] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    // Se quitó filtroDisponible, por defecto solo usamos verdaderos
    const [productosSeleccionados, setProductosSeleccionados] = useState({}); 

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        cuentaId: null,
        tipo_pago: 'Efectivo',
        monto_pagado: '',
        monto_cambio: 0,
        comprobantes: [],
        qrUrl: getQRUrl(),
        totalCuenta: 0
    });

    // WhatsApp State
    const [showWhatsappModal, setShowWhatsappModal] = useState(false);
    const [whatsappPhone, setWhatsappPhone] = useState('+591 ');

    const { toast, confirm, showSuccess, showError, hideToast, showConfirm } = useNotification();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [pedidoData, productosData, categoriasData] = await Promise.all([
                getPedidoById(id),
                getAllProductos(),
                getAllCategorias()
            ]);
            setPedido(pedidoData);
            setProductos(productosData);
            setCategorias(categoriasData);
            
            await loadCuentasYDetalles(pedidoData.id);
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos del pedido:', err);
            setError('Error al cargar la información del pedido');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const loadCuentasYDetalles = async (pedidoId) => {
        const cuentasData = await getCuentasByPedido(pedidoId);
        setCuentas(cuentasData);
        setDraftCuentas(JSON.parse(JSON.stringify(cuentasData))); // Deep clone for draft
        
        const detallesMap = {};
        for (const cuenta of cuentasData) {
            detallesMap[cuenta.id] = await getDetallesByCuenta(cuenta.id);
        }
        setDetallesPorCuenta(detallesMap);
        setDraftDetallesPorCuenta(JSON.parse(JSON.stringify(detallesMap))); // Deep clone
        
        setHasUnsavedChanges(false);
    };

    const recalcularTotalesLocales = (cuentaId, nuevosDetalles) => {
        setDraftCuentas(prev => prev.map(c => {
            if (c.id === cuentaId) {
                const total = nuevosDetalles.reduce((sum, d) => sum + Number(d.subtotal || 0), 0);
                return { ...c, total };
            }
            return c;
        }));
    };

    // --- TERMINAR Y CANCELAR PEDIDO (GLOBAL) ---
    const handleTerminarPedido = async () => {
        if (hasUnsavedChanges) {
            const confirmedSave = await showConfirm('Tienes cambios sin guardar. Se guardarán antes de terminar el pedido. ¿Continuar?');
            if (!confirmedSave) return;
            const success = await handleGuardarCambios(true); // silent return success
            if (!success) return;
        }

        // VALIDAR que todas las cuentas estén pagadas (estado 3)
        const cuentasAbiertas = cuentas.filter(c => !c.estado || c.estado.id !== 3);
        if (cuentasAbiertas.length > 0) {
            showError(`No se puede terminar el pedido. Hay ${cuentasAbiertas.length} cuenta(s) pendientes de cobro.`);
            return;
        }

        const confirmed = await showConfirm('¿Estás seguro de TERMINAR este pedido? Se marcará como completado y la mesa quedará libre.', {
            confirmText: 'Sí, terminar',
            confirmVariant: 'success'
        });
        if (confirmed) {
            try {
                await updatePedido(pedido.id, { id_estado: 3 }); // 3 = Completado
                showSuccess('Pedido finalizado exitosamente. Mesa liberada.');
                navigate('/mesero/mesas');
            } catch (err) {
                console.error(err);
                showError('Error al terminar el pedido');
            }
        }
    };

    const handleCancelarPedido = async () => {
        const confirmed = await showConfirm('¿Estás seguro de ELIMINAR este pedido? Esta acción es irreversible y requiere un justificativo para auditoría.', {
            confirmText: 'Sí, eliminar',
            confirmVariant: 'danger'
        });
        
        if (confirmed) {
            setJustificativoText('');
            setShowJustificativoModal(true);
        }
    };

    const confirmCancelarPedido = async () => {
        if (!justificativoText || justificativoText.trim().length < 5) {
            showError('Debes ingresar un justificativo válido (mínimo 5 caracteres).');
            return;
        }

        try {
            setSaving(true);
            await deletePedido(pedido.id, justificativoText.trim());
            showSuccess('Pedido eliminado y guardado en auditoría');
            setShowJustificativoModal(false);
            navigate('/mesero/mesas');
        } catch (err) {
            console.error(err);
            showError('Error al eliminar el pedido');
        } finally {
            setSaving(false);
        }
    };

    // --- DRAFT GUARDAR Y DESCARTAR ---
    const handleGuardarCambios = async (silent = false) => {
        setSaving(true);
        try {
            // 1. Diffs de Cuentas
            const dbCuentasIds = cuentas.map(c => c.id);
            const draftCuentasIds = draftCuentas.map(c => c.id);
            
            // Cuentas eliminadas en el borrador (estaban en db pero no en draft)
            const cuentasAEliminar = cuentas.filter(c => !draftCuentasIds.includes(c.id));
            for (const c of cuentasAEliminar) {
                await deleteCuenta(c.id);
            }

            // Cuentas nuevas en el borrador (tienen isNew=true o id negativo)
            const cuentasACrear = draftCuentas.filter(c => c.isNew || c.id < 0);
            const cuentaIdMap = {}; // tempId -> real DB id
            
            for (const c of cuentasACrear) {
                const res = await createCuenta({ id_pedido: pedido.id, nombre_cliente: c.nombre_cliente });
                cuentaIdMap[c.id] = res.id;
            }

            // 2. Diffs de Detalles
            for (const cuentaDraft of draftCuentas) {
                // Determine real cuenta ID (en caso de ser nueva cuenta)
                const realCuentaId = cuentaIdMap[cuentaDraft.id] || cuentaDraft.id;
                
                const dDetalles = draftDetallesPorCuenta[cuentaDraft.id] || [];
                const oDetalles = detallesPorCuenta[cuentaDraft.id] || []; // If new cuenta, oDetalles is empty. Great!

                const dDetIds = dDetalles.map(d => d.id);
                const aEliminar = oDetalles.filter(o => !dDetIds.includes(o.id));
                for (const e of aEliminar) {
                    await deleteDetalle(e.id);
                }

                const aCrear = dDetalles.filter(d => d.isNew || d.id < 0);
                if (aCrear.length > 0) {
                    const bulkArray = aCrear.map(c => ({
                        id_cuenta: realCuentaId,
                        id_producto: c.producto.id,
                        cantidad: c.cantidad,
                        comentario: c.comentario || ''
                    }));
                    await createBulkDetalles(bulkArray);
                }

                const aModificar = dDetalles.filter(d => !d.isNew && d.id > 0 && d.isModified);
                for (const m of aModificar) {
                    await updateDetalle(m.id, {
                        cantidad: m.cantidad,
                        comentario: m.comentario
                    });
                }
            }

            if (!silent) showSuccess('Cambios guardados exitosamente');
            await loadCuentasYDetalles(pedido.id);
            return true;
        } catch (error) {
            console.error('Error al guardar borrador:', error);
            showError('Ocurrió un problema guardando tu pedido. Revisa tu conexión.');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleCancelarCambios = async () => {
        if (!hasUnsavedChanges) return;
        const confirmed = await showConfirm('¿Descartar todos los cambios recientes sin guardar?');
        if (confirmed) {
            setDraftCuentas(JSON.parse(JSON.stringify(cuentas)));
            setDraftDetallesPorCuenta(JSON.parse(JSON.stringify(detallesPorCuenta)));
            setHasUnsavedChanges(false);
            showSuccess('Cambios descartados');
        }
    };

    // --- CUENTAS DRAFT ---
    const handleAddCuenta = () => {
        const newTempId = generateTempId();
        // Si el usuario no asignó nombre, auto-generar "Cuenta N"
        const autoNombre = asignarNombre && nombreCliente.trim()
            ? nombreCliente.trim()
            : `Cuenta ${draftCuentas.length + 1}`;
        
        const nuevaCuenta = {
            id: newTempId,
            id_pedido: pedido.id,
            nombre_cliente: autoNombre,
            total: 0,
            isNew: true
        };
        
        setDraftCuentas(prev => [...prev, nuevaCuenta]);
        setDraftDetallesPorCuenta(prev => ({ ...prev, [newTempId]: [] }));
        
        setHasUnsavedChanges(true);
        setNombreCliente('');
        setAsignarNombre(false);
        setShowAddCuentaModal(false);
        showSuccess(`Cuenta "${autoNombre}" agregada al borrador`);
    };

    const handleDeleteCuenta = async (cuentaId) => {
        const confirmed = await showConfirm('¿Estás seguro de quitar esta cuenta y todos sus items de tu borrador?');
        if (confirmed) {
            setDraftCuentas(prev => prev.filter(c => c.id !== cuentaId));
            setDraftDetallesPorCuenta(prev => {
                const next = { ...prev };
                delete next[cuentaId];
                return next;
            });
            setHasUnsavedChanges(true);
        }
    };

    // --- AGREGAR PRODUCTOS CHECKLIST DRAFT ---
    const handleOpenAddItem = (cuentaId) => {
        setSelectedCuentaId(cuentaId);
        setBusquedaProducto('');
        setFiltroCategoria('');
        setProductosSeleccionados({});
        setShowAddItemModal(true);
    };

    const toggleProductoChecklist = (id_producto) => {
        setProductosSeleccionados(prev => {
            const current = { ...prev };
            if (current[id_producto]) {
                delete current[id_producto];
            } else {
                current[id_producto] = { cantidad: 1, comentario: '' };
            }
            return current;
        });
    };

    const updateChecklistCount = (id_producto, delta) => {
        setProductosSeleccionados(prev => {
            const current = { ...prev };
            if (!current[id_producto]) return current;
            
            current[id_producto] = { ...current[id_producto] };
            const newCount = current[id_producto].cantidad + delta;
            
            if (newCount <= 0) {
                delete current[id_producto];
            } else {
                current[id_producto].cantidad = newCount;
            }
            return current;
        });
    };

    const setChecklistCount = (id_producto, countStr) => {
        setProductosSeleccionados(prev => {
            const current = { ...prev };
            if (!current[id_producto]) return current;
            
            current[id_producto] = { ...current[id_producto] };

            if (countStr === '') {
                current[id_producto].cantidad = '';
                return current;
            }

            const newCount = parseInt(countStr);
            if (!isNaN(newCount)) {
                current[id_producto].cantidad = newCount;
            }
            return current;
        });
    };

    const updateChecklistComment = (id_producto, comentario) => {
        setProductosSeleccionados(prev => {
            const current = { ...prev };
            if (current[id_producto]) {
                current[id_producto] = { ...current[id_producto], comentario };
            }
            return current;
        });
    };

    const handleAddMultipleItems = () => {
        const items = Object.entries(productosSeleccionados).filter(([, data]) => data.cantidad !== '' && parseInt(data.cantidad) > 0);
        if (items.length === 0) return;
        
        const nuevosDetalles = items.map(([id_producto, data]) => {
            const prod = productos.find(p => p.id === parseInt(id_producto));
            return {
                id: generateTempId(),
                cuenta: { id: selectedCuentaId },
                producto: prod,
                cantidad: parseInt(data.cantidad),
                subtotal: prod ? prod.precio * parseInt(data.cantidad) : 0,
                comentario: data.comentario,
                cantidad_entregada: 0,
                created_at: new Date().toISOString(), // Simulates created timing for Extras splitting
                isNew: true
            };
        });

        setDraftDetallesPorCuenta(prev => {
            const next = { ...prev };
            const actuales = next[selectedCuentaId] || [];
            next[selectedCuentaId] = [...actuales, ...nuevosDetalles];
            recalcularTotalesLocales(selectedCuentaId, next[selectedCuentaId]);
            return next;
        });

        setHasUnsavedChanges(true);
        setShowAddItemModal(false);
        showSuccess(`${items.length} productos marcados en el borrador`);
    };

    // --- MODIFICAR PRODUCTOS EN LA CUENTA DRAFT ---
    const handleCambiarCantidadDetalle = async (detalleId, nuevaCantidad) => {
        const todosLosDetallesDraft = draftCuentas.flatMap(c => draftDetallesPorCuenta[c.id] || []);
        const detalle = todosLosDetallesDraft.find(d => d.id === detalleId);
        
        if (!detalle) return;

        if (nuevaCantidad <= 0) {
            const confirmed = await showConfirm('¿Deseas quitar este producto de la cuenta en tu borrador?');
            if (confirmed) {
                handleDeleteDetalle(detalleId);
            }
            return;
        }

        setDraftDetallesPorCuenta(prev => {
            const next = { ...prev };
            const cuentaId = detalle.cuenta.id;
            const detalles = [...(next[cuentaId] || [])];
            const dIndex = detalles.findIndex(d => d.id === detalleId);
            
            if (dIndex === -1) return next;

            // Extra splitting logic for late additions to initial orders
            if (!detalle.isNew && nuevaCantidad > detalle.cantidad && getClasificacionDetalle(detalle) === 'Pedido Inicial') {
                const extrasInSameCuenta = detalles.filter(d => 
                    d.producto?.id === detalle.producto?.id && getClasificacionDetalle(d) === 'Extras'
                );
                
                const increment = nuevaCantidad - detalle.cantidad;

                if (extrasInSameCuenta.length > 0) {
                    // Sum to existing Extra
                    const extIdx = detalles.findIndex(d => d.id === extrasInSameCuenta[0].id);
                    const oldExt = detalles[extIdx];
                    detalles[extIdx] = {
                        ...oldExt,
                        cantidad: oldExt.cantidad + increment,
                        subtotal: oldExt.producto.precio * (oldExt.cantidad + increment),
                        isModified: !oldExt.isNew
                    };
                } else {
                    // Create new Extra
                    const extraDetalle = {
                        ...detalle,
                        id: generateTempId(),
                        cantidad: increment,
                        subtotal: detalle.producto.precio * increment,
                        created_at: new Date().toISOString(),
                        isNew: true,
                        isModified: false
                    };
                    detalles.push(extraDetalle);
                }
            } else {
                // Just modify
                detalles[dIndex] = {
                    ...detalle,
                    cantidad: nuevaCantidad,
                    subtotal: detalle.producto.precio * nuevaCantidad,
                    isModified: !detalle.isNew
                };
            }

            next[cuentaId] = detalles;
            recalcularTotalesLocales(cuentaId, next[cuentaId]);
            return next;
        });

        setHasUnsavedChanges(true);
    };

    const handleDeleteDetalle = async (detalleId) => {
        setDraftDetallesPorCuenta(prev => {
            const next = { ...prev };
            for (const cuentaId in next) {
                const oldLen = next[cuentaId].length;
                next[cuentaId] = next[cuentaId].filter(d => d.id !== detalleId);
                if (next[cuentaId].length !== oldLen) {
                    recalcularTotalesLocales(cuentaId, next[cuentaId]);
                    break;
                }
            }
            return next;
        });
        setHasUnsavedChanges(true);
    };

    // ------------------------------------
    // ENTREGA DE ITEMS — 100% local, sin re-renders globales.
    // Cada fila maneja su propio estado visual (DeliveryRow en el JSX).
    // Solo se acumula en el mapa para el flush bulk al salir.
    // ------------------------------------
    const handleEntregarItem = (detalleId, nuevaCantidad) => {
        if (detalleId > 0) {
            deliveryPendingMap.current[detalleId] = nuevaCantidad;

            setDraftDetallesPorCuenta(prev => {
                const next = { ...prev };
                for (const cuentaId in next) {
                    const detalles = next[cuentaId];
                    const idx = detalles?.findIndex(d => d.id === detalleId);
                    if (idx !== -1 && idx !== undefined) {
                        const updated = [...detalles];
                        updated[idx] = {
                            ...updated[idx],
                            cantidad_entregada: nuevaCantidad
                        };
                        next[cuentaId] = updated;
                        break;
                    }
                }
                return next;
            });

            if (deliveryFlushTimeout.current) {
                clearTimeout(deliveryFlushTimeout.current);
            }
            deliveryFlushTimeout.current = setTimeout(() => {
                flushDeliveryChanges();
            }, 600);
        }
    };

    // Envía todos los cambios de entrega acumulados al servidor en una sola llamada
    const flushDeliveryChanges = async () => {
        if (deliveryFlushTimeout.current) {
            clearTimeout(deliveryFlushTimeout.current);
            deliveryFlushTimeout.current = null;
        }
        const pending = deliveryPendingMap.current;
        const items = Object.entries(pending).map(([id, cantidad_entregada]) => ({
            id: Number(id),
            cantidad_entregada,
        }));
        if (items.length === 0) return;
        deliveryPendingMap.current = {}; // Limpiar antes del request
        try {
            await bulkUpdateEntrega(items);
        } catch (err) {
            console.error('Error al sincronizar entregas:', err);
            showError('Error al guardar entregas. Revisá tu conexión.');
        }
    };

    const navigateBack = async () => {
        // En modo entrega, guardar todos los cambios pendientes antes de salir
        if (viewMode === 'deliver') {
            await flushDeliveryChanges();
        }

        if (hasUnsavedChanges) {
            const confirmed = await showConfirm('Tienes cambios sin guardar. ¿Deseas salir de todas formas y perderlos?', { 
                confirmVariant: 'danger', 
                confirmText: 'Salir y Perder Cambios' 
            });
            if (!confirmed) return;
        }

        const stateFrom = location.state?.from;
        if (stateFrom) {
            navigate(stateFrom);
        } else {
            navigate('/mesero/mesas');
        }
    };

    const totalPedido = draftCuentas.reduce((sum, c) => sum + Number(c.total || 0), 0);

    const normalizeText = (text) => text ? text.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

    const productosFiltrados = productos
        .filter(p => {
            if (!busquedaProducto || !busquedaProducto.trim()) return true;
            const terms = normalizeText(busquedaProducto.trim()).split(/\s+/);
            const target = `${normalizeText(p.nombre)} ${normalizeText(p.descripcion)} ${normalizeText(p.categoria?.nombre)}`;
            return terms.every(term => target.includes(term));
        })
        .filter(p => {
            if (!filtroCategoria) return true;
            return p.categoria?.id === parseInt(filtroCategoria);
        })
        .sort((a, b) => {
            if (a.disponible !== b.disponible) return a.disponible ? -1 : 1;
            const popA = Number(a.total_solicitado || 0);
            const popB = Number(b.total_solicitado || 0);
            if (popB !== popA) return popB - popA;
            return (a.nombre || '').localeCompare(b.nombre || '');
        });

    const getClasificacionDetalle = (detalle) => {
        const cuenta = draftCuentas.find(c => c.id === detalle.cuenta?.id) || cuentas.find(c => c.id === detalle.cuenta?.id);
        if (cuenta && cuenta.isNew) return 'Pedido Inicial';
        if (detalle.isNew) return 'Extras';

        if (!detalle.created_at || !detalle.cuenta) return 'Pedido Inicial';
        const todosLosDetalles = draftDetallesPorCuenta[detalle.cuenta.id] || [];
        if (todosLosDetalles.length === 0) return 'Pedido Inicial';

        const oldestTime = Math.min(...todosLosDetalles.map(d => new Date(d.created_at || Date.now()).getTime()));
        const detalleCreation = new Date(detalle.created_at).getTime();
        
        // 2000 ms (2 segundos) de tolerancia máxima para absorber el tiempo de ejecución en la Base de Datos del insert del lote original.
        return (detalleCreation - oldestTime) > 2000 ? 'Extras' : 'Pedido Inicial';
    };

    // ----- PAYMENT HANDLING -----

    const handleOpenPaymentModal = (cuentaId) => {
        let totalCuentaVal = 0;
        if (cuentaId === 'ALL') {
            const unpaid = cuentas.filter(c => !c.estado || c.estado.id !== 3);
            totalCuentaVal = unpaid.reduce((sum, c) => sum + Number(c.total || 0), 0);
        } else {
            const cuenta = draftCuentas.find(c => c.id === cuentaId) || cuentas.find(c => c.id === cuentaId);
            totalCuentaVal = Number(cuenta?.total || 0);
        }

        setPaymentData({
            cuentaId,
            tipo_pago: 'Efectivo',
            monto_pagado: '',
            monto_cambio: 0,
            monto_efectivo_recibido: '',
            monto_qr_transferido: '',
            comprobantes: [],
            qrUrl: getQRUrl(),
            totalCuenta: totalCuentaVal
        });
        setShowPaymentModal(true);
    };

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false);
    };

    const handlePaymentDataChange = (field, value) => {
        setPaymentData(prev => {
            const next = { ...prev, [field]: value };
            
            if (next.tipo_pago === 'Efectivo') {
                if (field === 'monto_pagado') {
                    const paid = Number(value);
                    next.monto_cambio = paid > prev.totalCuenta ? paid - prev.totalCuenta : 0;
                }
            } else if (field === 'tipo_pago' && value === 'QR') {
                next.monto_pagado = prev.totalCuenta;
                next.monto_cambio = 0;
            } else if (field === 'tipo_pago' && value === 'Mixto') {
                next.monto_efectivo_recibido = '';
                next.monto_qr_transferido = '';
                next.monto_cambio = 0;
                next.monto_pagado = '';
            } else if (next.tipo_pago === 'Mixto') {
                // Recalculate for Mixto on any subfield change
                const efectivoRecibido = Number(field === 'monto_efectivo_recibido' ? value : next.monto_efectivo_recibido) || 0;
                const qrTransferido = Number(field === 'monto_qr_transferido' ? value : next.monto_qr_transferido) || 0;
                const totalRecibido = efectivoRecibido + qrTransferido;
                next.monto_pagado = totalRecibido;
                next.monto_cambio = totalRecibido > prev.totalCuenta ? totalRecibido - prev.totalCuenta : 0;
            }
            
            return next;
        });
    };

    const handleProcessPayment = async () => {
        try {
            setSaving(true);
            
            if (paymentData.cuentaId === 'ALL') {
                const unpaid = cuentas.filter(c => !c.estado || c.estado.id !== 3);
                
                // Compute breakdown for Mixto
                const isMixto = paymentData.tipo_pago === 'Mixto';
                const qrAmt = isMixto ? Number(paymentData.monto_qr_transferido) || 0 : 0;

                for (let i = 0; i < unpaid.length; i++) {
                    const c = unpaid[i];
                    const isLast = (i === unpaid.length - 1);
                    const montoEfectivoReal = isLast ? (Number(paymentData.monto_efectivo_recibido) || 0) - Number(paymentData.monto_cambio || 0) : 0;
                    
                    const payload = {
                        id_estado: 3,
                        tipo_pago: paymentData.tipo_pago,
                        monto_pagado: isLast ? (Number(c.total) + Number(paymentData.monto_cambio)) : Number(c.total),
                        monto_cambio: isLast ? Number(paymentData.monto_cambio) : 0,
                        comprobantes: paymentData.comprobantes,
                        ...(isMixto && { monto_qr: isLast ? qrAmt : 0, monto_efectivo: isLast ? montoEfectivoReal : Number(c.total) })
                    };
                    await updateCuenta(c.id, payload);
                }
                showSuccess('Pago registrado y cuentas cerradas correctamente.');
            } else {
                const isMixto = paymentData.tipo_pago === 'Mixto';
                const qrAmt = isMixto ? Number(paymentData.monto_qr_transferido) || 0 : 0;
                const efectivoReal = isMixto
                    ? (Number(paymentData.monto_efectivo_recibido) || 0) - Number(paymentData.monto_cambio || 0)
                    : 0;

                const payload = {
                    id_estado: 3,
                    tipo_pago: paymentData.tipo_pago,
                    monto_pagado: Number(paymentData.monto_pagado),
                    monto_cambio: Number(paymentData.monto_cambio),
                    comprobantes: paymentData.comprobantes,
                    ...(isMixto && { monto_qr: qrAmt, monto_efectivo: efectivoReal })
                };
                await updateCuenta(paymentData.cuentaId, payload);
                showSuccess('Pago registrado y cuenta cerrada correctamente.');
            }

            setShowPaymentModal(false);
            loadData(); // Reload to refresh statuses
        } catch (err) {
            console.error(err);
            showError('Error al procesar el pago.');
        } finally {
            setSaving(false);
        }
    };

    // ----- WHATSAPP SHARING -----
    
    const handleOpenWhatsappModal = () => {
        setWhatsappPhone('+591 ');
        setShowWhatsappModal(true);
    };

    const handleCloseWhatsappModal = () => {
        setShowWhatsappModal(false);
    };

    const handleShareWhatsapp = async () => {
        if (!whatsappPhone || whatsappPhone.trim() === '') {
            showError('Por favor ingresa un número de teléfono válido.');
            return;
        }

        try {
            setSaving(true);
            const pdfUrl = await generateWhatsAppPdf(id);
            
            // Format phone number, stripping spaces/dashes (assuming bolivian code +591 if missing, or just passing as is)
            const cleanPhone = whatsappPhone.replace(/\D/g, '');
            
            const message = encodeURIComponent(`¡Hola! 👋 Aquí tienes el detalle de tu cuenta de la cafetería. Puedes revisarlo en el siguiente enlace:\n\n${pdfUrl}\n\n¡Gracias por tu visita!`);
            const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
            
            window.open(waUrl, '_blank');
            setShowWhatsappModal(false);
            showSuccess('Redirigiendo a WhatsApp...');
        } catch (err) {
            console.error(err);
            showError('Error al generar el PDF del pedido.');
        } finally {
            setSaving(false);
        }
    };

    return {
        pedido, 
        cuentas: draftCuentas, 
        detallesPorCuenta: draftDetallesPorCuenta, 
        productosFiltrados, categorias, totalPedido,
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
    };
};
