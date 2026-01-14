import { supabase } from '../config/supabaseClient';
import { NivelesService } from '../modules/niveles/niveles.service';

async function syncUserStats() {
    console.log('Starting User Stats Synchronization...');

    const nivelesService = new NivelesService();

    // 1. Fetch all users (from profiles as proxy for users)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
    }

    console.log(`Found ${profiles.length} users to sync.`);

    for (const profile of profiles) {
        const userId = profile.id;
        console.log(`Syncing user: ${userId}`);

        try {
            // --- Aggregations ---

            // 1. Misiones Completadas
            const { count: misionesCount, error: misionesError } = await supabase
                .from('misiones_usuario')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (misionesError) throw misionesError;

            // 2. Kg CO2 Ahorrado (Sum from kgco2_logs)
            // Note: Supabase JS client doesn't support sum() directly on select easily without RPC or fetching all data.
            // Fetching all data might be heavy if lots of logs. 
            // Better approach: use .select('kg_co2') and reduce in JS (acceptable for now) or create RPC.
            // We will fetch kg_co2 column.
            const { data: co2Logs, error: co2Error } = await supabase
                .from('kgco2_logs')
                .select('kg_co2')
                .eq('user_id', userId);

            if (co2Error) throw co2Error;
            const totalCo2 = co2Logs.reduce((sum, log) => sum + Number(log.kg_co2), 0);

            // 3. Puntos Totales
            const { data: pointsLogs, error: pointsError } = await supabase
                .from('puntos_logs')
                .select('puntos')
                .eq('user_id', userId);

            if (pointsError) throw pointsError;
            const totalPoints = pointsLogs.reduce((sum, log) => sum + log.puntos, 0);

            // 4. Posts Creados
            const { count: postsCount, error: postsError } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (postsError) throw postsError;

            // 5. Comentarios Creados
            const { count: commentsCount, error: commentsError } = await supabase
                .from('post_comments')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (commentsError) throw commentsError;

            // 6. Likes Recibidos (on user's posts)
            // Need to join posts and post_likes.
            // Or fetch user's posts IDs and then count likes for those IDs.
            const { data: userPosts, error: userPostsError } = await supabase
                .from('posts')
                .select('id')
                .eq('user_id', userId);

            if (userPostsError) throw userPostsError;

            let totalLikes = 0;
            if (userPosts.length > 0) {
                const postIds = userPosts.map(p => p.id);
                const { count: likesCount, error: likesError } = await supabase
                    .from('post_likes')
                    .select('*', { count: 'exact', head: true })
                    .in('post_id', postIds);

                if (likesError) throw likesError;
                totalLikes = likesCount || 0;
            }

            // 7. Retos Completados
            const { count: retosCount, error: retosError } = await supabase
                .from('usuarios_retos_semanales')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('estado', 'completed');

            if (retosError) throw retosError;

            // 8. Calculate Level
            const progress = await nivelesService.calculateProgress(totalPoints);


            // --- Upsert into user_stats ---
            const statsData = {
                user_id: userId,
                puntos_totales: totalPoints,
                nivel: progress.nivel,
                experiencia: progress.experiencia_relativa,
                kg_co2_ahorrado: totalCo2,
                misiones_diarias_completadas: misionesCount || 0,
                retos_completados: retosCount || 0,
                posts_creados: postsCount || 0,
                comentarios_creados: commentsCount || 0,
                likes_recibidos: totalLikes,
                updated_at: new Date().toISOString()
            };

            const { error: upsertError } = await supabase
                .from('user_stats')
                .upsert(statsData);

            if (upsertError) {
                console.error(`Error updating stats for user ${userId}:`, upsertError);
            } else {
                console.log(`Successfully synced stats for user ${userId}`);
            }

        } catch (err) {
            console.error(`Failed to process user ${userId}:`, err);
        }
    }

    console.log('Synchronization complete.');
}

// Check if running directly
if (require.main === module) {
    syncUserStats().catch(console.error);
}
