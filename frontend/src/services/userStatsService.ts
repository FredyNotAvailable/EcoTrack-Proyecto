import apiClient from '../services/apiClient';

export interface LevelProgress {
    nivel: number;
    titulo: string;
    puntos_actuales_totales: number;
    puntos_nivel_actual: number;
    puntos_siguiente_nivel: number | null;
    experiencia_relativa: number;
    progreso_porcentaje: number;
}

export interface UserStats {
    user_id: string;
    puntos_totales: number;
    nivel: number;
    experiencia: number;
    kg_co2_ahorrado: number;
    retos_completados: number;
    misiones_diarias_completadas: number;
    posts_creados: number;
    comentarios_creados: number;
    likes_recibidos: number;
    ultimo_evento?: string;
    updated_at: string;
    progress?: LevelProgress;
}

export const userStatsService = {
    getUserStats: async (): Promise<UserStats> => {
        const response = await apiClient.get<UserStats>('/user-stats/me');
        return response.data;
    },
    getGlobalStats: async (): Promise<{ total_co2: number; total_users: number }> => {
        const response = await apiClient.get<{ total_co2: number; total_users: number }>('/user-stats/global');
        return response.data;
    },
    getLeaderboard: async (period: 'global' | 'day' | 'week' | 'month' = 'global'): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/user-stats/leaderboard', {
            params: { period }
        });
        return response.data;
    },
    getUserStatsById: async (userId: string): Promise<UserStats> => {
        const response = await apiClient.get<UserStats>(`/user-stats/${userId}`);
        return response.data;
    }
};
