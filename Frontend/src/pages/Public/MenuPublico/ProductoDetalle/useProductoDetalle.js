import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductoPublicoById } from '../../../../../services/PublicService';

export const useProductoDetalle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducto = async () => {
            try {
                setLoading(true);
                const data = await getProductoPublicoById(id);
                setProducto(data);
                setError(null);
            } catch (err) {
                console.error('Error al cargar producto:', err);
                setError('No se pudo cargar la información del producto.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProducto();
        }
    }, [id]);

    const handleBack = () => {
        const basePath = window.location.pathname.startsWith('/admin') ? '/admin' : '';
        navigate(`${basePath}/menu`);
    };

    return {
        producto,
        loading,
        error,
        handleBack
    };
};
