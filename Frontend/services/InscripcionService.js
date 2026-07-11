

import apiClient from "./apiClient";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const createInscripcion = async (lugarId) => {
    try {
        const response = await apiClient.post(`/inscripcion/${lugarId}`, {});
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getMisInscripciones = async () => {
    try {
        const response = await apiClient.get(`/inscripcion/mis-inscripciones`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getInscripcionDetail = async (id) => {
    try {
        const response = await apiClient.get(`/inscripcion/detalle/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const subirComprobante = async (lugarId, formData) => {
    try {
        const response = await apiClient.post(`/inscripcion/lugar/${lugarId}/comprobante`, formData, {
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

const cancelarInscripcion = async (id) => {
    try {
        const response = await apiClient.delete(`/inscripcion/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const validarQr = async (token) => {
    try {
        const response = await apiClient.get(`/inscripcion/validar-qr/${token}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const verificarComprobante = async (id, aprobar) => {
    try {
        const response = await apiClient.patch(`/inscripcion/${id}/verificar-comprobante`, { aprobar });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getPendientesVerificacion = async () => {
    try {
        const response = await apiClient.get(`/inscripcion/pendientes-verificacion`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getInscripcionesByEvento = async (eventoId) => {
    try {
        const response = await apiClient.get(`/inscripcion/evento/${eventoId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

const getComprobantesByEvento = async (eventoId) => {
    try {
        const response = await apiClient.get(`/inscripcion/comprobantesVerificar/evento/${eventoId}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export {
    createInscripcion,
    getMisInscripciones,
    getInscripcionDetail,
    subirComprobante,
    cancelarInscripcion,
    validarQr,
    verificarComprobante,
    getPendientesVerificacion,
    getInscripcionesByEvento,
    getComprobantesByEvento
};
