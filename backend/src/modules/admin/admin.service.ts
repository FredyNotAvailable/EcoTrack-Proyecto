import { supabase } from '../../config/supabaseClient';
import { ApiError } from '../../utils/ApiError';
import { ProfileRepository } from '../profile/profile.repository';
import { UserStatsRepository } from '../user-stats/user-stats.repository';
import { MisionesRepository } from '../misiones/misiones.repository';
import { DailyMission } from '../misiones/misiones.types';
import { RetosRepository } from '../retos/retos.repository';
import { Reto, RetoTarea } from '../retos/retos.types';
import { NivelesRepository } from '../niveles/niveles.repository';
import { Nivel } from '../niveles/niveles.types';
import { NivelesService } from '../niveles/niveles.service';

export class AdminService {
    private static instance: AdminService;
    private profileRepo = ProfileRepository.getInstance();
    private statsRepo = new UserStatsRepository();
    private misionesRepo = MisionesRepository.getInstance();
    private retosRepo = RetosRepository.getInstance();
    private nivelesRepo = NivelesRepository.getInstance();

    static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    async getUsers() {
        // 1. Obtener usuarios de Supabase Auth
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
        if (authError) throw authError;

        // 2. Obtener todos los perfiles
        const profiles = await this.profileRepo.getAllProfiles();

        // 3. Obtener todos los stats (para puntos y nivel)
        const { data: stats, error: statsError } = await supabase
            .from('user_stats')
            .select('*');

        // 4. Combinar datos
        return authUsers.map(authUser => {
            const profile = profiles.find(p => p.id === authUser.id);
            const userStats = stats?.find(s => s.user_id === authUser.id);

            return {
                id: authUser.id,
                email: authUser.email,
                username: profile?.username || 'Sin nombre',
                role: profile?.role || (authUser.app_metadata?.role as string) || 'user',
                status: profile?.status || 'active',
                avatar_url: profile?.avatar_url,
                puntos: userStats?.puntos_totales || 0,
                nivel: userStats?.nivel || 1,
                created_at: authUser.created_at,
                last_sign_in: authUser.last_sign_in_at
            };
        });
    }

