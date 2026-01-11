import { supabase } from '../../../config/supabase';
import type { LoginCredentials } from '../types';

export const AuthService = {
    /**
     * Autentica al usuario con email y contraseña
     */
    async signIn({ email, password }: LoginCredentials) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    /**
   * Registra a un nuevo usuario
   */
    async signUp({ email, password }: LoginCredentials) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password: password!,
        });
        if (error) throw error;
        return data;
    },

    /**
     * Inicia sesión con Google
     */
    async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/auth/callback'
            }
        });
        if (error) throw error;
        return data;
    },

    /**
     * Cierra la sesión activa
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }
};
