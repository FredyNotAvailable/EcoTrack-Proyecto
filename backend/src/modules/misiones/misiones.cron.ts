import { cacheService, CACHE_KEYS } from '../../utils/cache';

/**
 * Cron job para rotar las misiones diarias cada día a la medianoche.
 * Limpia el caché de misiones diarias para forzar nueva selección.
 */
export const rotateDailyMissions = async () => {
    try {
        console.log('[CRON] Rotando misiones diarias (limpiando caché)...');
        await cacheService.del(CACHE_KEYS.misiones());
        console.log('[CRON] Caché de misiones diarias limpiado.');
    } catch (error) {
        console.error('[CRON] Error al rotar misiones diarias:', error);
    }
};
