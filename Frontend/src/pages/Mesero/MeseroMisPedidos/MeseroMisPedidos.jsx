import React from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { useMeseroMisPedidos } from './useMeseroMisPedidos';
import PaginationBar from '../../../components/PaginationBar';
import './MeseroMisPedidos.css';

const MeseroMisPedidos = () => {
    const { 
        pedidos, 
        loading, 
        error, 
        filterStatus, 
        setFilterStatus, 
        searchTerm, 
        setSearchTerm, 
        handleViewPedido,
        pagination
    } = useMeseroMisPedidos();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container className="mis-pedidos-container py-4 fade-in">
            <div className="d-flex flex-column mb-4">
                <h2 className="fw-bold d-flex align-items-center gap-2 m-0 text-dark">
                    <span className="material-symbols-outlined fs-2 text-dark">receipt_long</span>
                    Historial de Mis Pedidos
                </h2>
                <p className="text-muted mt-2">Revisa el estado de todos los pedidos creados en tu turno actual.</p>
            </div>

            <div className="filter-tools bg-white p-3 rounded-4 shadow-sm mb-4">
                <Row className="g-3 align-items-center">
                    <Col xs={12} md={6}>
                        <div className="search-box-custom">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Buscar por pedido o mesa..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="filter-tabs d-flex gap-2">
                            {['Todos', 'Activos', 'Completados'].map(status => (
                                <button 
                                    key={status}
                                    className={`filter-tab-btn ${filterStatus === status ? 'active' : ''}`}
                                    onClick={() => setFilterStatus(status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </Col>
                </Row>
            </div>

            {pedidos.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                    <span className="material-symbols-outlined text-muted mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>receipt_long</span>
                    <h5 className="text-muted fw-bold">No tienes pedidos registrados</h5>
                    <p className="text-muted">Abre una mesa para crear un nuevo pedido.</p>
                </div>
            ) : (
                <>
                    <Row className="g-4">
                        {pagination.paginatedData.map((pedido) => (
                            <Col md={6} lg={4} key={pedido.id}>
                                <Card className="history-card h-100 border-0" onClick={() => handleViewPedido(pedido.id)}>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <Badge bg="info" className="fs-6 py-2 px-3 fw-bold shadow-sm d-flex align-items-center gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>table_restaurant</span>
                                                Mesa {pedido.mesa?.numero}
                                            </Badge>
                                            {(() => {
                                                const isCompletado = pedido.estado?.id === 3 || pedido.estado?.nombre === 'INACTIVO' || pedido.estado?.nombre === 'COMPLETADO' || pedido.estado?.nombre === 'PAGADO';
                                                const badgeClass = isCompletado ? 'status-inactivo bg-success text-white' : 'status-activo bg-primary text-white';
                                                const badgeText = isCompletado ? 'Cobrado' : 'Pendiente';
                                                const badgeIcon = isCompletado ? 'check_circle' : 'pending';
                                                
                                                return (
                                                    <span className={`status-badge-custom px-3 py-1 rounded-pill fw-bold shadow-sm d-inline-flex align-items-center gap-1 ${badgeClass}`}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{badgeIcon}</span> {badgeText}
                                                    </span>
                                                );
                                            })()}
                                        </div>

                                        <div className="mb-3 flex-grow-1">
                                            <h5 className="fw-bold fs-4 mb-1">Pedido #{pedido.id}</h5>
                                            {pedido.cuentas && pedido.cuentas.length > 0 && (
                                                <p className="text-muted small mb-1 d-flex align-items-center gap-1 flex-wrap">
                                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>people</span>
                                                    {pedido.cuentas.map(c => c.nombre_cliente).join(' · ')}
                                                </p>
                                            )}
                                            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>schedule</span>
                                                {new Date(pedido.created_at).toLocaleString()}
                                            </p>
                                        </div>

                                        <div className="d-flex justify-content-end border-top pt-3 mt-auto">
                                            <span className="text-primary fw-medium d-flex align-items-center gap-1">
                                                Ver Detalles <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>chevron_right</span>
                                            </span>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <PaginationBar {...pagination} />
                </>
            )}
        </Container>
    );
};

export default MeseroMisPedidos;
