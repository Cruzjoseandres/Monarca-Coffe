

import apiClient from "./apiClient";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const getAllUsers = async () => {
    try {
        const response = await apiClient.get(`/user`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getUserById = async (id) => {
    try {
        const response = await apiClient.get(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createUser = async (userData) => {
    try {
        const response = await apiClient.post(`/user`, userData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createValidator = async (userData) => {
    try {
        const response = await apiClient.post(`/user/validator`, userData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createOrganizador = async (userData) => {
    try {
        const response = await apiClient.post(`/user/organizador`, userData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const createAdmin = async (userData) => {
    try {
        const response = await apiClient.post(`/user/admin`, userData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const updateUser = async (id, userData) => {
    try {
        const response = await apiClient.patch(`/user/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const deleteUser = async (id) => {
    try {
        const response = await apiClient.delete(`/user/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export {
    getAllUsers,
    getUserById,
    createUser,
    createValidator,
    createOrganizador,
    createAdmin,
    updateUser,
    deleteUser
};
