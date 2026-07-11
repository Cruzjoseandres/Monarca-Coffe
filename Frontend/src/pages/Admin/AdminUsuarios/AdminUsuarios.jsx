import React, { useState } from 'react';
import { Container, Table, Form, Spinner, Alert, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useAdminUsuarios } from './useAdminUsuarios';
import NotificationToast from '../../../components/NotificationToast';
import ConfirmModal from '../../../components/ConfirmModal';
import PaginationBar from '../../../components/PaginationBar';
import './AdminUsuarios.css';

const getRolColor = (rolNombre) => {
    if (!rolNombre) return 'var(--admin-text-muted)';
    if (rolNombre === 'ADMINISTRADOR') return '#e84393';
    if (rolNombre === 'MESERO') return '#4dabf7';
    return 'var(--admin-accent)';
};

const AdminUsuarios = () => {
    const [showPassword, setShowPassword] = useState(false);

    const {
        usuarios,
        roles,
        loading,
        error,
        showModal,
        modalType,
        formData,
        handleOpenModal,
        handleCloseModal,
        handleChange,
        handleSubmit,
        handleDelete,
        toast,
        confirm,
        hideToast,
        validated,
        pagination,
        isSubmitting,
    } = useAdminUsuarios();

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
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div>
                    <h1 className="admin-title-lg">Gestión de Personal</h1>
                    <p className="admin-subtitle m-0">Administra los usuarios y roles del sistema.</p>
                </div>
                <button className="btn-admin-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => handleOpenModal('crear')}>
                    <span className="material-symbols-outlined fs-5">person_add</span>
                    <span>Añadir Personal</span>
                </button>
            </div>

            {/* Table */}
            <div className="admin-card border-0 shadow-sm p-0 overflow-hidden">
                <Table hover responsive className="custom-table m-0 align-middle">
                    <thead className="bg-light text-nowrap">
                        <tr>
                            <th className="px-4 py-3">PERSONAL</th>
                            <th className="py-3">USUARIO</th>
                            <th className="py-3">ROL</th>
                            <th className="py-3">CORREO</th>
                            <th className="py-3">TELÉFONO</th>
                            <th className="text-end px-4 py-3">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagination.paginatedData.map((usuario) => (
                            <tr key={usuario.id}>
                                <td className="px-4 py-3 text-nowrap" style={{ verticalAlign: 'middle' }}>
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--admin-accent), #4dabf7)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, color: '#fff', fontSize: '0.85rem', flexShrink: 0,
                                        }}>
                                            {(usuario.persona?.nombre?.charAt(0) || usuario.username.charAt(0)).toUpperCase()}
                                            {usuario.persona?.apellido?.charAt(0) || ''}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--admin-text-main)' }}>
                                                {usuario.persona?.nombre || usuario.username} {usuario.persona?.apellido || ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 text-nowrap" style={{ verticalAlign: 'middle', color: 'var(--admin-text-muted)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                                    @{usuario.username}
                                </td>
                                <td className="py-3 text-nowrap" style={{ verticalAlign: 'middle' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem',
                                        fontWeight: 700, letterSpacing: '0.03em',
                                        color: getRolColor(usuario.rol?.nombre),
                                        background: `${getRolColor(usuario.rol?.nombre)}18`,
                                        border: `1px solid ${getRolColor(usuario.rol?.nombre)}40`,
                                    }}>
                                        {usuario.rol?.nombre || '—'}
                                    </span>
                                </td>
                                <td className="py-3" style={{ verticalAlign: 'middle', fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
                                    {usuario.persona?.email || '—'}
                                </td>
                                <td className="py-3 text-nowrap" style={{ verticalAlign: 'middle', fontSize: '0.88rem', color: 'var(--admin-text-muted)' }}>
                                    {usuario.persona?.telefono || '—'}
                                </td>
                                <td className="text-end px-2 py-3 text-nowrap">
                                    <div className="d-flex gap-1 justify-content-end">
                                        <button
                                            className="btn-admin-secondary d-flex align-items-center gap-1"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px' }}
                                            onClick={() => handleOpenModal('editar', usuario)}
                                            title="Editar usuario"
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>edit_square</span>
                                            <span className="d-none d-lg-inline">Editar</span>
                                        </button>
                                        <button
                                            className="btn-admin-secondary d-flex align-items-center gap-1"
                                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', borderRadius: '8px', color: 'var(--neon-danger)', borderColor: 'rgba(220,53,69,0.2)' }}
                                            onClick={() => handleDelete(usuario.id)}
                                            title="Eliminar usuario"
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
                                <td colSpan="6" className="text-center py-5 text-muted">No hay personal registrado.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
            <PaginationBar {...pagination} />

            {/* Create / Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg" contentClassName="admin-card border-0 shadow-lg" backdropClassName="admin-modal-backdrop" centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid rgba(180,66,10,0.12)', background: 'var(--admin-panel-bg)', padding: '1.25rem 1.5rem' }}>
                    <Modal.Title className="admin-title-lg d-flex align-items-center gap-2 m-0" style={{ fontSize: '1.2rem' }}>
                        <span className="material-symbols-outlined text-primary">{modalType === 'crear' ? 'person_add' : 'manage_accounts'}</span>
                        <span>{modalType === 'crear' ? 'Registrar Nuevo Personal' : 'Editar Miembro de Personal'}</span>
                    </Modal.Title>
                </Modal.Header>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Modal.Body style={{ background: 'var(--admin-panel-bg)', padding: '1.5rem' }}>
                        {/* Personal Info */}
                        <h6 className="mb-3 d-flex align-items-center gap-2" style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>badge</span> Información Personal
                        </h6>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Nombre *</Form.Label>
                                    <Form.Control type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="admin-form-control" placeholder="Ej. Ana" required />
                                    <Form.Control.Feedback type="invalid">El nombre es obligatorio.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Apellido *</Form.Label>
                                    <Form.Control type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="admin-form-control" placeholder="Ej. García" required />
                                    <Form.Control.Feedback type="invalid">El apellido es obligatorio.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Correo Electrónico</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} className="admin-form-control" placeholder="ana@cafe.com" />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Teléfono</Form.Label>
                                    <Form.Control type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="admin-form-control" placeholder="+591 77777777" />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Role & Security */}
                        <h6 className="mb-3 d-flex align-items-center gap-2" style={{ fontWeight: 600, color: 'var(--admin-accent)', borderTop: '1px solid var(--admin-border)', paddingTop: '1rem' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>shield_person</span> Rol y Seguridad
                        </h6>
                        <Row>
                            <Col md={4}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Rol *</Form.Label>
                                    <Form.Select name="id_rol" value={formData.id_rol} onChange={handleChange} className="admin-form-control" required>
                                        <option value="">Selecciona un rol...</option>
                                        {roles.map((rol) => (
                                            <option key={rol.id} value={rol.id}>{rol.nombre}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">Debe seleccionar un rol.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">Usuario *</Form.Label>
                                    <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} className="admin-form-control" placeholder="anagarcia" required />
                                    <Form.Control.Feedback type="invalid">El usuario es requerido.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="admin-form-group">
                                    <Form.Label className="admin-form-label">
                                        {modalType === 'editar' ? 'Nueva Contraseña (Opc.)' : 'Contraseña *'}
                                    </Form.Label>
                                    <div style={{ position: 'relative' }}>
                                        <Form.Control
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="admin-form-control"
                                            placeholder="••••••••"
                                            required={modalType === 'crear'}
                                            style={{ paddingRight: '40px' }}
                                        />
                                        <span
                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', cursor: 'pointer' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </span>
                                    </div>
                                    <Form.Control.Feedback type="invalid">La contraseña es obligatoria.</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer style={{ background: 'var(--admin-panel-bg)', borderTop: '1px solid var(--admin-border)' }}>
                        <button type="button" className="btn-admin-secondary" onClick={handleCloseModal}>Cancelar</button>
                        <button type="submit" className="btn-admin-primary d-flex align-items-center gap-1" disabled={isSubmitting}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                                {modalType === 'editar' ? 'save' : 'person_add'}
                            </span>
                            {isSubmitting ? 'Guardando...' : (modalType === 'editar' ? 'Guardar Cambios' : 'Crear Cuenta')}
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default AdminUsuarios;
