import React from 'react';
import { Container, Table, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { useAdminCategorias } from './useAdminCategorias';
import NotificationToast from '../../../components/NotificationToast';
import ConfirmModal from '../../../components/ConfirmModal';
import PaginationBar from '../../../components/PaginationBar';

const AdminCategorias = () => {
    const {
        categorias, loading, error, showModal, modalType, formData, validated, isSubmitting,
        handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete,
        toast, confirm, hideToast, pagination
    } = useAdminCategorias();

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

    return (
        <Container fluid className="px-0">
            <NotificationToast show={toast.show} message={toast.message} variant={toast.variant} onClose={hideToast} />
            <ConfirmModal show={confirm.show} message={confirm.message} onConfirm={confirm.onConfirm} />

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h1 className="admin-title-lg">Gestión de Categorías</h1>
                    <p className="admin-subtitle m-0">Organiza la estructura del menú de tu cafetería.</p>
                </div>
                <button className="btn-admin-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal('crear')}>
                    <span className="material-symbols-outlined fs-5">add_circle</span>
                    <span>Nueva Categoría</span>
                </button>
            </div>

            {/* Table */}
            <div className="admin-card border-0 shadow-sm p-0 overflow-hidden">
                <Table hover responsive className="custom-table m-0 align-middle">
                    <thead className="bg-light text-nowrap">
                        <tr>
                            <th className="px-4 py-3">NOMBRE CATEGORÍA</th>
                            <th className="py-3">FECHA CREACIÓN</th>
                            <th className="text-end px-4 py-3">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.paginatedData.map((cat) => (
                            <tr key={cat.id}>
                                <td className="px-3 py-3 fw-bold" style={{ minWidth: '110px', color: 'var(--admin-text-main)' }}>
                                    <span className="material-symbols-outlined align-middle" style={{ marginRight: '8px', color: 'var(--admin-accent)', fontSize: '1.2rem' }}>local_cafe</span>
                                    {cat.nombre}
                                </td>
                                <td className="py-3 text-nowrap">
                                    {new Date(cat.created_at).toLocaleDateString()}
                                </td>
                                <td className="text-end px-2 py-3 text-nowrap">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <button
                                            className="btn-admin-secondary d-flex align-items-center gap-1"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                            onClick={() => handleOpenModal('editar', cat)}
                                            title="Editar categoría"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>edit_square</span>
                                            <span className="d-none d-lg-inline">Editar</span>
                                        </button>
                                        <button
                                            className="btn-admin-secondary d-flex align-items-center gap-1"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px', color: 'var(--neon-danger)', borderColor: 'rgba(220,53,69,0.2)' }}
                                            onClick={() => handleDelete(cat.id)}
                                            title="Eliminar categoría"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>delete</span>
                                            <span className="d-none d-lg-inline">Eliminar</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pagination.totalItems === 0 && (
                            <tr>
                                <td colSpan="3" className="text-center py-5 text-muted">
                                    No hay categorías registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            <PaginationBar {...pagination} />

            {/* Create / Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} contentClassName="admin-card border-0 shadow-lg" backdropClassName="admin-modal-backdrop" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(180,66,10,0.12)', background: 'var(--admin-panel-bg)', padding: '1.25rem 1.5rem' }}>
                    <Modal.Title className="admin-title-lg d-flex align-items-center gap-2 m-0" style={{ fontSize: '1.2rem' }}>
                        <span className="material-symbols-outlined text-primary">{modalType === 'crear' ? 'add_circle' : 'edit_square'}</span>
                        <span>{modalType === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'}</span>
                    </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body style={{ background: 'var(--admin-panel-bg)', padding: '1.5rem' }}>
                        <Form.Group className="admin-form-group mb-0">
                            <Form.Label className="admin-form-label">Nombre de la Categoría *</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className="admin-form-control"
                                placeholder="Ej. Especiales de Temporada"
                                required
                            />
                            <Form.Control.Feedback type="invalid">El nombre de la categoría es obligatorio.</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: '1px solid rgba(180,66,10,0.12)', background: 'var(--admin-panel-bg)', padding: '1rem 1.5rem' }}>
                        <button type="button" className="btn-admin-secondary px-4" onClick={handleCloseModal}>Cancelar</button>
                        <button type="submit" className="btn-admin-primary px-4 d-flex align-items-center gap-2" disabled={isSubmitting}>
                            <span className="material-symbols-outlined fs-6">save</span>
                            <span>{isSubmitting ? 'Guardando...' : (modalType === 'editar' ? 'Guardar Cambios' : 'Crear Categoría')}</span>
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminCategorias;
