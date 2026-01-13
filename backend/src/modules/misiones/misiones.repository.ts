import { supabase } from '../../config/supabaseClient';
import { DailyMission } from './misiones.types';
import { ApiError } from '../../utils/ApiError';

export class MisionesRepository {
    async findAllActive(): Promise<DailyMission[]> {
        const { data, error } = await supabase
            .from('misiones_diarias')
            .select('*')
            .eq('activa', true);

        if (error) {
            throw new ApiError(500, 'Error fetching active missions');
        }

        return data || [];
    }

    async completeMission(userId: string, missionId: string): Promise<void> {
        const { error } = await supabase
            .from('misiones_usuario')
            .insert({
                user_id: userId,
                mision_id: missionId,
                fecha: new Date().toISOString().split('T')[0]
            });

        if (error) {
            // Check for duplicate key violation (already completed)
            if (error.code === '23505') {
                throw new ApiError(400, 'Mission already completed today');
            }
            console.error('Error completing mission:', error);
            throw new ApiError(500, 'Error completing mission');
        }
    }

    async getCompletedMissions(userId: string): Promise<string[]> {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('misiones_usuario')
            .select('mision_id')
            .eq('user_id', userId)
            .eq('fecha', today);

        if (error) {
            console.error('Supabase Error (getCompletedMissions):', error);
            throw new ApiError(500, 'Error fetching completed missions');
        }

        return data?.map(row => row.mision_id) || [];
    }
}
