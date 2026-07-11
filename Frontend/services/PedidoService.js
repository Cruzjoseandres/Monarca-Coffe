

import apiClient from "./apiClient";
import { getAccessToken } from "../utils/TokenUtilities";

const createPedido = async (data) => {
    try {
        const response = await apiClient.post(`/pedido`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const cobrarPedido = async (id, data) => {
    try {
        const response = await apiClient.post(`/pedido/${id}/cobrar`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getAllPedidos = async () => {
    try {
        const response = await apiClient.get(`/pedido`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getPedidoById = async (id) => {
    try {
        const response = await apiClient.get(`/pedido/${id}`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const updatePedido = async (id, data) => {
    try {
        const response = await apiClient.patch(`/pedido/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deletePedido = async (id, justificativo) => {
    try {
        const response = await apiClient.delete(`/pedido/${id}`, { data: { justificativo } });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getMisPedidos = async () => {
    try {
        const response = await apiClient.get(`/pedido/mis-pedidos`);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const generateWhatsAppPdf = async (id) => {
    try {
        const response = await apiClient.post(`/pedido/${id}/whatsapp-pdf`, {});
        return response.data.pdfUrl;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export { createPedido, cobrarPedido, getAllPedidos, getPedidoById, updatePedido, deletePedido, getMisPedidos, generateWhatsAppPdf };


