import { useState, useEffect } from 'react';
import { getVentasProducto } from '../../../../../services/ReporteService';

export const useVentasProducto = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (startDate = null, endDate = null) => {
        try {
            setLoading(true);
            const result = await getVentasProducto(startDate, endDate);
            setData(result);
        } catch (err) {
            setError('Error al obtener ventas por producto');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, fetchData };
};
