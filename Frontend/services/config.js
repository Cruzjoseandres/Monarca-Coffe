// Configuración centralizada de la API
// En desarrollo: usa localhost
// En producción: usa la variable de entorno VITE_API_URL

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
