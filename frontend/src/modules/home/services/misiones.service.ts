import apiClient from "../../../services/apiClient";

export interface DailyMission {
    id: string;
    titulo: string;
    descripcion: string;
    eco_tip?: string;
    impacto?: string;
    kg_co2_ahorrado?: number;
    puntos: number;
    dificultad?: string;
    activa: boolean;
    created_at: string;
    // Frontend helper to track completion state locally before refetch
    completed?: boolean;
}

export const misionesService = {
    getDailyMissions: async (): Promise<DailyMission[]> => {
        const response = await apiClient.get<DailyMission[]>('/misiones/daily');
        return response.data;
    },

    getCompletedMissions: async (): Promise<string[]> => {
        const response = await apiClient.get<string[]>('/misiones/completed');
        return response.data;
    },

    completeMission: async (id: string): Promise<void> => {
        await apiClient.post(`/misiones/${id}/complete`);
    }
};
