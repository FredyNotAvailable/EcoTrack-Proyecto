import axios from 'axios';
import { supabase } from '../config/supabase';

console.log('[apiClient] 🏁 Initialization started');

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Asegurar que la URL termine en /api para evitar errores 404
if (API_URL && !API_URL.endsWith('/api') && !API_URL.endsWith('/api/')) {
    API_URL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
}

console.log(`[apiClient] 🌍 Target URL: ${API_URL}`);

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el JWT de Supabase en cada petición
apiClient.interceptors.request.use(async (config) => {
    const requestUrl = `${config.url}`;
    console.log(`[apiClient] 📤 STARTING: ${config.method?.toUpperCase()} ${requestUrl}`);

    // Si ya tiene el token (porque lo pasamos manualmente en AuthService), no necesitamos pedirlo a Supabase de nuevo
    if (config.headers.Authorization) {
        console.log('[apiClient] 🔐 Token already present in headers, skipping getSession');
        return config;
    }

    try {
        console.log('[apiClient] 🔐 Attempting to fetch session from Supabase storage...');
        // getSession() es más rápido que getUser() porque lee de localStorage/cookies
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (session?.access_token) {
            console.log('[apiClient] 🔐 Token found and attached');
            config.headers.Authorization = `Bearer ${session.access_token}`;
        } else {
            console.log('[apiClient] 🔐 No session found in storage');
        }
    } catch (authError) {
        console.warn('[apiClient] 🔐 Non-fatal session fetch error:', authError);
    }

    return config;
}, (error) => {
    console.error('[apiClient] 📤 Request Interceptor Error:', error);
    return Promise.reject(error);
});

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[apiClient] ✅ SUCCESS: ${response.config.url}`);
        return response;
    },
    async (error) => {
        const url = error.config?.url;
        if (error.code === 'ECONNABORTED') {
            console.error(`[apiClient] ⏰ TIMEOUT: La petición a ${url} tardó demasiado (>30s)`);
        } else if (error.response) {
            console.error(`[apiClient] 🔴 ERROR ${error.response.status}: ${url}`, error.response.data);
            if (error.response.status === 401) {
                console.warn('[apiClient] � Unauthorized, signing out user.');
                await supabase.auth.signOut();
            }
        } else {
            console.error(`[apiClient] 🔌 NETWORK ERROR: ${url}. ¿Está el backend encendido?`);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
