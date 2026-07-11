import { Container, Spinner, Alert, Carousel } from 'react-bootstrap';
import { useProductoDetalle } from './useProductoDetalle';
import './ProductoDetalle.css';

const ProductoDetalle = () => {
    const { producto, loading, error, handleBack } = useProductoDetalle();

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
                <Spinner animation="grow" variant="primary" />
                <p className="mt-3 text-muted fw-500">Cargando experiencia...</p>
            </div>
        );
    }

    if (error || !producto) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center py-5 border-0 shadow-sm rounded-4">
                    <span className="material-symbols-outlined d-block mb-3" style={{ fontSize: '4rem', opacity: 0.5 }}>error</span>
                    <h3 className="fw-bold">No pudimos encontrar el producto</h3>
                    <p className="text-muted mb-4">{error || 'El producto solicitado no está disponible.'}</p>
                    <button className="btn btn-primary px-4 py-2 rounded-pill fw-bold" onClick={handleBack}>
                        Volver al menú
                    </button>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="producto-detalle-page fade-in">
            <Container fluid className="px-0 px-lg-4">
                <div className="producto-detalle-main-card">
                    
                    {/* Sección de Imagen (Izquierda en Laptop, Arriba en Móvil) */}
                    <div className="detalle-media-section">
                        <button className="detalle-back-floating" onClick={handleBack} aria-label="Atrás">
                            <span className="material-symbols-outlined">west</span>
                        </button>

                        {producto.imagePaths && producto.imagePaths.length > 0 ? (
                            <Carousel interval={null} indicators={producto.imagePaths.length > 1} className="h-100 shadow-lg">
                                {producto.imagePaths.map((src, idx) => (
                                    <Carousel.Item key={idx} className="h-100">
                                        <img
                                            className="detalle-img-hero"
                                            src={src}
                                            alt={producto.nombre}
                                        />
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div className="detalle-no-img">
                                <span className="material-symbols-outlined">image_not_supported</span>
                                <p>Sin imagen</p>
                            </div>
                        )}
                    </div>

                    {/* Sección de Información (Derecha en Laptop, Abajo en Móvil) */}
                    <div className="detalle-info-section">
                        <h1 className="detalle-product-title">
                            <span className="detalle-category-label">
                                {producto.categoria?.nombre || 'General'}
                            </span>
                            {producto.nombre}
                        </h1>

                        <div className="detalle-price-tag mb-4">
                            <span className="currency">Bs</span>
                            <span className="amount">{parseFloat(producto.precio).toFixed(0)}</span>
                            <span className="unit">/ unidad</span>
                        </div>

                        <div className="detalle-description-block">
                            <h5 className="detalle-section-label">
                                <span className="material-symbols-outlined">notes</span>
                                Descripción completa
                            </h5>
                            <p className="detalle-description-text">
                                {producto.descripcion || 'Este producto es parte de nuestra selección exclusiva. Pregunta por más detalles en caja.'}
                            </p>
                        </div>

                        <div className="detalle-footer-tranquilo">
                            <p className="mensaje-bonito">
                                Hecho con amor para endulzar tu día.
                            </p>
                        </div>
                    </div>

                </div>
            </Container>
        </div>
    );
};

export default ProductoDetalle;
