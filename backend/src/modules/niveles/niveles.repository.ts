import { supabase } from '../../config/supabaseClient';
import { Nivel } from './niveles.types';
import { ApiError } from '../../utils/ApiError';

export class NivelesRepository {
    private static instance: NivelesRepository;

    static getInstance(): NivelesRepository {
        if (!NivelesRepository.instance) {
            NivelesRepository.instance = new NivelesRepository();
        }
        return NivelesRepository.instance;
    }

    async getAll(): Promise<Nivel[]> {
        const { data, error } = await supabase
            .from('niveles')
            .select('nivel, puntos_minimos')
            .order('nivel', { ascending: true });

        if (error) {
            console.error('Error fetching niveles:', error);
            throw new ApiError(500, 'Error fetching levels');
        }

        return data as Nivel[];
    }

    async create(level: Nivel): Promise<Nivel> {
        const { data, error } = await supabase
            .from('niveles')
            .insert(level)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                throw new ApiError(400, `El nivel ${level.nivel} ya existe.`);
            }
            throw new ApiError(500, 'Error creating level');
        }
        return data as Nivel;
    }

    async update(nivel: number, updates: Partial<Nivel>): Promise<Nivel> {
        const { data, error } = await supabase
            .from('niveles')
            .update(updates)
            .eq('nivel', nivel)
            .select()
            .single();

        if (error) throw new ApiError(500, 'Error updating level');
        return data as Nivel;
    }

    async delete(nivel: number): Promise<void> {
        const { error } = await supabase
            .from('niveles')
            .delete()
            .eq('nivel', nivel);

        if (error) throw new ApiError(500, 'Error deleting level');
    }
}
