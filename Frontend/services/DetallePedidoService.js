

import apiClient from "./apiClient";
import { getAccessToken } from "../utils/TokenUtilities";

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${getAccessToken()}` }
});

const createDetalle = async (data) => {
    try {
        const response = await apiClient.post(`/detalle-pedido`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const createBulkDetalles = async (dataArray) => {
    try {
        const response = await apiClient.post(`/detalle-pedido/bulk`, dataArray);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getDetallesByCuenta = async (idCuenta) => {
    try {
        const response = await apiClient.get(`/detalle-pedido/cuenta/${idCuenta}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updateDetalle = async (id, data) => {
    try {
        const response = await apiClient.patch(`/detalle-pedido/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const bulkUpdateEntrega = async (items) => {
    try {
        const response = await apiClient.patch(`/detalle-pedido/bulk-entrega`, items);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteDetalle = async (id) => {
    try {
        const response = await apiClient.delete(`/detalle-pedido/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export { createDetalle, createBulkDetalles, getDetallesByCuenta, updateDetalle, bulkUpdateEntrega, deleteDetalle };
