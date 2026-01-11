import apiClient from '../../services/apiClient';

export interface Reto {
    id: string;
    titulo: string;
    descripcion: string;
    puntos: number;
}

export const RetoService = {
    getAll: async (): Promise<Reto[]> => {
        const { data } = await apiClient.get('/retos');
        return data.data;
    },

    join: async (retoId: string): Promise<any> => {
        const { data } = await apiClient.post('/retos/join', { retoId });
        return data;
    }
};
