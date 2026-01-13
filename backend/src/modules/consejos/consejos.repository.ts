import { supabase } from '../../config/supabaseClient';
import { DailyTip } from './consejos.types';

export class ConsejosRepository {
    async findAllActive(): Promise<DailyTip[]> {
        const { data, error } = await supabase
            .from('consejos_diarios')
            .select('*')
            .eq('activo', true);

        if (error) {
            console.error('Supabase Error (Consejos):', error);
            throw error;
        }
        return data || [];
    }
}
