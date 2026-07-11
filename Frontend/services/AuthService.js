import apiClient from "./apiClient";

const login = async (loginData) => {
    try {
        const response = await apiClient.post(`/auth/login`, loginData);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getProfile = async () => {
    try {
        const response = await apiClient.get(`/auth/profile`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export { login, getProfile };
