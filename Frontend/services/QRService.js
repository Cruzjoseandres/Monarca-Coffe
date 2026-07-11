import apiClient from './apiClient';

export const getQRUrl = async () => {
    try {
        const response = await apiClient.get('/public/qr');
        return response.data?.url || null;
    } catch (error) {
        console.error('Error al obtener QR:', error);
        return null;
    }
};

export const uploadQR = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/public/qr', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data?.url || null;
};
