import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Table, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import ReporteService from '../../../../services/ReporteService';
import { getQRUrl, uploadQR } from '../../../../services/CuentaService';
import { useNotification } from '../../../../hooks/useNotification';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrUrl, setQrUrl] = useState(getQRUrl());
    const [uploadingQr, setUploadingQr] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchKpis = async () => {
        setLoading(true);
        try {
            const data = await ReporteService.getDashboardKpis(startDate, endDate);
            setKpis(data);
        } catch (error) {
            console.error("Error fetching dashboard KPIs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKpis();
    }, [startDate, endDate]);

    const handleQrUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Mostrar vista previa inmediata
        const objectUrl = URL.createObjectURL(file);
        setQrUrl(objectUrl);
        setUploadingQr(true);

        try {
            await uploadQR(file);
            setQrUrl(getQRUrl());
            showSuccess('QR actualizado con éxito');
        } catch (error) {
            console.error('Error al subir QR:', error);
            showError('Error al actualizar QR');
            // Revertir a la URL anterior en caso de error
            setQrUrl(getQRUrl());
        } finally {
            setUploadingQr(false);
            URL.revokeObjectURL(objectUrl);
        }
    };

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="dashboard-container px-0">
            {/* Header */}
            <div className="dashboard-header d-flex justify-content-between align-items-center px-4 py-3 mb-4">
                <div className="dashboard-search d-none d-md-flex align-items-center">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input type="text" className="search-input" placeholder="Buscar pedidos, artículos o personal..." />
                </div>
                <div className="dashboard-actions d-flex align-items-center gap-3">
                    <button className="action-btn position-relative">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="notification-dot"></span>
                    </button>
                    <button className="action-btn">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </div>

            <div className="px-4 pb-4">
                {/* Welcome Section */}
                <Row className="mb-4 align-items-end g-3">
                    <Col xs={12} md={8}>
                        <h2 className="dashboard-title m-0">¡Buenos días, Admin!</h2>
                        <p className="dashboard-subtitle m-0 mt-2">Aquí está lo que sucede en tu cafetería hoy.</p>
                    </Col>
                    <Col xs={12} md={5} className="d-flex justify-content-md-end gap-2 align-items-center">
                        <Form.Control 
                            type="date" 
                            name="startDate" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="bg-light border-0 shadow-sm"
                            style={{ maxWidth: '160px' }}
                        />
                        <span className="text-muted fw-bold">-</span>
                        <Form.Control 
                            type="date" 
                            name="endDate" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="bg-light border-0 shadow-sm"
                            style={{ maxWidth: '160px' }}
                        />
                        {(startDate || endDate) && (
                            <button 
                                className="btn btn-light shadow-sm text-danger d-flex align-items-center p-2" 
                                onClick={() => { setStartDate(''); setEndDate(''); }}
                                title="Limpiar fechas"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </Col>
                </Row>

                {/* Stats Cards Row 1: Main KPIs */}
                <Row className="mb-4 g-4">
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-bg-icon text-primary">payments</div>
                            <div className="position-relative z-1">
                                <p className="stat-label mb-1">Ventas Totales (Completadas)</p>
                                <div className="d-flex align-items-baseline gap-2">
                                    <h3 className="stat-value m-0">Bs. {kpis?.total_sales_today?.toFixed(2) || '0.00'}</h3>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card h-100 p-3 bg-light shadow-sm rounded border-start border-4 border-success">
                            <div className="position-relative z-1 d-flex flex-column justify-content-center h-100">
                                <p className="stat-label mb-1 text-muted fw-bold d-flex align-items-center gap-1"><span className="material-symbols-outlined fs-6 text-success">monetization_on</span> Efectivo</p>
                                <h4 className="m-0 text-success fw-bold">Bs. {kpis?.ventas_efectivo?.toFixed(2) || '0.00'}</h4>
                            </div>
                        </div>
                    </Col>
                    <Col md={3}>
                         <div className="stat-card h-100 p-3 bg-light shadow-sm rounded border-start border-4 border-info">
                            <div className="position-relative z-1 d-flex flex-column justify-content-center h-100">
                                <p className="stat-label mb-1 text-muted fw-bold d-flex align-items-center gap-1"><span className="material-symbols-outlined fs-6 text-info">qr_code_scanner</span> QR</p>
                                <h4 className="m-0 text-info fw-bold">Bs. {kpis?.ventas_qr?.toFixed(2) || '0.00'}</h4>
                            </div>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="stat-card">
                            <div className="stat-bg-icon text-info">receipt_long</div>
                            <div className="position-relative z-1">
                                <p className="stat-label mb-1">Cuentas/Pedidos Procesados</p>
                                <div className="d-flex align-items-baseline gap-2">
                                    <h3 className="stat-value m-0">{kpis?.orders_processed_today || 0}</h3>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Quick Actions Grid */}
                <div className="mb-4">
                    <h3 className="section-title mb-3 fs-5">Acciones Rápidas</h3>
                    <Row className="g-3">
                        <Col xs={12} sm={6} md={3}>
                            <button className="d-flex align-items-center gap-3 p-3 w-100 bg-white border rounded shadow-sm text-start transition-all" style={{ cursor: 'pointer' }} onClick={() => {/* TODO: Enlace a POS si aplica */ }}>
                                <div className="p-2 rounded bg-light text-primary d-flex align-items-center justify-content-center">
                                    <span className="material-symbols-outlined fs-5">point_of_sale</span>
                                </div>
                                <span className="fw-bold text-dark fs-6">Nueva Venta</span>
                            </button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <button className="d-flex align-items-center gap-3 p-3 w-100 bg-white border rounded shadow-sm text-start transition-all" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/productos')}>
                                <div className="p-2 rounded bg-light text-primary d-flex align-items-center justify-content-center">
                                    <span className="material-symbols-outlined fs-5">add_box</span>
                                </div>
                                <span className="fw-bold text-dark fs-6">Añadir Producto</span>
                            </button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <button className="d-flex align-items-center gap-3 p-3 w-100 bg-white border rounded shadow-sm text-start transition-all" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/usuarios')}>
                                <div className="p-2 rounded bg-light text-primary d-flex align-items-center justify-content-center">
                                    <span className="material-symbols-outlined fs-5">person_add</span>
                                </div>
                                <span className="fw-bold text-dark fs-6">Registrar Personal</span>
                            </button>
                        </Col>
                        <Col xs={12} sm={6} md={3}>
                            <button className="d-flex align-items-center gap-3 p-3 w-100 bg-white border rounded shadow-sm text-start transition-all" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/reportes')}>
                                <div className="p-2 rounded bg-light text-primary d-flex align-items-center justify-content-center">
                                    <span className="material-symbols-outlined fs-5">monitoring</span>
                                </div>
                                <span className="fw-bold text-dark fs-6">Ver Reportes</span>
                            </button>
                        </Col>
                    </Row>
                </div>

                <Row className="g-4 mb-5">
                    {/* Configuracion QR */}
                    <Col lg={4}>
                        <div className="content-card h-100 p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="section-title m-0">Pago con QR</h3>
                            </div>
                            <div className="d-flex flex-column align-items-center gap-3">
                                <div 
                                    className="qr-container bg-light rounded d-flex justify-content-center align-items-center overflow-hidden border"
                                    style={{ width: '150px', height: '150px' }}
                                >
                                    <img 
                                        key={qrUrl}
                                        src={qrUrl} 
                                        alt="QR Cobros" 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <span className="material-symbols-outlined position-absolute text-muted fs-1" style={{ zIndex: 0 }}>
                                        qr_code_2
                                    </span>
                                </div>
                                <div className="text-center w-100">
                                    <input 
                                        type="file" 
                                        id="qr-upload" 
                                        style={{ display: 'none' }} 
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleQrUpload}
                                    />
                                    <label htmlFor="qr-upload" className="btn btn-outline-primary w-100 d-flex justify-content-center align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                        {uploadingQr ? (
                                            <>
                                                <Spinner animation="border" size="sm" /> 
                                                <span>Subiendo...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined fs-5">upload</span>
                                                <span>Actualizar QR</span>
                                            </>
                                        )}
                                    </label>
                                    <small className="text-muted mt-2 d-block">Sube la imagen de tu QR bancario.</small>
                                </div>
                            </div>
                        </div>
                    </Col>
                    
                    {/* Recent Activity */}
                    <Col lg={8}>
                        <div className="content-card h-100">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="section-title m-0">Actividad Reciente</h3>
                                <Link to="/admin/actividad-reciente" className="link-primary fw-bold text-decoration-none">Ver Todo</Link>
                            </div>
                            <div className="table-responsive">
                                <Table hover className="custom-table mb-0 align-middle table-sm">
                                    <thead className="bg-light text-nowrap">
                                        <tr>
                                            <th className="px-3 py-2 fs-7 text-muted">PEDIDO</th>
                                            <th className="py-2 fs-7 text-muted">ARTÍCULOS</th>
                                            <th className="text-end py-2 fs-7 text-muted">MONTO</th>
                                            <th className="text-end px-3 py-2 fs-7 text-muted">ESTADO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kpis?.recent_orders && kpis.recent_orders.length > 0 ? (
                                            [...kpis.recent_orders].reverse().map((order, idx) => (
                                                <tr key={order.id || idx}>
                                                    <td className="px-3 py-2 fw-bold text-dark text-nowrap">#{order.id}</td>
                                                    <td className="py-2 text-muted" style={{ minWidth: '150px', maxWidth: '250px' }}>
                                                        <div className="text-truncate">{order.items}</div>
                                                    </td>
                                                    <td className="text-end py-2 fw-bold text-success text-nowrap">Bs. {parseFloat(order.amount).toFixed(2)}</td>
                                                    <td className="text-end px-3 py-2 text-nowrap">
                                                        <div className="d-flex flex-column align-items-end">
                                                            <span className={`status-badge ${order.status === 'Completado' ? 'success' : order.status === 'ELIMINADO' ? 'danger' : order.status === 'PENDIENTE' ? 'warning' : 'primary'}`}>
                                                                {order.status}
                                                            </span>
                                                            {order.status === 'ELIMINADO' && order.justificativo && (
                                                                <small className="text-danger fw-bold mt-1 text-wrap" style={{ fontSize: '0.75rem', maxWidth: '160px' }}>
                                                                    Motivo: {order.justificativo}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted py-4">No hay actividad reciente</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </Container>
    );
};

export default AdminDashboard;
