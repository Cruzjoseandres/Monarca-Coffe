import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllProductos, createProducto, updateProducto, deleteProducto } from '../../../../services/ProductoService';
import { getAllCategorias } from '../../../../services/CategoriaService';
import { useNotification } from '../../../../hooks/useNotification';
import { usePagination } from '../../../hooks/usePagination';

export const useAdminProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('crear');
    const [selectedItem, setSelectedItem] = useState(null);
    const [newImageFiles, setNewImageFiles] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // URLs from server
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        descripcion: '',
        disponible: true,
        id_categoria: '',
    });
    const [validated, setValidated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inventory filters
    const [busqueda, setBusqueda] = useState('');
    const [filtroCategoria, setFiltroCategoria] = useState('');
    const [filtroDisponible, setFiltroDisponible] = useState('');

    const { toast, confirm, showSuccess, showError, hideToast, showConfirm } = useNotification();

    const loadProductos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getAllProductos();
            setProductos(data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar productos:', err);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCategorias = useCallback(async () => {
        try {
            const data = await getAllCategorias();
            setCategorias(data);
        } catch (err) {
            console.error('Error al cargar categorías:', err);
        }
    }, []);

    useEffect(() => {
        loadProductos();
        loadCategorias();
    }, [loadProductos, loadCategorias]);

    const productosFiltrados = useMemo(() => {
        return productos.filter(p => {
            const matchBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
            const matchCategoria = !filtroCategoria || String(p.categoria?.id) === filtroCategoria;
            const matchDisponible = filtroDisponible === '' ? true
                : filtroDisponible === 'true' ? p.disponible : !p.disponible;
            return matchBusqueda && matchCategoria && matchDisponible;
        });
    }, [productos, busqueda, filtroCategoria, filtroDisponible]);

    const pagination = usePagination(productosFiltrados, 10);

    const handleOpenModal = (type, item = null) => {
        setModalType(type);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        if (item) {
            setSelectedItem(item);
            setFormData({
                nombre: item.nombre,
                precio: item.precio,
                descripcion: item.descripcion || '',
                disponible: item.disponible,
                id_categoria: item.categoria?.id || '',
            });
            setExistingImages(item.imagePaths || []);
        } else {
            setSelectedItem(null);
            setFormData({ nombre: '', precio: '', descripcion: '', disponible: true, id_categoria: '' });
            setExistingImages([]);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
        setNewImageFiles([]);
        setNewImagePreviews([]);
        setExistingImages([]);
        setValidated(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddImages = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setNewImageFiles(prev => [...prev, ...files]);
            files.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewImagePreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
        // Reset the input so the same file can be selected again
        e.target.value = '';
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewImage = (index) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
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
            const data = new FormData();
            data.append('nombre', formData.nombre);
            data.append('precio', formData.precio);
            data.append('descripcion', formData.descripcion);
            data.append('disponible', formData.disponible);
            data.append('id_categoria', formData.id_categoria);

            if (modalType === 'editar') {
                // Send the existing images that should be kept
                data.append('imagePaths', JSON.stringify(existingImages));
            }

            if (newImageFiles.length > 0) {
                newImageFiles.forEach((file) => {
                    data.append('imagenes', file);
                });
            }

            if (modalType === 'editar') {
                await updateProducto(selectedItem.id, data);
                showSuccess('Producto actualizado exitosamente');
            } else {
                await createProducto(data);
                showSuccess('Producto creado exitosamente');
            }
            handleCloseModal();
            loadProductos();
        } catch (err) {
            console.error('Error:', err);
            showError(err.response?.data?.message || 'Error al guardar el producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = await showConfirm('¿Estás seguro de eliminar este producto?');
        if (confirmed) {
            try {
                await deleteProducto(id);
                showSuccess('Producto eliminado exitosamente');
                loadProductos();
            } catch (err) {
                console.error('Error al eliminar:', err);
                showError('Error al eliminar el producto');
            }
        }
    };

    return {
        productos, categorias, loading, error, showModal, modalType, formData, validated, isSubmitting,
        handleOpenModal, handleCloseModal, handleChange, handleSubmit, handleDelete,
        toast, confirm, hideToast,
        existingImages, newImagePreviews, handleAddImages,
        handleRemoveExistingImage, handleRemoveNewImage,
        busqueda, setBusqueda,
        filtroCategoria, setFiltroCategoria,
        filtroDisponible, setFiltroDisponible,
        productosFiltrados,
        pagination,
    };
};
