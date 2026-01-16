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
    },

    /**
     * Verifica si un correo ya existe en la base de datos
     */
    async checkEmailExists(email: string): Promise<{ exists: boolean; provider: string | null }> {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
        try {
            console.log(`[AuthService] Fetching ${API_URL}/auth/check-email for ${email}...`);
            const response = await fetch(`${API_URL}/auth/check-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                console.warn("[AuthService] Response not OK:", response.status);
                return { exists: false, provider: null };
            }
            const data = await response.json();
            console.log("[AuthService] Data received:", data);
            return {
                exists: data.exists,
                provider: data.provider
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
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
        try {
            const response = await fetch(`${API_URL}/auth/registration-status`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) return { registered: false };
            const data = await response.json();
            return { registered: data.registered };
        } catch (error) {
            console.error("Error al verificar estado de registro:", error);
            return { registered: false };
        }
    }
};
