import { useState, useEffect, useCallback } from 'react';
import { getAllUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../../../services/UsuarioService';
import { getAllRoles } from '../../../../services/RolService';
import { useNotification } from '../../../../hooks/useNotification';
import { usePagination } from '../../../hooks/usePagination';

export const useAdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('crear');
    const [selectedUser, setSelectedUser] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        id_rol: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast, confirm, showSuccess, showError, hideToast, showConfirm } = useNotification();

    const loadUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllUsuarios();
            setUsuarios(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
            setError('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadRoles = useCallback(async () => {
        try {
            const data = await getAllRoles();
            setRoles(data);
        } catch (err) {
            console.error('Error al cargar roles:', err);
        }
    }, []);

    useEffect(() => {
        loadUsuarios();
        loadRoles();
    }, [loadUsuarios, loadRoles]);

    const pagination = usePagination(usuarios, 10);

    const handleOpenModal = (type, user = null) => {
        setModalType(type);
        if (user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                password: '',
                nombre: user.persona?.nombre || '',
                apellido: user.persona?.apellido || '',
                telefono: user.persona?.telefono || '',
                email: user.persona?.email || '',
                id_rol: user.rol?.id || '',
            });
        } else {
            setSelectedUser(null);
            setFormData({
                username: '',
                password: '',
                nombre: '',
                apellido: '',
                telefono: '',
                email: '',
                id_rol: '',
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setModalType('crear');
        setValidated(false);
        setFormData({
            username: '',
            password: '',
            nombre: '',
            apellido: '',
            telefono: '',
            email: '',
            id_rol: '',
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.currentTarget;
        if (form.checkValidity() === false) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setValidated(true);
        setIsSubmitting(true);

        try {
            const payload = {
                username: formData.username,
                nombre: formData.nombre,
                apellido: formData.apellido,
                telefono: formData.telefono,
                email: formData.email,
                id_rol: parseInt(formData.id_rol),
            };

            if (modalType === 'editar') {
                if (formData.password) {
                    payload.password = formData.password;
                }
                await updateUsuario(selectedUser.id, payload);
                showSuccess('Usuario actualizado exitosamente');
            } else {
                payload.password = formData.password;
                await createUsuario(payload);
                showSuccess('Usuario creado exitosamente');
            }
            handleCloseModal();
            loadUsuarios();
        } catch (err) {
            console.error('Error:', err);
            showError(err.response?.data?.message || 'Error al guardar el usuario');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('¿Estás seguro de eliminar este usuario?');
        if (confirmed) {
            try {
                await deleteUsuario(id);
                showSuccess('Usuario eliminado exitosamente');
                loadUsuarios();
            } catch (err) {
                console.error('Error al eliminar:', err);
                showError('Error al eliminar el usuario');
            }
        }
    };

    const getRoleBadge = (rolNombre) => {
        const variants = {
            ADMINISTRADOR: 'danger',
            MESERO: 'primary',
        };
        return variants[rolNombre] || 'secondary';
    };

    return {
        usuarios, roles, loading, error, showModal, modalType, formData, selectedUser, validated, isSubmitting,
        handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete, getRoleBadge,
        toast, confirm, hideToast, pagination
    };
};
