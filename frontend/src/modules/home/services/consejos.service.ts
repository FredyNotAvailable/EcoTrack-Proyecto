import apiClient from '../../../services/apiClient';

export interface DailyTip {
    id: string;
    titulo: string;
    descripcion: string;
    activo: boolean;
    created_at: string;
}

export const consejosService = {
    getDailyTip: async (): Promise<DailyTip> => {
        const { data } = await apiClient.get<DailyTip>('/consejos/daily');
        return data;
    }
};
