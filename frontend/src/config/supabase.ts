import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno de Supabase. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env');
}

// Validación básica de URL para evitar el error de SupabaseClient
try {
    new URL(supabaseUrl);
} catch (e) {
    throw new Error(`La URL de Supabase no es válida: "${supabaseUrl}". Debe empezar con http:// o https://`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
