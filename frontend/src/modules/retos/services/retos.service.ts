import { supabase } from '../../../config/supabase';

const API_URL = 'http://localhost:3001/api';

export interface Reto {
    id: string;
    titulo: string;
    descripcion: string;
    puntos_recompensa: number;
    categoria: string;
    nivel_dificultad: 'Fácil' | 'Intermedio' | 'Difícil';
    activo: boolean;
}

export const RetosAPIService = {
    async getAll() {
        const response = await fetch(`${API_URL}/retos`);
        if (!response.ok) throw new Error('Error al obtener los retos');
        const result = await response.json();
        return result.data as Reto[];
    },

    async getMyChallenges() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        const response = await fetch(`${API_URL}/retos/me`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) throw new Error('Error al obtener mis retos');
        const result = await response.json();
        return result.data;
    },

    async join(retoId: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        const response = await fetch(`${API_URL}/retos/${retoId}/join`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al inscribirse en el reto');
        }

        const result = await response.json();
        return result.data;
    }
};
