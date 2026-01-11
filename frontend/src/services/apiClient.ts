import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el JWT de Supabase en cada petición
apiClient.interceptors.request.use(async (config) => {
    // Aquí se obtendría la sesión desde el store/context de auth si fuera necesario
    // Por ahora lo dejamos preparado para conectarse con la lógica de auth
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;
