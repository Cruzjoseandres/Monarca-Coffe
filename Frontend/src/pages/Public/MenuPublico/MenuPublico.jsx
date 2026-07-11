import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Spinner, Alert, Row, Col, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getMenuPublico, getCategoriasPublicas } from '../../../../services/PublicService';
import { getAccessToken } from '../../../../utils/TokenUtilities';
import './MenuPublico.css';

/* ---------- Main Component ---------- */
const MenuPublico = () => {
    const navigate = useNavigate();
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaFilter, setCategoriaFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = getAccessToken();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodData, catData] = await Promise.all([
                getMenuPublico(),
                getCategoriasPublicas()
            ]);
            setProductos(prodData);
            setCategorias(catData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar menú:', err);
            setError('Error al cargar el menú');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredProductos = categoriaFilter
        ? productos.filter(p => p.categoria?.id === parseInt(categoriaFilter))
        : productos;

    const handleProductClick = (id) => {
        const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
        navigate(`${basePath}/producto/${id}`);
    };

    // Group by category
    const grouped = filteredProductos.reduce((acc, p) => {
        const key = p.categoria?.nombre || 'Sin categoría';
        if (!acc[key]) acc[key] = [];
        acc[key].push(p);
        return acc;
    }, {});

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" style={{ color: 'var(--cafe-primary)' }}>
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
                <p className="mt-3 text-muted">Cargando menú...</p>
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
        <Container className="mt-3 pb-5" style={{ maxWidth: '1400px' }}>

            {/* Header */}
            <div className="menu-publico-header fade-in">
                <h1 className="d-flex justify-content-center align-items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '2rem' }}>coffee</span>
                    Nuestro Menú
                </h1>
                <p>Descubre lo que tenemos preparado para ti hoy</p>
            </div>



            {/* Category Chips */}
            <div className="menu-category-chips fade-in">
                <button
                    className={`menu-chip ${categoriaFilter === '' ? 'active' : ''}`}
                    onClick={() => setCategoriaFilter('')}
                >
                    Todos
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.id}
                        className={`menu-chip ${categoriaFilter === String(cat.id) ? 'active' : ''}`}
                        onClick={() => setCategoriaFilter(String(cat.id))}
                    >
                        {cat.nombre}
                    </button>
                ))}
            </div>

            {/* Products */}
            {Object.keys(grouped).length === 0 ? (
                <Alert variant="warning" className="text-center py-5 fade-in mx-auto" style={{ maxWidth: '400px', borderRadius: '16px' }}>
                    <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '3rem', color: '#ffc107' }}>search_off</span>
                    <h5 style={{ fontWeight: 700 }}>No hay productos disponibles</h5>
                    <p className="mb-0 text-muted">Prueba seleccionando otra categoría</p>
                </Alert>
            ) : (
                Object.entries(grouped).map(([categoria, prods]) => (
                    <div key={categoria} className="mb-5 fade-in">
                        <h2 className="menu-categoria-titulo">{categoria}</h2>
                        {/* 1 col on mobile, 2 col on tablet, 3 col on large desktop */}
                        <Row className="g-3 g-md-4">
                            {prods.map((producto) => (
                                <Col key={producto.id} xs={12} md={6} lg={4}>
                                    <div className="menu-producto-item" onClick={() => handleProductClick(producto.id)}>
                                        <div className="menu-producto-info">
                                            <h5 className="menu-producto-nombre">{producto.nombre}</h5>
                                            {producto.descripcion && (
                                                <p className="menu-producto-desc">{producto.descripcion}</p>
                                            )}
                                            <div className="menu-producto-precio">
                                                Bs {parseFloat(producto.precio).toFixed(0)}
                                            </div>
                                        </div>
                                        <div className="menu-producto-img-wrapper">
                                            {producto.imagePaths && producto.imagePaths.length > 0 ? (
                                                <img src={producto.imagePaths[0]} alt={producto.nombre} className="menu-producto-img" loading="lazy" />
                                            ) : (
                                                <div className="menu-sin-imagen-small">
                                                    <span className="material-symbols-outlined text-muted" style={{ fontSize: '1.5rem', opacity: 0.5 }}>image_not_supported</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                ))
            )}
        </Container>
    );
};

export default MenuPublico;

