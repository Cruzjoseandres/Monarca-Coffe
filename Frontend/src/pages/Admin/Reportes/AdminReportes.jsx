import React, { useState } from 'react';
import { Container, ButtonGroup, Button } from 'react-bootstrap';
import VentasGenerales from './VentasGenerales/VentasGenerales';
import VentasProducto from './VentasProducto/VentasProducto';
import RendimientoPersonal from './RendimientoPersonal/RendimientoPersonal';
import PedidosEliminados from './PedidosEliminados/PedidosEliminados';

const AdminReportes = () => {
    const [activeTab, setActiveTab] = useState('generales');

    return (
        <Container fluid className="px-0 admin-reportes-container h-100 d-flex flex-column">
            <div className="pb-3 mb-3 border-bottom" style={{ borderColor: 'rgba(180,66,10,0.12)' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h1 className="admin-title-lg d-flex align-items-center gap-2 m-0">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            <span>Centro de Reportes</span>
                        </h1>
                        <p className="admin-subtitle mt-1 mb-0">
                            Visualiza y exporta métricas de ventas, inventario y personal.
                        </p>
                    </div>
                </div>

                <div className="w-100 mt-2">
                    <div className="reportes-tabs-grid">
                        <button
                            type="button"
                            className={`report-tab-btn ${activeTab === 'generales' ? 'active' : ''}`}
                            onClick={() => setActiveTab('generales')}
                        >
                            <span className="material-symbols-outlined">insights</span>
                            <span>Ventas Generales</span>
                        </button>
                        <button
                            type="button"
                            className={`report-tab-btn ${activeTab === 'productos' ? 'active' : ''}`}
                            onClick={() => setActiveTab('productos')}
                        >
                            <span className="material-symbols-outlined">local_cafe</span>
                            <span>Ventas por Producto</span>
                        </button>
                        <button
                            type="button"
                            className={`report-tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <span>Rendimiento Personal</span>
                        </button>
                        <button
                            type="button"
                            className={`report-tab-btn ${activeTab === 'eliminados' ? 'active' : ''}`}
                            onClick={() => setActiveTab('eliminados')}
                        >
                            <span className="material-symbols-outlined">delete_history</span>
                            <span>Pedidos Eliminados</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow-1 p-2 p-md-4" style={{ overflowY: 'auto' }}>
                {activeTab === 'generales' && <VentasGenerales />}
                {activeTab === 'productos' && <VentasProducto />}
                {activeTab === 'personal' && <RendimientoPersonal />}
                {activeTab === 'eliminados' && <PedidosEliminados />}
            </div>
        </Container>
    );
};

export default AdminReportes;
