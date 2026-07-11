import { useState, useEffect, useCallback } from 'react';
import { getAllProductos } from '../../../../services/ProductoService';
import { getAllCategorias } from '../../../../services/CategoriaService';

export const useMeseroProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaFilter, setCategoriaFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [prodData, catData] = await Promise.all([
                getAllProductos(),
                getAllCategorias()
            ]);
            setProductos(prodData);
            setCategorias(catData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar datos:', err);
            setError('Error al cargar los productos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredProductos = categoriaFilter
        ? productos.filter(p => p.categoria?.id === parseInt(categoriaFilter))
        : productos;

    return { productos: filteredProductos, categorias, categoriaFilter, setCategoriaFilter, loading, error };
};
