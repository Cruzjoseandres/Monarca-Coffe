import React, { useRef } from 'react';
import { Container, Table, Button, Form, Badge, Spinner, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { useAdminProductos } from './useAdminProductos';
import NotificationToast from '../../../components/NotificationToast';
import ConfirmModal from '../../../components/ConfirmModal';
import PaginationBar from '../../../components/PaginationBar';
import './AdminProductos.css';

const AdminProductos = () => {
    const {
        productos, categorias, loading, error, showModal, modalType, formData, validated,
        handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete,
        toast, confirm, hideToast,
        existingImages, newImagePreviews, handleAddImages,
        handleRemoveExistingImage, handleRemoveNewImage,
        busqueda, setBusqueda,
        filtroCategoria, setFiltroCategoria,
        filtroDisponible, setFiltroDisponible,
        pagination, isSubmitting,
    } = useAdminProductos();

    const fileInputRef = useRef(null);

    if (loading) {
        return (
            <Container className="mt-5 text-center px-0">
                <Spinner animation="border" role="status" style={{ color: 'var(--admin-accent)' }}>
                    <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-5 px-0">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    const allPreviews = [
        ...existingImages.map((src, i) => ({ src, type: 'existing', index: i })),
        ...newImagePreviews.map((src, i) => ({ src, type: 'new', index: i })),
    ];

    // If showModal is true, we display the "Create/Edit" full page view instead of a Modal.
    // This perfectly matches the design expectation without altering the useAdminProductos logic.
    if (showModal) {
        return (
            <Container fluid className="px-0">
                <NotificationToast show={toast.show} message={toast.message} variant={toast.variant} onClose={hideToast} />
                <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <button type="button" className="admin-back-btn" onClick={handleCloseModal} title="Volver al listado">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                            <h1 className="admin-title-lg d-flex align-items-center gap-2 m-0">
                                <span className="material-symbols-outlined text-primary">{modalType === 'editar' ? 'edit_square' : 'local_cafe'}</span>
                                <span>{modalType === 'editar' ? 'Editar Producto' : 'Crear Nuevo Producto'}</span>
                            </h1>
                            <p className="admin-subtitle m-0">Añade o edita un artículo en el sistema de inventario de la cafetería.</p>
                        </div>
                    </div>
                </div>

                <div className="admin-card border-0 shadow-sm p-4">
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            <Col md={7}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Nombre del Producto</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className="admin-form-control"
                                        placeholder="e.g., Wrap Picante de Pollo"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">El nombre del producto es obligatorio.</Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Descripción</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="descripcion"
                                        value={formData.descripcion || ''}
                                        onChange={handleChange}
                                        className="admin-form-control"
                                        placeholder="Ingresa los ingredientes, alérgenos, y otros detalles..."
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="admin-form-group">
                                            <Form.Label className="admin-form-label">Precio (Bs.)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                name="precio"
                                                value={formData.precio}
                                                onChange={handleChange}
                                                className="admin-form-control"
                                                placeholder="0.00"
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">Debe ingresar un precio válido.</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        {/* Original didn't have cost/stock fields but it had "disponible" instead. 
                                            To keep it similar, we use category select and disponible switch here */}
                                        <Form.Group className="admin-form-group">
                                            <Form.Label className="admin-form-label">Estado (Disponible)</Form.Label>
                                            <div style={{ paddingTop: '0.5rem' }}>
                                                <Form.Check
                                                    type="switch"
                                                    id="disponible-switch"
                                                    name="disponible"
                                                    label={formData.disponible ? "Disponible para la venta" : "Agotado / No disponible"}
                                                    checked={formData.disponible}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="admin-form-group mt-2">
                                    <Form.Label className="admin-form-label">Categoría</Form.Label>
                                    <Form.Select
                                        name="id_categoria"
                                        value={formData.id_categoria}
                                        onChange={handleChange}
                                        className="admin-form-control"
                                        required
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Por favor seleccione una categoría.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>

                            <Col md={5}>
                                <div className="admin-form-group">
                                    <Form.Label className="admin-form-label">Imagen del Producto (Opcional)</Form.Label>

                                    <div
                                        className="upload-area text-center"
                                        onClick={() => fileInputRef.current.click()}
                                        style={{
                                            border: '2px dashed var(--admin-border)',
                                            borderRadius: '12px',
                                            padding: '2rem 1rem',
                                            cursor: 'pointer',
                                            marginBottom: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--admin-accent)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--admin-border)'}
                                    >
                                        <span className="material-symbols-outlined text-muted mb-1" style={{ fontSize: '2rem' }}>cloud_upload</span>
                                        <div style={{ fontWeight: 600 }}>Haz clic para seleccionar imagen</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>Opcional (SVG, PNG, JPG, WEBP)</div>
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleAddImages}
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                    />

                                    {/* Previews map */}
                                    {allPreviews.length > 0 && (
                                        <div className="producto-previews-gallery mt-3">
                                            {allPreviews.map((item, idx) => (
                                                <div key={idx} className="producto-preview-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--admin-bg)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--admin-border)', width: '100%' }}>
                                                    <img
                                                        src={item.src}
                                                        alt={`Imagen ${idx + 1}`}
                                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Image {idx + 1}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>Uploaded</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            item.type === 'existing'
                                                                ? handleRemoveExistingImage(item.index)
                                                                : handleRemoveNewImage(item.index)
                                                        }}
                                                        style={{ background: 'transparent', border: 'none', color: 'var(--admin-text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                                                        title="Eliminar imagen"
                                                    >🗑️</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <div className="d-flex justify-content-end gap-3 mt-4 pt-3" style={{ borderTop: '1px solid var(--admin-border)' }}>
                            <button type="button" className="btn-admin-secondary" onClick={handleCloseModal}>Cancelar</button>
                            <button type="submit" className="btn-admin-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : (modalType === 'editar' ? 'Guardar Cambios' : 'Guardar Producto')}
                            </button>
                        </div>
                    </Form>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="px-0">
            <NotificationToast show={toast.show} message={toast.message} variant={toast.variant} onClose={hideToast} />
            <ConfirmModal show={confirm.show} message={confirm.message} onConfirm={confirm.onConfirm} />

            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h1 className="admin-title-lg">Gestión de Productos</h1>
                    <p className="admin-subtitle m-0">Administra el inventario de la cafetería.</p>
                </div>
                <button className="btn-admin-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal('crear')}>
                    <span className="material-symbols-outlined fs-5">add_circle</span>
                    <span>Nuevo Producto</span>
                </button>
            </div>

            {/* FILTROS DE BÚSQUEDA */}
            <Row className="mb-3 g-2">
                <Col xs={12} md={5}>
                    <InputGroup>
                        <InputGroup.Text><span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>search</span></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Buscar producto..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </InputGroup>
                </Col>
                <Col xs={6} md={3}>
                    <Form.Select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                        <option value="">Todas las categorías</option>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                    </Form.Select>
                </Col>
                <Col xs={6} md={3}>
                    <Form.Select value={filtroDisponible} onChange={(e) => setFiltroDisponible(e.target.value)}>
                        <option value="">Todos los estados</option>
                        <option value="true">En Stock</option>
                        <option value="false">Agotado</option>
                    </Form.Select>
                </Col>
            </Row>

            <div className="admin-card border-0 shadow-sm p-0 overflow-hidden">
                <Table hover responsive className="custom-table m-0 align-middle">
                    <thead className="bg-light text-nowrap">
                        <tr>
                            <th className="px-4 py-3">IMAGEN</th>
                            <th className="py-3">NOMBRE</th>
                            <th className="py-3">PRECIO</th>
                            <th className="py-3">CATEGORÍA</th>
                            <th className="py-3">ESTADO</th>
                            <th className="text-end px-4 py-3">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.paginatedData.map((producto) => (
                            <tr key={producto.id}>
                                <td className="px-4 py-3">
                                    {producto.imagePaths && producto.imagePaths.length > 0 ? (
                                        <div className="d-flex align-items-center gap-1">
                                            <img
                                                src={producto.imagePaths[0]}
                                                alt={producto.nombre}
                                                className="producto-img-thumb"
                                                style={{ width: '40px', height: '40px', borderRadius: '6px' }}
                                            />
                                            {producto.imagePaths.length > 1 && (
                                                <Badge bg="secondary" className="ms-1">+{producto.imagePaths.length - 1}</Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-center bg-light border rounded" style={{ width: '40px', height: '40px' }} title="Sin imagen">
                                            <span className="material-symbols-outlined text-muted" style={{ fontSize: '1.2rem' }}>image_not_supported</span>
                                        </div>
                                    )}
                                </td>
                                <td className="py-3 fw-bold" style={{ minWidth: '120px', color: 'var(--admin-text-main)' }}>{producto.nombre}</td>
                                <td className="py-3 text-nowrap fw-medium text-success">Bs. {parseFloat(producto.precio).toFixed(2)}</td>
                                <td className="py-3 text-nowrap">{producto.categoria?.nombre || '-'}</td>
                                <td className="py-3 text-nowrap">
                                    {producto.disponible ? (
                                        <span className="admin-badge success">En Stock</span>
                                    ) : (
                                        <span className="admin-badge warning">Agotado</span>
                                    )}
                                </td>
                                <td className="text-end px-2 py-3 text-nowrap">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <button className="btn-admin-secondary d-flex align-items-center gap-1" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px' }} onClick={() => handleOpenModal('editar', producto)} title="Editar producto">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>edit_square</span>
                                            <span className="d-none d-lg-inline">Editar</span>
                                        </button>
                                        <button className="btn-admin-secondary d-flex align-items-center gap-1" style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px', color: 'var(--neon-danger)', borderColor: 'rgba(220,53,69,0.2)' }} onClick={() => handleDelete(producto.id)} title="Eliminar producto">
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>delete</span>
                                            <span className="d-none d-lg-inline">Eliminar</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pagination.totalItems === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-5 text-muted">No se encontraron productos en el inventario.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            <PaginationBar {...pagination} />
        </Container>
    );
};

export default AdminProductos;
