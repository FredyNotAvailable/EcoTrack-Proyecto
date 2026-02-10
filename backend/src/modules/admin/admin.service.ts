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
import { NotificationsService } from '../notifications/notifications.service';

export class AdminService {
    private notificationsService = NotificationsService.getInstance();
    private consejosRepo = require('../consejos/consejos.repository').ConsejosRepository.getInstance();
    // --- Daily Tips Management ---
    async getDailyTips() {
        return await this.consejosRepo.findAll();
    }

    async getDashboardStats() {
        // 1. Impacto Ambiental Global y Niveles
        const { data: statsData, error: impactError } = await supabase
            .from('user_stats')
            .select('kg_co2_ahorrado, puntos_totales, misiones_diarias_completadas, retos_completados, nivel');

        if (impactError) throw impactError;

        const totals = (statsData || []).reduce((acc, curr) => ({
            co2Total: acc.co2Total + (Number(curr.kg_co2_ahorrado) || 0),
            puntosTotal: acc.puntosTotal + (curr.puntos_totales || 0),
            misionesCompletadas: acc.misionesCompletadas + (curr.misiones_diarias_completadas || 0),
            retosCompletados: acc.retosCompletados + (curr.retos_completados || 0)
        }), { co2Total: 0, puntosTotal: 0, misionesCompletadas: 0, retosCompletados: 0 });

        const levelGroups = {
            principiante: statsData?.filter(s => s.nivel <= 3).length || 0,
            intermedio: statsData?.filter(s => s.nivel > 3 && s.nivel <= 6).length || 0,
            experto: statsData?.filter(s => s.nivel > 6).length || 0
        };

        // 2. Usuarios y Crecimiento
        const { count: totalUsers, error: usersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (usersError) throw usersError;

        const { count: newUsersMonth, error: newUsersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        // 3. Actividad de Comunidad
        const { count: totalPosts, error: postsError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true });

        const { count: reportedPosts, error: reportedError } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('is_reported', true);

        // 4. Actividad Reciente (Últimos logs de CO2)
        const { data: recentLogs, error: logsError } = await supabase
            .from('kgco2_logs')
            .select(`
                id, 
                kg_co2, 
                origen, 
                created_at,
                user:profiles(username, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        return {
            impacto: totals,
            usuarios: {
                total: totalUsers || 0,
                nuevosMes: newUsersMonth || 0
            },
            comunidad: {
                posts: totalPosts || 0,
                reportados: reportedPosts || 0
            },
            niveles: levelGroups,
            actividadReciente: recentLogs || []
        };
    }

    async createDailyTip(tip: Partial<import('../consejos/consejos.types').DailyTip>) {
        const { data, error } = await supabase
            .from('consejos_diarios')
            .insert([tip])
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async updateDailyTip(id: string, tip: Partial<import('../consejos/consejos.types').DailyTip>) {
        const { data, error } = await supabase
            .from('consejos_diarios')
            .update(tip)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteDailyTip(id: string) {
        const { error } = await supabase
            .from('consejos_diarios')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return { success: true };
    }
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
                id, descripcion, ubicacion, hashtags, is_public, is_reported, status, created_at,
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

    async getPostDetails(id: string) {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                id, descripcion, ubicacion, hashtags, is_public, is_reported, status, created_at, updated_at,
                user:profiles(username, avatar_url),
                media:post_media(media_url, media_type, position),
                comments:post_comments(
                    id,
                    content,
                    created_at,
                    user:profiles(username, avatar_url)
                ),
                likes_count:post_likes(count)
            `)
            .eq('id', id)
            .order('created_at', { foreignTable: 'post_comments', ascending: true })
            .single();

        if (error) throw error;

        return {
            ...data,
            likes: data.likes_count?.[0]?.count || 0,
            media: (data.media || []).sort((a: any, b: any) => a.position - b.position)
        };
    }

    async deletePost(id: string) {
        const { error } = await supabase
            .from('posts')
            .update({ status: 'blocked' })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    async dismissReport(id: string) {
        // Legacy: Update post flag
        const { error } = await supabase
            .from('posts')
            .update({ is_reported: false })
            .eq('id', id);

        if (error) throw error;
        return { success: true };
    }

    async getPostReports() {
        const { data, error } = await supabase
            .from('post_reports')
            .select(`
                id,
                post_id,
                reporter_id,
                reason,
                details,
                status,
                created_at,
                reporter:profiles!reporter_id(username, avatar_url),
                post:posts!post_id(
                    id,
                    descripcion, 
                    is_public,
                    is_reported,
                    status,
                    media:post_media(media_url, media_type),
                    user:profiles!user_id(username, avatar_url)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to cleaner structure
        return data.map((report: any) => ({
            ...report,
            post_preview: {
                ...report.post,
                media: report.post?.media?.[0] || null
            }
        }));
    }

    async resolveReport(reportId: string, action: 'dismiss' | 'delete_post' | 'review') {
        const { data: report } = await supabase.from('post_reports').select('post_id, reason').eq('id', reportId).single();
        if (!report) throw new Error('Reporte no encontrado');

        if (action === 'delete_post') {
            if (report.post_id) {
                // 1. Obtener datos del post para notificar al autor
                const { data: post } = await supabase.from('posts').select('user_id').eq('id', report.post_id).single();

                // 2. Bloquear el post
                await this.deletePost(report.post_id);
                await supabase.from('post_reports').update({ status: 'resolved' }).eq('id', reportId);

                // 3. Notificar al autor
                if (post) {
                    await this.notificationsService.notifyModeration(
                        post.user_id,
                        'Publicación Bloqueada',
                        `Tu publicación fue retirada por nuestro equipo de moderación debido a: ${report.reason === 'other' ? 'incumplimiento de normas' : report.reason}.`,
                        report.post_id
                    );
                }
            }
        } else if (action === 'review') {
            await supabase.from('post_reports').update({ status: 'reviewed' }).eq('id', reportId);
        } else {
            await supabase.from('post_reports').update({ status: 'dismissed' }).eq('id', reportId);

            const { count } = await supabase
                .from('post_reports')
                .select('*', { count: 'exact', head: true })
                .eq('post_id', report.post_id)
                .in('status', ['pending', 'reviewed']);

            if (count === 0) {
                await supabase.from('posts').update({ is_reported: false }).eq('id', report.post_id);
            }
        }
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
