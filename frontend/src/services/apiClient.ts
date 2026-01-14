import axios from 'axios';
import { supabase } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el JWT de Supabase en cada petición
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta (401)
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token inválido o expirado.
            // Cerramos sesión en Supabase para limpiar el almacenamiento local
            // y que el AuthContext detecte el cambio (session = null),
            // redirigiendo así al usuario al login.
            await supabase.auth.signOut();
        }
        return Promise.reject(error);
    }
);

export default apiClient;
