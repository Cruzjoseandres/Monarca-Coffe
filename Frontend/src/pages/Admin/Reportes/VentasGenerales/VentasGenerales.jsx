import React, { useState } from 'react';
import { Row, Col, Card, Table, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { useVentasGenerales } from './useVentasGenerales';
import PaginationBar from '../../../../components/PaginationBar';
import './VentasGenerales.css';

const VentasGenerales = () => {
    const { data, loading, error, totalIngresos, totalEfectivo, totalQr, pagination, fetchData } = useVentasGenerales();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleFilter = () => {
        fetchData(startDate || null, endDate || null);
    };

    const handleClear = () => {
        setStartDate('');
        setEndDate('');
        fetchData(null, null);
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="ventas-generales-container fade-in">
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                <h4 className="mb-0">Ventas Generales</h4>
                <div className="d-flex align-items-end gap-2 flex-wrap">
                    <Form.Group>
                        <Form.Label className="small text-muted mb-1">Desde</Form.Label>
                        <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} size="sm" />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="small text-muted mb-1">Hasta</Form.Label>
                        <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} size="sm" />
                    </Form.Group>
                    <Button variant="primary" size="sm" onClick={handleFilter}>Filtrar</Button>
                    {(startDate || endDate) && (
                        <Button variant="outline-secondary" size="sm" onClick={handleClear}>Limpiar</Button>
                    )}
                </div>
            </div>

            <Row className="mb-4 g-3">
                <Col xs={12} sm={4}>
                    <Card className="admin-card text-center py-3 h-100">
                        <Card.Body className="p-3">
                            <span className="material-symbols-outlined text-success mb-2" style={{ fontSize: '2rem' }}>payments</span>
                            <h6 className="text-muted">Efectivo</h6>
                            <h3 className="text-success m-0">Bs. {totalEfectivo.toFixed(2)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card className="admin-card text-center py-3 h-100">
                        <Card.Body className="p-3">
                            <span className="material-symbols-outlined text-primary mb-2" style={{ fontSize: '2rem' }}>qr_code_2</span>
                            <h6 className="text-muted">QR / Transferencia</h6>
                            <h3 className="text-primary m-0">Bs. {totalQr.toFixed(2)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} sm={4}>
                    <Card className="admin-card text-center py-3 h-100">
                        <Card.Body className="p-3">
                            <span className="material-symbols-outlined text-warning mb-2" style={{ fontSize: '2rem' }}>account_balance_wallet</span>
                            <h6 className="text-muted">Total Acumulado</h6>
                            <h3 className="text-warning m-0">Bs. {totalIngresos.toFixed(2)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="admin-card border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="admin-table m-0 align-middle">
                        <thead className="bg-light">
                            <tr className="text-nowrap">
                                <th className="px-4 py-3">Fecha</th>
                                <th className="text-end py-3">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '1rem' }}>payments</span>
                                    Efectivo
                                </th>
                                <th className="text-end py-3">
                                    <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '1rem' }}>qr_code_2</span>
                                    QR
                                </th>
                                <th className="text-end px-4 py-3 fw-bold">Total del Día</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagination.paginatedData.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 text-nowrap fw-medium">{item.fecha}</td>
                                    <td className="text-end text-success text-nowrap">Bs. {(item.total_efectivo || 0).toFixed(2)}</td>
                                    <td className="text-end text-primary text-nowrap">Bs. {(item.total_qr || 0).toFixed(2)}</td>
                                    <td className="text-end px-4 fw-bold text-nowrap">Bs. {item.total_ventas.toFixed(2)}</td>
                                </tr>
                            ))}
                            {pagination.totalItems === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-5">No hay datos de ventas{startDate || endDate ? ' en el rango seleccionado' : ' disponibles'}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
            <PaginationBar {...pagination} />
        </div>
    );
};

export default VentasGenerales;

