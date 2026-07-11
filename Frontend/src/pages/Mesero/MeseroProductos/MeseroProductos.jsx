import { Container, Card, Badge, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import { useMeseroProductos } from './useMeseroProductos';
import './MeseroProductos.css';

const MeseroProductos = () => {
    const { productos, categorias, categoriaFilter, setCategoriaFilter, loading, error } = useMeseroProductos();

    if (loading) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
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
        <Container className="mt-4">
            <div className="mb-4 fade-in">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h1 className="d-flex align-items-center gap-2 mb-0 fs-3 fw-bold">
                        <span className="material-symbols-outlined text-dark">restaurant_menu</span>
                        Menú
                    </h1>
                </div>

                <div className="d-flex align-items-center gap-2 overflow-auto pb-2" style={{ whiteSpace: 'nowrap' }}>
                    <Button
                        size="sm"
                        variant={!categoriaFilter ? "dark" : "outline-secondary"}
                        className="rounded-pill px-3 py-1 fw-medium"
                        onClick={() => setCategoriaFilter('')}
                    >
                        Todas las categorías
                    </Button>
                    {categorias.map((cat) => (
                        <Button
                            key={cat.id}
                            size="sm"
                            variant={parseInt(categoriaFilter) === cat.id ? "dark" : "outline-secondary"}
                            className="rounded-pill px-3 py-1 fw-medium"
                            onClick={() => setCategoriaFilter(parseInt(categoriaFilter) === cat.id ? '' : cat.id.toString())}
                        >
                            {cat.nombre}
                        </Button>
                    ))}
                </div>
            </div>

            <Row className="g-3">
                {productos.map((producto) => (
                    <Col key={producto.id} xs={12} sm={6} md={4} lg={3}>
                        <Card className="border rounded shadow-sm h-100">
                            {producto.imagePaths && producto.imagePaths.length > 0 && (
                                <Card.Img
                                    variant="top"
                                    src={producto.imagePaths[0]}
                                    alt={producto.nombre}
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                            )}
                            <Card.Body className="d-flex flex-column p-3">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                    <h6 className="mb-0 fw-semibold">{producto.nombre}</h6>
                                    <Badge bg={producto.disponible ? 'dark' : 'secondary'} className="fw-normal">
                                        {producto.disponible ? 'Disponible' : 'Agotado'}
                                    </Badge>
                                </div>
                                <small className="text-muted mb-2">
                                    {producto.categoria?.nombre || 'Sin categoría'}
                                </small>
                                {producto.descripcion && (
                                    <p className="text-muted small mb-3 flex-grow-1">{producto.descripcion}</p>
                                )}
                                <div className="fw-semibold text-dark fs-6 mt-auto">
                                    Bs. {parseFloat(producto.precio).toFixed(2)}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {productos.length === 0 && (
                <Alert variant="warning" className="text-center fade-in d-flex flex-column align-items-center py-5">
                    <span className="material-symbols-outlined mb-2" style={{ fontSize: '3rem', color: 'var(--warning-color)' }}>search_off</span>
                    <h5>No hay productos disponibles</h5>
                    <p className="mb-0 text-muted-custom">Prueba seleccionando otra categoría</p>
                </Alert>
            )}
        </Container>
    );
};

export default MeseroProductos;
