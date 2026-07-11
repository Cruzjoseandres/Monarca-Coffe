

import apiClient from "./apiClient";
import { getAccessToken } from "../utils/TokenUtilities";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const getAllProductos = async () => {
    try {
        const response = await apiClient.get(`/producto`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getProductoById = async (id) => {
    try {
        const response = await apiClient.get(`/producto/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createProducto = async (formData) => {
    const token = getAccessToken();
    try {
        const response = await apiClient.post(`/producto`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateProducto = async (id, formData) => {
    const token = getAccessToken();
    try {
        const response = await apiClient.patch(`/producto/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteProducto = async (id) => {
    try {
        const response = await apiClient.delete(`/producto/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteProductoImage = async (id, imageUrl) => {
    const token = getAccessToken();
    try {
        const response = await apiClient.delete(`/producto/${id}/imagen`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { imageUrl }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getAllProductos, getProductoById, createProducto, updateProducto, deleteProducto, deleteProductoImage };
