import { supabase } from '../../../config/supabase';
import type { LoginCredentials } from '../types';
import apiClient from '../../../services/apiClient';

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
    },

    /**
     * Verifica si un correo ya existe en la base de datos
     */
    async checkEmailExists(email: string): Promise<{ exists: boolean; provider: string | null }> {
        try {
            console.log(`[AuthService] Fetching check-email for ${email}...`);
            const response = await apiClient.post('/auth/check-email', { email });

            console.log("[AuthService] Data received:", response.data);
            return {
                exists: response.data.exists,
                provider: response.data.provider
            };
        } catch (error) {
            console.error("Error al verificar email:", error);
            return { exists: false, provider: null };
        }
    },

    /**
     * Verifica si el usuario actual tiene un perfil registrado en el backend
     */
    async checkRegistrationStatus(token: string): Promise<{ registered: boolean }> {
        try {
            // we ignore the passed token and let apiClient handle it via session
            // or we can pass it manually if needed, but apiClient is cleaner.
            // If token is specifically needed (onboarding), we can use headers.
            const response = await apiClient.get('/auth/registration-status', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return { registered: response.data.registered };
        } catch (error) {
            console.error("Error al verificar estado de registro:", error);
            return { registered: false };
        }
    }
};
