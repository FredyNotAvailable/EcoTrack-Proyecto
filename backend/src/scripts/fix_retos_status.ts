import { supabase } from '../config/supabaseClient';

async function fixRetosStatus() {
    console.log('--- Starting Challenge Status Fix ---');

    // 1. Get all "joined" challenges
    const { data: userRetos, error: userRetosError } = await supabase
        .from('usuarios_retos_semanales')
        .select('*')
        .eq('estado', 'joined');

    if (userRetosError) {
        console.error('Error fetching user retos:', userRetosError);
        return;
    }

    console.log(`Found ${userRetos.length} active challenges to check.`);

    for (const ur of userRetos) {
        const userId = ur.user_id;
        const retoId = ur.reto_semanal_id;

        // 2. Get all tasks for this challenge
        const { data: tasks, error: tasksError } = await supabase
            .from('retos_semanales_tareas')
            .select('*')
            .eq('reto_semanal_id', retoId);

        if (tasksError) {
            console.error(`Error fetching tasks for reto ${retoId}:`, tasksError);
            continue;
        }

        // 3. Get user's completed tasks
        const { data: userTasks, error: userTasksError } = await supabase
            .from('usuarios_retos_tareas')
            .select('*')
            .eq('user_reto_id', ur.id)
            .eq('completado', true);

        if (userTasksError) {
            console.error(`Error fetching user tasks for ${ur.id}:`, userTasksError);
            continue;
        }

        const totalTasks = tasks.length;
        const completedCount = userTasks.length;

        if (totalTasks === 0) continue;

        // 4. Check for perfect completion (already handled by service, but good to be sure)
        if (completedCount === totalTasks) {
            console.log(`[FIX] Challenge ${ur.id} is PERFECTLY COMPLETED. Updating status...`);
            await supabase
                .from('usuarios_retos_semanales')
                .update({ estado: 'completed', completed_at: new Date().toISOString() })
                .eq('id', ur.id);
            continue;
        }

        // 5. Check for "Finished" but not perfect (Last day task completed)
        const maxDay = Math.max(...tasks.map(t => t.dia_orden));
        const lastDayTasks = tasks.filter(t => t.dia_orden === maxDay);
        const finishedLastTask = lastDayTasks.some(lt => userTasks.some(ut => ut.tarea_id === lt.id));

        if (finishedLastTask) {
            console.log(`[FIX] Challenge ${ur.id} finished last task but incomplete (${completedCount}/${totalTasks}). Marking as EXPIRED.`);
            await supabase
                .from('usuarios_retos_semanales')
                .update({ estado: 'expired' })
                .eq('id', ur.id);
        }
    }

    console.log('--- Challenge Status Fix Complete ---');
}

if (require.main === module) {
    fixRetosStatus().catch(console.error);
}
