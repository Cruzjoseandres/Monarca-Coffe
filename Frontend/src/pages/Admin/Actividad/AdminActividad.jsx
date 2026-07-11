import React, { useEffect, useState } from 'react';
import { Container, Table, Spinner, Card } from 'react-bootstrap';
import ReporteService from '../../../../services/ReporteService';

const AdminActividad = () => {
    const [actividad, setActividad] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActividad = async () => {
            try {
                const data = await ReporteService.getActividadReciente();
                setActividad(data);
            } catch (error) {
                console.error("Error fetching actividad:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActividad();
    }, []);

    if (loading) {
        return (
            <Container fluid className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    return (
        <Container fluid className="px-0">
            <div className="mb-4">
                <h1 className="admin-title-lg d-flex align-items-center gap-2 m-0">
                    <span className="material-symbols-outlined text-primary">history</span>
                    <span>Registro Completo de Actividad</span>
                </h1>
                <p className="admin-subtitle m-0">Historial detallado de todas las transacciones y movimientos en el sistema.</p>
            </div>
            
            <div className="admin-card border-0 shadow-sm p-0 overflow-hidden">
                <div className="table-responsive">
                    <Table hover className="custom-table mb-0 align-middle">
                        <thead className="bg-light text-nowrap">
                            <tr>
                                <th className="px-4 py-3">ORDER ID</th>
                                <th className="py-3">ARTÍCULOS</th>
                                <th className="text-end py-3">MONTO</th>
                                <th className="text-end px-4 py-3">ESTADO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actividad && actividad.length > 0 ? (
                                actividad.map((order, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 fw-bold text-nowrap text-muted">#{order.id}</td>
                                        <td className="py-3 text-dark" style={{ minWidth: '200px' }}>{order.items}</td>
                                        <td className="text-end py-3 fw-bold text-success text-nowrap">Bs. {parseFloat(order.amount).toFixed(2)}</td>
                                        <td className="text-end px-4 py-3 text-nowrap">
                                            <div className="d-flex flex-column align-items-end">
                                                <span className={`admin-badge ${order.status === 'Completado' ? 'success' : order.status === 'ELIMINADO' ? 'danger' : order.status === 'PENDIENTE' ? 'warning' : 'primary'}`}>
                                                    {order.status}
                                                </span>
                                                {order.status === 'ELIMINADO' && order.justificativo && (
                                                    <small className="text-danger fw-bold mt-1 text-wrap" style={{ fontSize: '0.75rem', maxWidth: '200px' }}>
                                                        Motivo: {order.justificativo}
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-5">No hay actividad registrada</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>
        </Container>
    );
};

export default AdminActividad;
