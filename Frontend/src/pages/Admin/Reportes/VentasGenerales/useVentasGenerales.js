import { useState, useEffect } from 'react';
import { getVentasGenerales } from '../../../../../services/ReporteService';
import { usePagination } from '../../../../hooks/usePagination';

export const useVentasGenerales = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (startDate = null, endDate = null) => {
        try {
            setLoading(true);
            const result = await getVentasGenerales(startDate, endDate);
            setData(result);
        } catch (err) {
            setError('Error al obtener ventas generales');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const totalIngresos = data.reduce((sum, item) => sum + item.total_ventas, 0);
    const totalEfectivo = data.reduce((sum, item) => sum + (item.total_efectivo || 0), 0);
    const totalQr = data.reduce((sum, item) => sum + (item.total_qr || 0), 0);
    const pagination = usePagination(data, 15, 'ventas-generales');

    return { data, loading, error, totalIngresos, totalEfectivo, totalQr, pagination, fetchData };
};
