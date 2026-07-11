

import apiClient from "./apiClient";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const getAllLugares = async () => {
    try {
        const response = await apiClient.get(`/lugar`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getLugarById = async (id) => {
    try {
        const response = await apiClient.get(`/lugar/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createLugar = async (formData) => {
    try {
        const response = await apiClient.post(`/lugar`, formData, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateLugar = async (id, formData) => {
    try {
        const response = await apiClient.patch(`/lugar/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${getAccessToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteLugar = async (id) => {
    try {
        const response = await apiClient.delete(`/lugar/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getAllLugares, getLugarById, createLugar, updateLugar, deleteLugar };
