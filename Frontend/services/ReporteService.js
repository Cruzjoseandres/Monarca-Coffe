

import apiClient from "./apiClient";
import { API_URL } from "./config";
import { getAccessToken } from "../utils/TokenUtilities";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const getVentasGenerales = async (startDate = null, endDate = null) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get(`/reporte/ventas-generales`, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getVentasProducto = async (startDate = null, endDate = null) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get(`/reporte/ventas-producto`, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getRendimientoPersonal = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await apiClient.get(`/reporte/rendimiento-personal`, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getDashboardKpis = async (startDate, endDate) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const response = await apiClient.get(`/reporte/dashboard-kpis`, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getPedidosEliminados = async (startDate = null, endDate = null) => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const response = await apiClient.get(`/reporte/pedidos-eliminados`, { params });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getPedidosMeseroRendimiento = async (usuarioId, startDate = null, endDate = null) => {
    try {
        let url = `/reporte/rendimiento-personal/${usuarioId}/pedidos`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await apiClient.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching waiter orders for performance:", error);
        throw error;
    }
};

const getActividadReciente = async () => {
    try {
        const response = await apiClient.get(`/reporte/actividad-reciente`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getVentasGenerales, getVentasProducto, getRendimientoPersonal, getDashboardKpis, getPedidosEliminados, getPedidosMeseroRendimiento, getActividadReciente };
export default { getVentasGenerales, getVentasProducto, getRendimientoPersonal, getDashboardKpis, getPedidosEliminados, getPedidosMeseroRendimiento, getActividadReciente };
