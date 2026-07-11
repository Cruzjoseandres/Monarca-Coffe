import { useState, useEffect } from 'react';
import { getRendimientoPersonal, getPedidosMeseroRendimiento } from '../../../../../services/ReporteService';

export const useRendimientoPersonal = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const [pedidosMesero, setPedidosMesero] = useState([]);
    const [loadingPedidos, setLoadingPedidos] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedMesero, setSelectedMesero] = useState(null);

    const fetchData = async (startDate, endDate) => {
        try {
            setLoading(true);
            const result = await getRendimientoPersonal(startDate, endDate);
            setData(result);
            setStartDateFilter(startDate);
            setEndDateFilter(endDate);
        } catch (err) {
            setError('Error al obtener el rendimiento del personal');
        } finally {
            setLoading(false);
        }
    };

    const fetchPedidosMesero = async (usuarioId, meseroNombre) => {
        try {
            setLoadingPedidos(true);
            setSelectedMesero(meseroNombre);
            const result = await getPedidosMeseroRendimiento(usuarioId, startDateFilter, endDateFilter);
            setPedidosMesero(result);
            setShowModal(true);
        } catch (err) {
            setError('Error al obtener los pedidos del mesero');
        } finally {
            setLoadingPedidos(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setPedidosMesero([]);
        setSelectedMesero(null);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { 
        data, loading, error, fetchData,
        pedidosMesero, loadingPedidos, showModal, selectedMesero,
        fetchPedidosMesero, closeModal
    };
};
