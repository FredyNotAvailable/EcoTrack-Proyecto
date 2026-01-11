import { supabase } from '../../config/supabaseClient';

export class RetosRepository {
    async getAll() {
        const { data, error } = await supabase
            .from('retos')
            .select('*')
            .eq('activo', true);

        if (error) throw error;
        return data;
    }

    async addParticipant(userId: string, retoId: string) {
        const { data, error } = await supabase
            .from('retos_participantes')
            .insert([{ user_id: userId, reto_id: retoId }]);

        if (error) throw error;
        return data;
    }
}
