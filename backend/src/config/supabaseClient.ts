import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Debug Key Role (solo en desarrollo)
if (env.NODE_ENV !== 'production') {
    try {
        const keyParts = env.SUPABASE_SERVICE_ROLE_KEY.split('.');
        if (keyParts.length === 3) {
            const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
            console.log(`🔑 Supabase Key Role loaded: ${payload.role}`);
            if (payload.role !== 'service_role') {
                console.warn('⚠️ WARNING: You are not using a service_role key! RLS bypass will NOT work.');
            }
        }
    } catch (e) {
        console.warn('⚠️ Could not decode Supabase Key');
    }
}

// Timeout para fetch requests (30 segundos)
const SUPABASE_TIMEOUT_MS = 30000;

// Custom fetch con timeout
const fetchWithTimeout = (url: string | URL | globalThis.Request, options?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);
    
    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
};

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            fetch: fetchWithTimeout
        }
    }
);
