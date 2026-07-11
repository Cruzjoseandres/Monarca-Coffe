import React, { useState } from 'react';
import { Card, Table, Spinner, Alert, Badge, Form, Button } from 'react-bootstrap';
import { useVentasProducto } from './useVentasProducto';
import './VentasProducto.css';

const VentasProducto = () => {
    const { data, loading, error, fetchData } = useVentasProducto();
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
        <div className="ventas-producto-container fade-in">
            <div className="mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                <h4 className="mb-0">Ventas por Producto</h4>
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
            <Card className="admin-card border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-0">
                    <Table responsive hover className="admin-table m-0 align-middle">
                        <thead className="bg-light">
                            <tr className="text-nowrap">
                                <th className="px-4 py-3">Producto</th>
                                <th className="py-3">Cantidad Vendida</th>
                                <th className="text-end px-4 py-3">Ingreso Generado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 fw-bold" style={{ minWidth: '180px' }}>{item.producto}</td>
                                        <td className="text-nowrap">
                                            <Badge bg="info" className="px-3 py-2 fs-6">{item.cantidad_vendida} ud.</Badge>
                                        </td>
                                        <td className="text-end px-4 fw-bold text-success text-nowrap">Bs. {item.ingreso_generado.toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center text-muted py-5">No hay productos vendidos{startDate || endDate ? ' en el rango seleccionado' : ' aún'}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default VentasProducto;
