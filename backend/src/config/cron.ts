import cron from 'node-cron';
import { expireOldRetos } from '../modules/retos/retos.cron';
import { rotateDailyMissions } from '../modules/misiones/misiones.cron';

export const initCrons = () => {
  // Ejecutar inmediatamente al iniciar el servidor para limpiar retos vencidos
  expireOldRetos().catch(err => console.error('[CRON] Error en ejecución inicial:', err));

  // Ejecutar rotación de misiones diarias al iniciar
  rotateDailyMissions().catch(err => console.error('[CRON] Error en rotación inicial de misiones diarias:', err));

  // Tarea programada: todos los viernes a las 23:59 (zona horaria Ecuador)
  cron.schedule('59 23 * * 5', expireOldRetos, {
    timezone: "America/Guayaquil"
  });

  // Tarea adicional: verificar diariamente a medianoche por si algún reto se pasó
  cron.schedule('0 0 * * *', expireOldRetos, {
    timezone: "America/Guayaquil"
  });

  // Rotar misiones diarias cada día a la medianoche
  cron.schedule('0 0 * * *', rotateDailyMissions, {
    timezone: "America/Guayaquil"
  });

  console.log('✅ Cron jobs inicializados (expiración de retos: viernes 23:59 + diario 00:00, rotación de misiones diarias: 00:00).');
};
