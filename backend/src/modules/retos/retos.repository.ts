import { supabase } from '../../config/supabaseClient';
import { Reto, RetoTarea, UserReto, UserRetoTarea } from './retos.types';

export class RetosRepository {
    private static instance: RetosRepository;

    static getInstance(): RetosRepository {
        if (!RetosRepository.instance) {
            RetosRepository.instance = new RetosRepository();
        }
        return RetosRepository.instance;
    }

    // Find active challenges (based on 'activo' flag)
    async findActiveChallenges(): Promise<Reto[]> {
        const now = new Date();

        // Use LOCAL time to construct YYYY-MM-DD to ensure we compare against the local calendar day
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const localDateStr = `${year}-${month}-${day}`;

        const { data, error } = await supabase
            .from('retos_semanales')
            .select('id, nombre, descripcion, categoria, puntos_totales, kgco2_total, fecha_inicio, fecha_fin, activo, created_at')
            .eq('activo', true)
            .lte('fecha_inicio', now.toISOString()) // Started anytime before now (UTC is fine for start check usually, or use same logic if stricter)
            .gte('fecha_fin', localDateStr); // End date must be greater than or equal to TODAY

        if (error) throw error;
        return (data || []).map(this.mapRetoFromDB);
    }

    async findAllChallenges(): Promise<Reto[]> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .select('id, nombre, descripcion, categoria, puntos_totales, kgco2_total, fecha_inicio, fecha_fin, activo, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapRetoFromDB);
    }

    async getChallengeById(id: string): Promise<Reto | null> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .select('id, nombre, descripcion, categoria, puntos_totales, kgco2_total, fecha_inicio, fecha_fin, activo, created_at')
            .eq('id', id)
            .single();

