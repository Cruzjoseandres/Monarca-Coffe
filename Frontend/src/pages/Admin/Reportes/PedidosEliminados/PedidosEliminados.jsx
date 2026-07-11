import React, { useState, useEffect } from 'react';
import { Card, Table, Spinner, Form, InputGroup, Button } from 'react-bootstrap';
import { getPedidosEliminados } from '../../../../../services/ReporteService';

const PedidosEliminados = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchPedidos = async (start = null, end = null) => {
        try {
            setLoading(true);
            const data = await getPedidosEliminados(start, end);
            setPedidos(data);
        } catch (error) {
            console.error("Error cargando pedidos eliminados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleFilter = () => fetchPedidos(startDate || null, endDate || null);
    const handleClear = () => { setStartDate(''); setEndDate(''); fetchPedidos(null, null); };

    const filteredPedidos = pedidos.filter(p => 
        p.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.id.toString().includes(searchTerm) ||
        p.justificativo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h4 className="m-0 fw-bold d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined text-danger">delete_history</span>
                            Auditoría: Pedidos Eliminados
                        </h4>
                        <p className="text-muted m-0 mt-1 small">
                            Listado histórico de pedidos cancelados o eliminados y sus justificaciones.
                        </p>
                    </div>
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
                        <InputGroup style={{ minWidth: '220px' }}>
                            <InputGroup.Text className="bg-light border-end-0">
                                <span className="material-symbols-outlined fs-5">search</span>
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por ID, mesero..."
                                className="bg-light border-start-0"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </div>
                </Card.Header>
                
                <Card.Body className="p-0">
                    <Table hover responsive className="mb-0 align-middle">
                        <thead className="bg-light text-nowrap">
                            <tr>
                                <th className="px-4 py-3">ID Pedido</th>
                                <th className="py-3">Fecha Eliminación</th>
                                <th className="py-3">Mesero / Responsable</th>
                                <th className="px-4 py-3">Justificativo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPedidos.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <div className="d-flex flex-column align-items-center">
                                            <span className="material-symbols-outlined mb-2" style={{ fontSize: '3rem', opacity: 0.5 }}>search_off</span>
                                            O no se encontraron pedidos o nadie ha eliminado pedidos aún.
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPedidos.map((pedido) => (
                                    <tr key={pedido.id}>
                                        <td className="px-4 fw-bold text-nowrap">#{pedido.id}</td>
                                        <td className="text-nowrap">
                                            <div className="d-flex align-items-center gap-2 text-muted">
                                                <span className="material-symbols-outlined fs-6">calendar_today</span>
                                                {new Date(pedido.fecha).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="text-nowrap">
                                            <div className="d-flex align-items-center gap-2 fw-medium">
                                                <span className="material-symbols-outlined fs-5 text-primary">person</span>
                                                {pedido.responsable}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3" style={{ minWidth: '220px' }}>
                                            <div className="px-3 py-2 bg-danger bg-opacity-10 text-danger rounded d-inline-block w-100">
                                                <span className="fw-bold d-block mb-1" style={{ fontSize: '0.8rem' }}>Motivo Registrado:</span>
                                                {pedido.justificativo}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default PedidosEliminados;
