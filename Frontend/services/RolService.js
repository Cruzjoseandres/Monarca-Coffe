

import apiClient from "./apiClient";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const getAllRoles = async () => {
    try {
        const response = await apiClient.get(`/rol`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { getAllRoles };