        if (error) return null;
        return this.mapRetoFromDB(data);
    }

    async getTasksByChallengeId(retoId: string): Promise<RetoTarea[]> {
        const { data, error } = await supabase
            .from('retos_semanales_tareas')
            .select('id, reto_semanal_id, nombre, descripcion, puntos, kgco2, dia_orden')
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

    // BATCH: Get tasks for multiple challenges in one query (eliminates N+1)
    async getTasksByMultipleChallengeIds(retoIds: string[]): Promise<Map<string, RetoTarea[]>> {
        if (retoIds.length === 0) return new Map();

        const { data, error } = await supabase
            .from('retos_semanales_tareas')
            .select('id, reto_semanal_id, nombre, descripcion, puntos, kgco2, dia_orden')
            .in('reto_semanal_id', retoIds);

        if (error) throw error;

        const tasksMap = new Map<string, RetoTarea[]>();
        (data || []).forEach((t: any) => {
            const task: RetoTarea = {
                id: t.id,
                reto_id: t.reto_semanal_id,
                titulo: t.nombre,
                descripcion: t.descripcion,
                recompensa_puntos: t.puntos,
                recompensa_kg_co2: t.kgco2,
                tipo: 'manual',
                cantidad_meta: 1,
                dia_orden: t.dia_orden
            };
            const existing = tasksMap.get(t.reto_semanal_id) || [];
            existing.push(task);
            tasksMap.set(t.reto_semanal_id, existing);
        });

        return tasksMap;
    }

    // BATCH: Get user tasks for multiple challenges in one query (eliminates N+1)
    async getUserTasksByMultipleChallengeIds(userRetoIds: string[]): Promise<Map<string, UserRetoTarea[]>> {
        if (userRetoIds.length === 0) return new Map();

        const { data, error } = await supabase
            .from('usuarios_retos_tareas')
            .select('id, user_reto_id, tarea_id, completado, completed_at')
            .in('user_reto_id', userRetoIds);

        if (error) throw error;

        const tasksMap = new Map<string, UserRetoTarea[]>();
        (data || []).forEach((d: any) => {
            const task: UserRetoTarea = {
                id: d.id,
                user_id: '',
                reto_id: d.user_reto_id,
                tarea_id: d.tarea_id,
                completado: d.completado,
                progreso_actual: 0,
                fecha_completado: d.completed_at
            };
            const existing = tasksMap.get(d.user_reto_id) || [];
            existing.push(task);
            tasksMap.set(d.user_reto_id, existing);
        });

        return tasksMap;
    }

    // User Participation
    async getUserChallenge(userId: string, retoId: string): Promise<UserReto | null> {
        // Try reto_semanal_id first (likely correct based on tasks table)
        const { data, error } = await supabase
            .from('usuarios_retos_semanales')
            .select('id, user_id, reto_semanal_id, estado, progreso, started_at, completed_at')
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
            fecha_union: data.started_at || new Date().toISOString(),
            fecha_completado: data.completed_at
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
            fecha_union: data.started_at || new Date().toISOString(),
            fecha_completado: data.completed_at
        };
    }

    async getAllUserChallenges(userId: string): Promise<UserReto[]> {
        const { data, error } = await supabase
            .from('usuarios_retos_semanales')
            .select('id, user_id, reto_semanal_id, estado, progreso, started_at, completed_at')
            .eq('user_id', userId);

        if (error) throw error;
        return (data || []).map((d: any) => ({
            id: d.id,
            user_id: d.user_id,
            reto_id: d.reto_semanal_id,
            estado: d.estado,
            progreso: d.progreso,
            fecha_union: d.started_at || new Date().toISOString(),
            fecha_completado: d.completed_at
        }));
    }

    async getChallengesByIds(ids: string[]): Promise<Reto[]> {
        if (ids.length === 0) return [];

        const { data, error } = await supabase
            .from('retos_semanales')
            .select('id, nombre, descripcion, categoria, puntos_totales, kgco2_total, fecha_inicio, fecha_fin, activo, created_at')
            .in('id', ids);

        if (error) throw error;
        return (data || []).map(this.mapRetoFromDB);
    }

    async updateChallengeProgress(userId: string, retoId: string, progress: number, status: 'joined' | 'completed' | 'expired'): Promise<void> {
        const updates: any = { progreso: progress, estado: status };
        if (status === 'completed') {
            updates.completed_at = new Date().toISOString();
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
            .select('id, user_reto_id, tarea_id, completado, completed_at')
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
            .select('id, user_reto_id, tarea_id, completado, completed_at')
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
            categoria: r.categoria,
            recompensa_puntos: r.puntos_totales,
            recompensa_kg_co2: r.kgco2_total,
            fecha_inicio: r.fecha_inicio,
            fecha_fin: r.fecha_fin,
            imagen_url: undefined, // Or check if DB has it
            created_at: r.created_at
        };
    }

    // --- Admin CRUD ---

    async createChallenge(reto: Partial<Reto>): Promise<any> {
        const { data, error } = await supabase
            .from('retos_semanales')
            .insert({
                nombre: reto.titulo,
                descripcion: reto.descripcion,
                categoria: reto.categoria,
                puntos_totales: reto.recompensa_puntos,
                kgco2_total: reto.recompensa_kg_co2,
                fecha_inicio: reto.fecha_inicio,
                fecha_fin: reto.fecha_fin,
                activo: (reto as any).activo ?? true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateChallenge(id: string, reto: Partial<Reto>): Promise<any> {
        const updates: any = {};
        if (reto.titulo) updates.nombre = reto.titulo;
        if (reto.descripcion) updates.descripcion = reto.descripcion;
        if (reto.categoria) updates.categoria = reto.categoria;
        if (reto.recompensa_puntos !== undefined) updates.puntos_totales = reto.recompensa_puntos;
        if (reto.recompensa_kg_co2 !== undefined) updates.kgco2_total = reto.recompensa_kg_co2;
        if (reto.fecha_inicio) updates.fecha_inicio = reto.fecha_inicio;
        if (reto.fecha_fin) updates.fecha_fin = reto.fecha_fin;
        if ((reto as any).activo !== undefined) updates.activo = (reto as any).activo;

        const { data, error } = await supabase
            .from('retos_semanales')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteChallenge(id: string): Promise<void> {
        const { error } = await supabase
            .from('retos_semanales')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async createTask(task: Partial<RetoTarea>): Promise<any> {
        const { data, error } = await supabase
            .from('retos_semanales_tareas')
            .insert({
                reto_semanal_id: task.reto_id,
                nombre: task.titulo,
                descripcion: task.descripcion,
                puntos: task.recompensa_puntos,
                kgco2: task.recompensa_kg_co2,
                dia_orden: task.dia_orden
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async updateTask(id: string, task: Partial<RetoTarea>): Promise<any> {
        const updates: any = {};
        if (task.titulo) updates.nombre = task.titulo;
        if (task.descripcion) updates.descripcion = task.descripcion;
        if (task.recompensa_puntos !== undefined) updates.puntos = task.recompensa_puntos;
        if (task.recompensa_kg_co2 !== undefined) updates.kgco2 = task.recompensa_kg_co2;
        if (task.dia_orden !== undefined) updates.dia_orden = task.dia_orden;

        const { data, error } = await supabase
            .from('retos_semanales_tareas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteTask(id: string): Promise<void> {
        const { error } = await supabase
            .from('retos_semanales_tareas')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

