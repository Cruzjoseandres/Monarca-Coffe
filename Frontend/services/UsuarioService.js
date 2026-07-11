

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

const getAllUsuarios = async () => {
    try {
        const response = await apiClient.get(`/usuario`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getUsuarioById = async (id) => {
    try {
        const response = await apiClient.get(`/usuario/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createUsuario = async (data) => {
    try {
        const response = await apiClient.post(`/usuario`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateUsuario = async (id, data) => {
    try {
        const response = await apiClient.patch(`/usuario/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteUsuario = async (id) => {
    try {
        const response = await apiClient.delete(`/usuario/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getAllUsuarios, getUsuarioById, createUsuario, updateUsuario, deleteUsuario };
