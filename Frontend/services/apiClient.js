import axios from 'axios';
import { getAccessToken, removeAccessToken } from '../utils/TokenUtilities';
import { API_URL } from './config';

const apiClient = axios.create({
    baseURL: API_URL
});

// Helper para generar una clave de idempotencia determinista y segura para cabeceras HTTP (sin saltos de línea ni caracteres especiales)
const generateIdempotencyKey = (method, url, data) => {
    let serializedData = '';
    if (data instanceof FormData) {
        const entries = [];
        data.forEach((val, key) => {
            if (val instanceof File) {
                entries.push(`${key}:${val.name}:${val.size}`);
            } else {
                entries.push(`${key}:${val}`);
            }
        });
        serializedData = entries.join('&');
    } else if (data && typeof data === 'object') {
        serializedData = JSON.stringify(data);
    } else {
        serializedData = String(data || '');
    }
    
    // Crear un hash determinista limpio para que el valor del header HTTP sea 100% válido (alfanumérico)
    let hash = 0;
    const fullString = `${method.toUpperCase()}:${url}:${serializedData}`;
    for (let i = 0; i < fullString.length; i++) {
        const char = fullString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const safeUrl = String(url || '').replace(/[^a-zA-Z0-9_-]/g, '');
    return `${method.toUpperCase()}_${safeUrl}_${Math.abs(hash).toString(36)}_${fullString.length}`;
};

// Request interceptor to attach the token and Idempotency header
apiClient.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
            if (!config.headers['X-Idempotency-Key'] && !config.headers['x-idempotency-key']) {
                const autoKey = generateIdempotencyKey(config.method, config.url || '', config.data);
                config.headers['X-Idempotency-Key'] = autoKey;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to catch 401s globally
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.error("Session expired or unauthorized. Logging out...");
            removeAccessToken();
            // Force a reload to route the user to /login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Deduplicación en vuelo de peticiones concurrentes (e.g. doble clic rápido en botones de guardar)
const inFlightRequests = new Map();

const wrapWithInFlightDeduplication = (methodName, originalMethod) => {
    return async (url, dataOrConfig, maybeConfig) => {
        const isPostPutPatch = ['post', 'put', 'patch'].includes(methodName);
        const data = isPostPutPatch ? dataOrConfig : undefined;
        const fingerprint = generateIdempotencyKey(methodName, url, data);

        if (inFlightRequests.has(fingerprint)) {
            return inFlightRequests.get(fingerprint);
        }

        const promise = (async () => {
            try {
                return await originalMethod.call(apiClient, url, dataOrConfig, maybeConfig);
            } finally {
                inFlightRequests.delete(fingerprint);
            }
        })();

        inFlightRequests.set(fingerprint, promise);
        return promise;
    };
};

apiClient.post = wrapWithInFlightDeduplication('post', apiClient.post);
apiClient.put = wrapWithInFlightDeduplication('put', apiClient.put);
apiClient.patch = wrapWithInFlightDeduplication('patch', apiClient.patch);
apiClient.delete = wrapWithInFlightDeduplication('delete', apiClient.delete);

export default apiClient;

