import { supabase } from '../../config/supabaseClient';
import { Nivel } from './niveles.types';
import { ApiError } from '../../utils/ApiError';

export class NivelesRepository {
    async getAll(): Promise<Nivel[]> {
        const { data, error } = await supabase
            .from('niveles')
            .select('*')
            .order('nivel', { ascending: true });

        if (error) {
            console.error('Error fetching niveles:', error);
            throw new ApiError(500, 'Error fetching levels');
        }

        return data as Nivel[];
    }
}
