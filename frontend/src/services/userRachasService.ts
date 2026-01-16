
import apiClient from './apiClient';

export interface UserRacha {
    user_id: string;
    racha_actual: number;
    racha_maxima: number;
    ultima_fecha: string | null;
    updated_at: string;
}

export const userRachasService = {
    getMyRacha: async (): Promise<UserRacha> => {
        const response = await apiClient.get<UserRacha>('/user-rachas/me');
        return response.data;
    },
    getUserRacha: async (userId: string): Promise<UserRacha> => {
        const response = await apiClient.get<UserRacha>(`/user-rachas/${userId}`);
        return response.data;
    }
};
