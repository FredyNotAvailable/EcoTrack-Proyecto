import { supabase } from '../../config/supabaseClient';
import { KgCo2Log } from './kgco2.types';
import { ApiError } from '../../utils/ApiError';

export class KgCo2Repository {
    async createLog(log: Omit<KgCo2Log, 'id' | 'created_at'>): Promise<void> {
        const { error } = await supabase
            .from('kgco2_logs')
            .insert(log);

        if (error) {
            console.error('Error creating kgco2 log:', error);
            throw new ApiError(500, 'Error creating kgco2 log');
        }
    }
}
