import { useState, useEffect, useCallback } from 'react';
import { getAllCategorias, createCategoria, updateCategoria, deleteCategoria } from '../../../../services/CategoriaService';
import { useNotification } from '../../../../hooks/useNotification';
import { usePagination } from '../../../hooks/usePagination';

export const useAdminCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('crear');
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({ nombre: '' });
    const [validated, setValidated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast, confirm, showSuccess, showError, hideToast, showConfirm } = useNotification();

    const loadCategorias = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllCategorias();
            setCategorias(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar categorías:', err);
            setError('Error al cargar las categorías');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategorias();
    }, [loadCategorias]);

    const pagination = usePagination(categorias, 10);

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        if (item) {
            setSelectedItem(item);
            setFormData({ nombre: item.nombre });
        } else {
            setSelectedItem(null);
            setFormData({ nombre: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setModalType('crear');
        setFormData({ nombre: '' });
        setValidated(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
            if (modalType === 'editar') {
                await updateCategoria(selectedItem.id, formData);
                showSuccess('Categoría actualizada exitosamente');
            } else {
                await createCategoria(formData);
                showSuccess('Categoría creada exitosamente');
            }
            handleCloseModal();
            loadCategorias();
        } catch (err) {
            console.error('Error:', err);
            showError(err.response?.data?.message || 'Error al guardar la categoría');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('¿Estás seguro de eliminar esta categoría?');
        if (confirmed) {
            try {
                await deleteCategoria(id);
                showSuccess('Categoría eliminada exitosamente');
                loadCategorias();
            } catch (err) {
                console.error('Error al eliminar:', err);
                showError('Error al eliminar la categoría');
            }
        }
    };

    return {
        categorias, loading, error, showModal, modalType, formData, validated, isSubmitting,
        handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete,
        toast, confirm, hideToast, pagination
    };
};
