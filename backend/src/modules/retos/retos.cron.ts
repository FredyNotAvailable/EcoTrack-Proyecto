import { supabase } from "../../config/supabaseClient";
import { cacheService, CACHE_KEYS } from "../../utils/cache";

/**
 * Dado un fecha_fin (string ISO o YYYY-MM-DD), retorna el viernes
 * de esa semana en formato YYYY-MM-DD.
 * Si el input es null/undefined, retorna '9999-12-31' (nunca expira).
 */
function getFridayDateStr(fechaFin: string | null | undefined): string {
    if (!fechaFin) return '9999-12-31';
    // Extraer solo la parte de fecha YYYY-MM-DD
    const datePart = fechaFin.substring(0, 10);
    const [y, m, d] = datePart.split('-').map(Number);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return '9999-12-31';
    
    const date = new Date(y, m - 1, d);
    const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun, ..., 5=Vie, 6=Sab

    let friday: Date;
    if (dayOfWeek === 5) {
        // Ya es viernes
        friday = date;
    } else if (dayOfWeek === 6) {
        // Sábado → retroceder 1 día
        friday = new Date(y, m - 1, d - 1);
    } else if (dayOfWeek === 0) {
        // Domingo → retroceder 2 días
        friday = new Date(y, m - 1, d - 2);
    } else {
        // Lun(1)-Jue(4) → avanzar al viernes de esa semana
        friday = new Date(y, m - 1, d + (5 - dayOfWeek));
    }

    const fy = friday.getFullYear();
    const fm = String(friday.getMonth() + 1).padStart(2, '0');
    const fd = String(friday.getDate()).padStart(2, '0');
    return `${fy}-${fm}-${fd}`;
}

/**
 * Cron job que expira los retos de usuarios cuyo viernes de expiración ya pasó.
 * Los retos expiran el viernes a medianoche (hora Ecuador).
 */
export const expireOldRetos = async () => {
    console.log('[CRON] Ejecutando: Expirar retos vencidos...');

    try {
        // Fecha actual en formato YYYY-MM-DD (hora local del servidor)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        console.log(`[CRON] Fecha actual (local): ${todayStr}`);

        // 1. Desactivar retos globales cuya fecha_fin ya pasó
        const { data: allActiveRetos, error: activeError } = await supabase
            .from('retos_semanales')
            .select('id, nombre, fecha_fin, activo')
            .eq('activo', true);

        if (activeError) {
            console.error('[CRON] Error obteniendo retos activos:', activeError);
        } else {
            console.log(`[CRON] Retos activos encontrados: ${allActiveRetos?.length || 0}`);
            const retosToDeactivate = (allActiveRetos || []).filter(r => getFridayDateStr(r.fecha_fin) < todayStr);
            console.log(`[CRON] Retos a desactivar (viernes < ${todayStr}):`, retosToDeactivate.map(r => `${r.nombre} (fin: ${r.fecha_fin}, viernes: ${getFridayDateStr(r.fecha_fin)})`));

            if (retosToDeactivate.length > 0) {
                const deactivateIds = retosToDeactivate.map(r => r.id);
                const { error: deactivateError } = await supabase
                    .from('retos_semanales')
                    .update({ activo: false })
                    .in('id', deactivateIds);

                if (deactivateError) {
                    console.error('[CRON] Error desactivando retos globales:', deactivateError);
                } else {
                    console.log(`[CRON] Desactivados ${deactivateIds.length} retos globales.`);
                }
            }
        }

        // 2. Obtener todos los retos de usuarios que aún están en 'joined'
        const { data: userRetos, error: fetchError } = await supabase
            .from('usuarios_retos_semanales')
            .select('id, reto_semanal_id, estado')
            .eq('estado', 'joined');

        if (fetchError) {
            console.error('[CRON] Error obteniendo usuarios_retos_semanales:', fetchError);
            return;
        }

        console.log(`[CRON] Registros de usuarios con estado 'joined': ${userRetos?.length || 0}`);

        if (!userRetos || userRetos.length === 0) {
            console.log('[CRON] No hay retos de usuarios con estado "joined" para expirar.');
            // Limpiar caché de todos modos
            cacheService.del(CACHE_KEYS.retosActivos());
            return;
        }

        // 3. Obtener los IDs únicos de retos para consultar sus fechas
        const retoIds = [...new Set(userRetos.map(ur => ur.reto_semanal_id))];

        const { data: retos, error: retosError } = await supabase
            .from('retos_semanales')
            .select('id, nombre, fecha_fin')
            .in('id', retoIds);

        if (retosError) {
            console.error('[CRON] Error obteniendo retos_semanales:', retosError);
            return;
        }

        console.log(`[CRON] Retos asociados:`, (retos || []).map(r => `${r.nombre} (fin: ${r.fecha_fin}, viernes: ${getFridayDateStr(r.fecha_fin)})`));

        // 4. Identificar qué retos ya expiraron (viernes de la semana < hoy)
        const expiredRetoIds = new Set(
            (retos || [])
                .filter(r => getFridayDateStr(r.fecha_fin) < todayStr)
                .map(r => r.id)
        );

        console.log(`[CRON] Retos expirados por fecha: ${expiredRetoIds.size}`);

        if (expiredRetoIds.size === 0) {
            console.log('[CRON] Ningún reto ha expirado por fecha.');
            cacheService.del(CACHE_KEYS.retosActivos());
            return;
        }

        // 5. Filtrar los registros de usuario que deben expirar
        const userRetoIdsToExpire = userRetos
            .filter(ur => expiredRetoIds.has(ur.reto_semanal_id))
            .map(ur => ur.id);

        if (userRetoIdsToExpire.length === 0) {
            console.log('[CRON] No hay retos de usuarios para expirar.');
            cacheService.del(CACHE_KEYS.retosActivos());
            return;
        }

        // 6. Actualizar en lotes
        const batchSize = 100;
        let totalUpdated = 0;

        for (let i = 0; i < userRetoIdsToExpire.length; i += batchSize) {
            const batch = userRetoIdsToExpire.slice(i, i + batchSize);
            const { error: updateError } = await supabase
                .from('usuarios_retos_semanales')
                .update({ estado: 'expired' })
                .in('id', batch);

            if (updateError) {
                console.error(`[CRON] Error actualizando lote ${i / batchSize + 1}:`, updateError);
            } else {
                totalUpdated += batch.length;
            }
        }

        console.log(`[CRON] Expirados ${totalUpdated} retos de usuarios.`);

        // 7. Limpiar caché de retos activos para que la próxima consulta traiga datos frescos
        cacheService.del(CACHE_KEYS.retosActivos());
        console.log('[CRON] Caché de retos activos limpiado.');
    } catch (err) {
        console.error('[CRON] Error inesperado en expireOldRetos:', err);
    }
};