    async createUser(userData: any) {
        const { email, password, username, role, status, full_name } = userData;

        // 1. Crear en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-12),
            email_confirm: true,
            user_metadata: { role, full_name, username }
        });

        if (authError) throw authError;

        const userId = authData.user.id;

        try {
            // 2. Crear Perfil en DB
            const profile = await this.profileRepo.create({
                id: userId,
                username,
                role,
                status
            });

            // 3. Inicializar Stats
            await this.statsRepo.createStats(userId);

            return { ...authData.user, profile };
        } catch (error) {
            console.error('[AdminService] Error during user creation cleanup:', error);
            // Rollback partial creation
            await supabase.auth.admin.deleteUser(userId);
            throw error;
        }
    }

    async updateUser(userId: string, updateData: any) {
        const { email, password, username, role, status } = updateData;

        // 1. Actualizar Auth si hay cambios sensibles
        const authUpdates: any = {};
        if (email) authUpdates.email = email;
        if (password) authUpdates.password = password;

        // Sincronizar role en metadata de Auth (importante para authMiddleware)
        if (role) authUpdates.user_metadata = { role };

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
            if (authError) throw authError;
        }

        // 2. Actualizar Perfil en DB
        const profileUpdates: any = {};
        if (username) profileUpdates.username = username;
        if (role) profileUpdates.role = role;
        if (status) profileUpdates.status = status;

        if (Object.keys(profileUpdates).length > 0) {
            return await this.profileRepo.update(userId, profileUpdates);
        }

        return { message: 'Actualizado exitosamente' };
    }

    async deleteUser(userId: string) {
        // hard delete from Auth (Cascade triggers deletion in profile and stats)
        const { error } = await supabase.auth.admin.deleteUser(userId);
        if (error) throw error;
        return { success: true };
    }

    async updateStatus(userId: string, status: string) {
        return await this.profileRepo.update(userId, { status });
    }

    async getUserDetails(userId: string) {
        const [
            profile,
            stats,
            racha,
            kgCo2Logs,
            puntosLogs,
            misiones,
            retosSemanales,
            retosTareas,
            posts
        ] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', userId).single(),
            supabase.from('user_stats').select('*').eq('user_id', userId).single(),
            supabase.from('user_rachas').select('*').eq('user_id', userId).single(),
            supabase.from('kgco2_logs').select('id, user_id, kg_co2, origen, referencia_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('puntos_logs').select('id, user_id, puntos, origen, referencia_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('misiones_usuario').select('*, misiones_diarias!inner(*)').eq('user_id', userId).order('created_at', { ascending: false }),
            supabase.from('usuarios_retos_semanales').select('id, user_id, reto_semanal_id, estado, progreso, started_at, completed_at, retos_semanales!inner(id, nombre, descripcion, puntos_totales, kgco2_total, fecha_inicio, fecha_fin, retos_semanales_tareas(id, nombre, descripcion, puntos, kgco2, dia_orden))').eq('user_id', userId).order('started_at', { ascending: false }),
            supabase.from('usuarios_retos_tareas').select('id, user_reto_id, tarea_id, completado, completed_at, retos_semanales_tareas!inner(id, nombre, descripcion, puntos, kgco2)').order('completed_at', { ascending: false }),
            supabase.from('posts').select(`
                id, descripcion, ubicacion, hashtags, is_public, is_reported, created_at, updated_at,
                media:post_media(id, media_url, media_type, position),
                likes_count:post_likes(count),
                comments_count:post_comments(count)
            `).eq('user_id', userId).order('created_at', { ascending: false })
        ]);

        console.log('=== ADMIN getUserDetails DEBUG ===');
        console.log('User ID:', userId);
        console.log('kgCo2Logs.data:', kgCo2Logs.data);
        console.log('kgCo2Logs.error:', kgCo2Logs.error);
        console.log('retosSemanales.data:', retosSemanales.data);
        console.log('retosSemanales.error:', retosSemanales.error);
        console.log('===================================');

        const result = {
            profile: profile.data,
            stats: stats.data,
            racha: racha.data,
            logs: {
                co2: kgCo2Logs.data || [],
                puntos: puntosLogs.data || []
            },
            misiones: misiones.data || [],
            retos: {
                semanales: retosSemanales.data || [],
                tareas_completadas: retosTareas.data || []
            },
            posts: posts.data?.map((p: any) => ({
                ...p,
                media: (p.media || []).sort((a: any, b: any) => (a.position - b.position)),
                likes: p.likes_count?.[0]?.count || 0,
                comments: p.comments_count?.[0]?.count || 0
            })) || []
        };

        console.log('getUserDetails - CO2 logs count:', kgCo2Logs.data?.length || 0);
        console.log('getUserDetails - Puntos logs count:', puntosLogs.data?.length || 0);
        console.log('getUserDetails - Posts count:', posts.data?.length || 0);
        console.log('getUserDetails - Posts data:', posts.data);
        console.log('getUserDetails - Posts error:', posts.error);

        return result;
    }

    async updateUserRole(userId: string, newRole: string): Promise<void> {
        // 1. Update role in Supabase Auth metadata
        const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: { role: newRole }
        });
        if (authError) throw authError;

        // 2. Update role in the profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);
        if (profileError) throw profileError;
    }

    // --- Post Moderation ---

    async getPosts() {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                id, descripcion, ubicacion, hashtags, is_public, is_reported, created_at,
                user:profiles(username, avatar_url),
                media:post_media(media_url, media_type),
                likes_count:post_likes(count),
                comments_count:post_comments(count)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((post: any) => ({
            ...post,
            likes: post.likes_count?.[0]?.count || 0,
            comments: post.comments_count?.[0]?.count || 0,
            media: post.media?.[0] || null // Simplificado para la tabla admin
        }));
    }

    async deletePost(id: string) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    async dismissReport(id: string) {
        const { error } = await supabase
            .from('posts')
            .update({ is_reported: false })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    // --- Mission Management ---

    async getMissions() {
        return await this.misionesRepo.findAll();
    }

    async createMission(mission: Partial<DailyMission>) {
        return await this.misionesRepo.create(mission);
    }

    async updateMission(id: string, mission: Partial<DailyMission>) {
        return await this.misionesRepo.update(id, mission);
    }

    async deleteMission(id: string) {
        await this.misionesRepo.delete(id);
        return { success: true };
    }

    // --- Challenge Management ---

    async getChallenges() {
        return await this.retosRepo.findAllChallenges();
    }

    async createChallenge(reto: Partial<Reto>) {
        return await this.retosRepo.createChallenge(reto);
    }

    async updateChallenge(id: string, reto: Partial<Reto>) {
        return await this.retosRepo.updateChallenge(id, reto);
    }

    async deleteChallenge(id: string) {
        await this.retosRepo.deleteChallenge(id);
        return { success: true };
    }

    // --- Task Management ---

    async getTasks(retoId: string) {
        return await this.retosRepo.getTasksByChallengeId(retoId);
    }

    async createTask(task: Partial<RetoTarea>) {
        if (!task.reto_id) throw new ApiError(400, 'ID del reto es obligatorio');

        const existingTasks = await this.retosRepo.getTasksByChallengeId(task.reto_id);
        if (existingTasks.length >= 5) {
            throw new ApiError(400, 'Un reto solo puede tener un máximo de 5 tareas (Lunes a Viernes)');
        }

        return await this.retosRepo.createTask(task);
    }

    async updateTask(id: string, task: Partial<RetoTarea>) {
        return await this.retosRepo.updateTask(id, task);
    }

    async deleteTask(id: string) {
        await this.retosRepo.deleteTask(id);
        return { success: true };
    }

    // --- Level Management ---

    async getLevels() {
        return await this.nivelesRepo.getAll();
    }

    async createLevel(level: Nivel) {
        const levels = await this.nivelesRepo.getAll();
        const maxLevel = levels.length > 0 ? Math.max(...levels.map(l => l.nivel)) : 0;
        const expectedLevel = maxLevel + 1;

        if (level.nivel !== expectedLevel) {
            throw new ApiError(400, `El siguiente nivel debe ser el ${expectedLevel}. No se pueden saltar niveles.`);
        }

        // Check ascending points
        const prevLevel = levels.find(l => l.nivel === maxLevel);
        if (prevLevel && level.puntos_minimos <= prevLevel.puntos_minimos) {
            throw new ApiError(400, `Los puntos deben ser superiores a los del nivel ${prevLevel.nivel} (${prevLevel.puntos_minimos} pts).`);
        }

        const result = await this.nivelesRepo.create(level);
        NivelesService.getInstance().clearCache();
        return result;
    }

    async updateLevel(nivel: number, updates: Partial<Nivel>) {
        if (updates.puntos_minimos !== undefined) {
            const levels = await this.nivelesRepo.getAll();
            const prevLevel = [...levels].reverse().find(l => l.nivel < nivel);
            const nextLevel = levels.find(l => l.nivel > nivel);

            if (prevLevel && updates.puntos_minimos <= prevLevel.puntos_minimos) {
                throw new ApiError(400, `Los puntos deben ser mayores a ${prevLevel.puntos_minimos} pts (Nivel ${prevLevel.nivel}).`);
            }

            if (nextLevel && updates.puntos_minimos >= nextLevel.puntos_minimos) {
                throw new ApiError(400, `Los puntos deben ser menores a ${nextLevel.puntos_minimos} pts (Nivel ${nextLevel.nivel}).`);
            }
        }

        const result = await this.nivelesRepo.update(nivel, updates);
        NivelesService.getInstance().clearCache();
        return result;
    }

    async deleteLevel(nivel: number) {
        await this.nivelesRepo.delete(nivel);
        NivelesService.getInstance().clearCache();
        return { success: true };
    }
}
