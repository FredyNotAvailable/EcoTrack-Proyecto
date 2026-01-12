import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Debug Key Role
try {
    const keyParts = env.SUPABASE_SERVICE_ROLE_KEY.split('.');
    if (keyParts.length === 3) {
        // Simple base64 decode (Node.js buffer)
        const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
        console.log(`🔑 Supabase Key Role loaded: ${payload.role}`);
        if (payload.role !== 'service_role') {
            console.warn('⚠️ WARNING: You are not using a service_role key! RLS bypass will NOT work.');
        }
    }
} catch (e) {
    console.warn('⚠️ Could not decode Supabase Key');
}

export const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);
