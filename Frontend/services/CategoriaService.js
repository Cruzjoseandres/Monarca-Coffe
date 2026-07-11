

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

const getAllCategorias = async () => {
    try {
        const response = await apiClient.get(`/categoria`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getCategoriaById = async (id) => {
    try {
        const response = await apiClient.get(`/categoria/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createCategoria = async (data) => {
    try {
        const response = await apiClient.post(`/categoria`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateCategoria = async (id, data) => {
    try {
        const response = await apiClient.patch(`/categoria/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteCategoria = async (id) => {
    try {
        const response = await apiClient.delete(`/categoria/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getAllCategorias, getCategoriaById, createCategoria, updateCategoria, deleteCategoria };
