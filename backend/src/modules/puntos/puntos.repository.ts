import { supabase } from '../../config/supabaseClient';
import { ApiError } from '../../utils/ApiError';
import { PuntosLog } from './puntos.types';

export class PuntosRepository {
    async logPoints(userId: string, puntos: number, origen: string, referenciaId?: string): Promise<PuntosLog> {
        const { data, error } = await supabase
            .from('puntos_logs')
            .insert({
                user_id: userId,
                puntos,
                origen,
                referencia_id: referenciaId
            })
            .select()
            .single();

        if (error) {
            console.error('Error logging points:', error);
            throw new ApiError(500, 'Error logging points');
        }

        return data;
    }

    async getUserPoints(userId: string): Promise<number> {
        // Option 1: Sum from logs (Source of Truth)
        const { data, error } = await supabase.rpc('calculate_user_points', { user_uuid: userId });

        // Fallback if RPC doesn't exist yet, manual sum (less efficient)
        if (error) {
            const { data: logs, error: logError } = await supabase
                .from('puntos_logs')
                .select('puntos')
                .eq('user_id', userId);

            if (logError) return 0;
            return logs.reduce((sum, log) => sum + log.puntos, 0);
        }

        return data || 0;
    }
}
