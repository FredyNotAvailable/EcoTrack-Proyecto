import { supabase } from '../../config/supabaseClient';
import { DailyTip } from './consejos.types';

export class ConsejosRepository {
    private static instance: ConsejosRepository;

    static getInstance(): ConsejosRepository {
        if (!ConsejosRepository.instance) {
            ConsejosRepository.instance = new ConsejosRepository();
        }
        return ConsejosRepository.instance;
    }

    async findAllActive(): Promise<DailyTip[]> {
        const { data, error } = await supabase
            .from('consejos_diarios')
            .select('id, titulo, descripcion, activo, created_at')
            .eq('activo', true);

        if (error) {
            console.error('Supabase Error (Consejos):', error);
            throw error;
        }
        return data || [];
    }
}
