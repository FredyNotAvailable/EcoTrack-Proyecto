import { supabase } from '../../config/supabaseClient';
import { DailyMission } from './misiones.types';
import { ApiError } from '../../utils/ApiError';

export class MisionesRepository {
    private static instance: MisionesRepository;

    static getInstance(): MisionesRepository {
        if (!MisionesRepository.instance) {
            MisionesRepository.instance = new MisionesRepository();
        }
        return MisionesRepository.instance;
    }

    async findAllActive(): Promise<DailyMission[]> {
        const { data, error } = await supabase
            .from('misiones_diarias')
            .select('id, titulo, descripcion, eco_tip, impacto, kg_co2_ahorrado, puntos, dificultad, categoria, activa, created_at')
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

    // --- Admin CRUD ---

    async findAll(): Promise<DailyMission[]> {
        const { data, error } = await supabase
            .from('misiones_diarias')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new ApiError(500, 'Error fetching all missions');
        return data || [];
    }

    async create(mission: Partial<DailyMission>): Promise<DailyMission> {
        const { data, error } = await supabase
            .from('misiones_diarias')
            .insert(mission)
            .select()
            .single();

        if (error) throw new ApiError(500, 'Error creating mission');
        return data;
    }

    async update(id: string, mission: Partial<DailyMission>): Promise<DailyMission> {
        const { data, error } = await supabase
            .from('misiones_diarias')
            .update(mission)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new ApiError(500, 'Error updating mission');
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('misiones_diarias')
            .delete()
            .eq('id', id);

        if (error) throw new ApiError(500, 'Error deleting mission');
    }
}
