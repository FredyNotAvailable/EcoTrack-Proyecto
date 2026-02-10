import { supabase } from '../../config/supabaseClient';
import { UserStats } from './user-stats.types';
import { ApiError } from '../../utils/ApiError';

export class UserStatsRepository {
    async getStats(userId: string): Promise<UserStats | null> {
        const { data, error } = await supabase
            .from('user_stats')
            .select('user_id, puntos_totales, nivel, experiencia, kg_co2_ahorrado, retos_completados, misiones_diarias_completadas, posts_creados, comentarios_creados, likes_recibidos, ultimo_evento, updated_at')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user stats:', error);
            throw new ApiError(500, 'Error fetching user stats');
        }

        return data as UserStats | null;
    }

    async createStats(userId: string, initialData: Partial<UserStats> = {}): Promise<UserStats> {
        const { data, error } = await supabase
            .from('user_stats')
            .insert({
                user_id: userId,
                ...initialData
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating user stats:', error);
            throw new ApiError(500, 'Error creating user stats');
        }

        return data as UserStats;
    }

    async updateStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
        const { data, error } = await supabase
            .from('user_stats')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating user stats:', error);
            throw new ApiError(500, 'Error updating user stats');
        }

        return data as UserStats;
    }

    async getGlobalStats(): Promise<{ total_co2: number; total_users: number }> {
        const { data, error } = await supabase
            .from('user_stats')
            .select('kg_co2_ahorrado');

        const { count, error: countError } = await supabase
            .from('user_stats')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching global stats:', error);
            return { total_co2: 0, total_users: 0 };
        }

        const total = data.reduce((sum, row) => sum + (Number(row.kg_co2_ahorrado) || 0), 0);
        return {
            total_co2: total,
            total_users: count || 0
        };
    }
    async getLeaderboard(limit: number, period: string = 'global'): Promise<any[]> {
        // 1. Fetch top stats (fetch more to account for admins that will be filtered)
        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('user_id, puntos_totales, kg_co2_ahorrado, nivel, retos_completados, misiones_diarias_completadas')
            .order('puntos_totales', { ascending: false })
            .limit(limit * 2);

        if (error) {
            console.error('Error fetching leaderboard stats:', error);
            throw new ApiError(500, 'Error fetching leaderboard');
        }

        if (!stats || stats.length === 0) return [];

        // 2. Fetch profiles for these users (including role to filter admins)
        const userIds = stats.map(s => s.user_id);
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, role')
            .in('id', userIds);

        if (profilesError) {
            console.error('Error fetching leaderboard profiles:', profilesError);
            throw new ApiError(500, 'Error fetching leaderboard profiles');
        }

        // 3. Create a map of non-admin profiles
        const profilesMap = new Map(
            profiles
                ?.filter(p => p.role !== 'admin')
                .map(p => [p.id, { id: p.id, username: p.username, avatar_url: p.avatar_url }])
        );

        // 4. Merge data and filter out admins, then limit to requested amount
        return stats
            .filter((stat: any) => profilesMap.has(stat.user_id))
            .slice(0, limit)
            .map((stat: any) => ({
                ...stat,
                user: profilesMap.get(stat.user_id) || null
            }));
    }
}
