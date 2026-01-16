import apiClient from '../../../services/apiClient';

export interface RetoTarea {
    id: string;
    reto_id: string;
    titulo: string;
    descripcion: string;
    recompensa_puntos: number;
    recompensa_kg_co2: number;
    tipo: 'manual' | 'post' | 'event';
    cantidad_meta: number;
    completed: boolean;
    current_progress: number;
    can_upload_media?: boolean;
    dia_orden: number;
}

export interface Reto {
    id: string;
    titulo: string;
    descripcion: string;
    categoria: 'energia' | 'agua' | 'transporte' | 'residuos';
    fecha_inicio: string;
    fecha_fin: string;
    recompensa_puntos: number;
    recompensa_kg_co2: number;
    imagen_url?: string;
    created_at: string;
    status: 'joined' | 'completed' | 'expired' | undefined;
    joined: boolean;
    progress: number;
    tasks: RetoTarea[];
    total_tasks?: number;
    completed_tasks?: number;
}

export const retosService = {
    getMyChallenges: async (): Promise<Reto[]> => {
        const response = await apiClient.get<Reto[]>('/retos/me');
        return response.data;
    },

    joinChallenge: async (retoId: string): Promise<any> => {
        const response = await apiClient.post(`/retos/${retoId}/join`);
        return response.data;
    },

    completeTask: async (retoId: string, taskId: string): Promise<any> => {
        const response = await apiClient.post(`/retos/${retoId}/tasks/${taskId}/complete`);
        return response.data;
    }
};
