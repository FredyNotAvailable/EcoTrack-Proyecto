import { supabase } from '../../config/supabaseClient';
import { Reto, RetoTarea, UserReto, UserRetoTarea } from './retos.types';

export class RetosRepository {

    // Find active challenges (based on 'activo' flag)
    async findActiveChallenges(): Promise<Reto[]> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .select('*')
            .eq('activo', true);

        if (error) throw error;
        return (data || []).map(this.mapRetoFromDB);
    }

    async findAllChallenges(): Promise<Reto[]> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapRetoFromDB);
    }

    async getChallengeById(id: string): Promise<Reto | null> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapRetoFromDB(data);
    }

    async getTasksByChallengeId(retoId: string): Promise<RetoTarea[]> {
        const { data, error } = await supabase
            .from('retos_semanales_tareas')
            .select('*')
            .eq('reto_semanal_id', retoId);

        if (error) throw error;
        return (data || []).map((t: any) => ({
            id: t.id,
            reto_id: t.reto_semanal_id,
            titulo: t.nombre,
            descripcion: t.descripcion,
            recompensa_puntos: t.puntos,
            recompensa_kg_co2: t.kgco2,
            tipo: 'manual',
            cantidad_meta: 1,
            dia_orden: t.dia_orden
        }));
    }

    // User Participation
    async getUserChallenge(userId: string, retoId: string): Promise<UserReto | null> {
        // Try reto_semanal_id first (likely correct based on tasks table)
        const { data, error } = await supabase
            .from('usuarios_retos_semanales')
            .select('*')
            .eq('user_id', userId)
            .eq('reto_semanal_id', retoId)
            .single();

        if (error) return null;
        return {
            id: data.id,
            user_id: data.user_id,
            reto_id: data.reto_semanal_id,
            estado: data.estado,
            progreso: data.progreso,
            fecha_union: data.created_at || new Date().toISOString(),
            fecha_completado: data.fecha_completado
        };
    }

    async joinChallenge(userId: string, retoId: string): Promise<UserReto> {
        const { data, error } = await supabase
            .from('usuarios_retos_semanales')
            .insert({
                user_id: userId,
                reto_semanal_id: retoId,
                estado: 'joined',
                progreso: 0
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            user_id: data.user_id,
            reto_id: data.reto_semanal_id,
            estado: data.estado,
            progreso: data.progreso,
            fecha_union: data.created_at || new Date().toISOString(),
            fecha_completado: data.fecha_completado
        };
    }

    async updateChallengeProgress(userId: string, retoId: string, progress: number, status: 'joined' | 'completed'): Promise<void> {
        const updates: any = { progreso: progress, estado: status };
        if (status === 'completed') {
            updates.fecha_completado = new Date().toISOString();
        }

        const { error } = await supabase
            .from('usuarios_retos_semanales')
            .update(updates)
            .eq('user_id', userId)
            .eq('reto_semanal_id', retoId);

        if (error) throw error;
    }

    // Tasks Management
    async getUserTask(userRetoId: string, taskId: string): Promise<UserRetoTarea | null> {
        const { data, error } = await supabase
            .from('usuarios_retos_tareas')
            .select('*')
            .eq('user_reto_id', userRetoId)
            .eq('tarea_id', taskId)
            .single();

        if (error) return null;
        return {
            id: data.id,
            user_id: '', // Not in this table, will be filled by service if needed
            reto_id: data.user_reto_id,
            tarea_id: data.tarea_id,
            completado: data.completado,
            progreso_actual: 0,
            fecha_completado: data.completed_at
        };
    }

    async getUserTasksByChallenge(userRetoId: string): Promise<UserRetoTarea[]> {
        const { data, error } = await supabase
            .from('usuarios_retos_tareas')
            .select('*')
            .eq('user_reto_id', userRetoId);

        if (error) throw error;

        return (data || []).map((d: any) => ({
            id: d.id,
            user_id: '',
            reto_id: d.user_reto_id,
            tarea_id: d.tarea_id,
            completado: d.completado,
            progreso_actual: 0,
            fecha_completado: d.completed_at
        }));
    }

    async createUserTask(userRetoId: string, taskId: string): Promise<UserRetoTarea> {
        const { data, error } = await supabase
            .from('usuarios_retos_tareas')
            .insert({
                user_reto_id: userRetoId,
                tarea_id: taskId,
                completado: false
            })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            user_id: '',
            reto_id: data.user_reto_id,
            tarea_id: data.tarea_id,
            completado: data.completado,
            progreso_actual: 0,
            fecha_completado: data.completed_at
        };
    }

    async updateUserTask(userRetoId: string, taskId: string, updates: Partial<UserRetoTarea>): Promise<UserRetoTarea> {
        const dbUpdates: any = {};
        if (updates.completado !== undefined) dbUpdates.completado = updates.completado;
        if (updates.fecha_completado !== undefined) dbUpdates.completed_at = updates.fecha_completado;

        const { data, error } = await supabase
            .from('usuarios_retos_tareas')
            .update(dbUpdates)
            .eq('user_reto_id', userRetoId)
            .eq('tarea_id', taskId)
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            user_id: '',
            reto_id: data.user_reto_id,
            tarea_id: data.tarea_id,
            completado: data.completado,
            progreso_actual: 0,
            fecha_completado: data.completed_at
        };
    }


    // Helper
    private mapRetoFromDB(r: any): Reto {
        return {
            id: r.id,
            titulo: r.nombre,
            descripcion: r.descripcion,
            recompensa_puntos: r.puntos_totales,
            recompensa_kg_co2: r.kgco2_total,
            fecha_inicio: r.created_at,
            // Mock end date: created_at + 7 days
            fecha_fin: new Date(new Date(r.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            imagen_url: undefined, // Or check if DB has it
            created_at: r.created_at
        };
    }
}

