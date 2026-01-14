import { supabase } from '../../config/supabaseClient';
import { UserRacha } from './rachas.types';
import { ApiError } from '../../utils/ApiError';

export class RachasRepository {
    async getRacha(userId: string): Promise<UserRacha | null> {
        const { data, error } = await supabase
            .from('user_rachas')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains no rows"
            console.error('Error fetching racha:', error);
            throw new ApiError(500, 'Error fetching user streak');
        }

        return data as UserRacha | null;
    }

    async createRacha(userId: string, rachaActual: number, rachaMaxima: number, ultimaFecha: string): Promise<UserRacha> {
        const { data, error } = await supabase
            .from('user_rachas')
            .insert({
                user_id: userId,
                racha_actual: rachaActual,
                racha_maxima: rachaMaxima,
                ultima_fecha: ultimaFecha
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating racha:', error);
            throw new ApiError(500, 'Error creating user streak');
        }

        return data as UserRacha;
    }

    async updateRacha(userId: string, rachaActual: number, rachaMaxima: number, ultimaFecha: string): Promise<void> {
        const { error } = await supabase
            .from('user_rachas')
            .update({
                racha_actual: rachaActual,
                racha_maxima: rachaMaxima,
                ultima_fecha: ultimaFecha,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating racha:', error);
            throw new ApiError(500, 'Error updating user streak');
        }
    }
}
