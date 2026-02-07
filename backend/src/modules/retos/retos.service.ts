import { RetosRepository } from './retos.repository';
import { PuntosService } from '../puntos/puntos.service';
import { KgCo2Service } from '../kgco2/kgco2.service';
import { UserStatsService } from '../user-stats/user-stats.service';
import { RachasService } from '../rachas/rachas.service';
import { ApiError } from '../../utils/ApiError';
import { cacheService, CACHE_TTL, CACHE_KEYS } from '../../utils/cache';

export class RetosService {
    private static instance: RetosService;
    private repository: RetosRepository;
    private puntosService: PuntosService;
    private kgCo2Service: KgCo2Service;
    private userStatsService: UserStatsService;
    private rachasService: RachasService;

    constructor() {
        this.repository = RetosRepository.getInstance();
        this.puntosService = PuntosService.getInstance();
        this.kgCo2Service = KgCo2Service.getInstance();
        this.userStatsService = UserStatsService.getInstance();
        this.rachasService = RachasService.getInstance();
    }

    static getInstance(): RetosService {
        if (!RetosService.instance) {
            RetosService.instance = new RetosService();
        }
        return RetosService.instance;
    }

    async getAllChallenges() {
        return this.repository.findAllChallenges();
    }

    /**
     * Dado un fecha_fin (YYYY-MM-DD o ISO), retorna el viernes de esa semana en YYYY-MM-DD.
     * Los retos expiran el viernes a medianoche.
     */
    private getFridayDateStr(fechaFin: string): string {
        const datePart = fechaFin.substring(0, 10);
        const [y, m, d] = datePart.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        const dayOfWeek = date.getDay(); // 0=Dom, 5=Vie, 6=Sab

        if (dayOfWeek === 5) return datePart; // Ya es viernes

        let friday: Date;
        if (dayOfWeek === 6) {
            friday = new Date(y, m - 1, d - 1); // Sab → Vie
        } else if (dayOfWeek === 0) {
            friday = new Date(y, m - 1, d - 2); // Dom → Vie
        } else {
            // Lun(1)-Jue(4): avanzar al viernes de la misma semana
            friday = new Date(y, m - 1, d + (5 - dayOfWeek));
        }

        const fy = friday.getFullYear();
        const fm = String(friday.getMonth() + 1).padStart(2, '0');
        const fd = String(friday.getDate()).padStart(2, '0');
        return `${fy}-${fm}-${fd}`;
    }

    async getActiveChallengesWithStatus(userId: string) {
        const now = new Date();

        // Fecha local YYYY-MM-DD para comparaciones de fecha
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        
        // 1. Parallel fetch: Active Challenges (cached) + User's Joined Challenges
        const [activeRetos, userRetos] = await Promise.all([
            cacheService.getOrSet(
                CACHE_KEYS.retosActivos(),
                () => this.repository.findActiveChallenges(),
                CACHE_TTL.RETOS_ACTIVOS
            ),
            this.repository.getAllUserChallenges(userId)
        ]);

        // 2. Find challenges that user joined but are NOT in the active list (e.g. Expired)
        const activeIds = new Set(activeRetos.map(r => r.id));
        const missingRetoIds = userRetos
            .map(ur => ur.reto_id)
            .filter(id => !activeIds.has(id));

        const extraRetos = missingRetoIds.length > 0 
            ? await this.repository.getChallengesByIds(missingRetoIds)
            : [];

        // 3. Combine Lists and remove duplicates
        const uniqueRetosMap = new Map();
        [...activeRetos, ...extraRetos].forEach(r => uniqueRetosMap.set(r.id, r));
        const finalRetos = Array.from(uniqueRetosMap.values());

        // 4. BATCH: Get all tasks and user tasks in parallel (eliminates N+1)
        const retoIds = finalRetos.map(r => r.id);
        const userRetoIds = userRetos.map(ur => ur.id);
        
        const [allTasksMap, allUserTasksMap] = await Promise.all([
            this.repository.getTasksByMultipleChallengeIds(retoIds),
            this.repository.getUserTasksByMultipleChallengeIds(userRetoIds)
        ]);

        // 5. Build results without additional queries
        const results = [];
        const statusUpdates: Promise<void>[] = [];

        for (const reto of finalRetos) {
            let userReto = userRetos.find(ur => ur.reto_id === reto.id);
            const tasks = allTasksMap.get(reto.id) || [];
            const userTasks = userReto ? (allUserTasksMap.get(userReto.id) || []) : [];

            const totalTasks = tasks.length;
            const completedCount = userTasks.filter(ut => ut.completado).length;
            const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

            // Determinar si el reto ya expiró: el viernes de la semana de fecha_fin ya pasó
            const fridayStr = this.getFridayDateStr(reto.fecha_fin);
            const isExpiredByDate = fridayStr < todayStr;

            if (userReto) {
                // --- LAZY EXPIRATION CHECK ---
                const maxDay = tasks.length > 0 ? Math.max(...tasks.map(t => t.dia_orden)) : 0;
                const lastDayTask = tasks.find(t => t.dia_orden === maxDay);
                const isLastTaskDone = lastDayTask ? userTasks.some(ut => ut.tarea_id === lastDayTask.id && ut.completado) : false;

                if (isExpiredByDate || isLastTaskDone) {
                    // El reto ya venció o se completó la última tarea
                    if (userReto.estado === 'joined') {
                        if (completedCount === totalTasks && totalTasks > 0) {
                            // Todas las tareas completadas = reto completado
                            statusUpdates.push(this.repository.updateChallengeProgress(userId, reto.id, completedCount, 'completed'));
                            userReto.estado = 'completed';
                        } else {
                            // No se completaron todas = expirado
                            statusUpdates.push(this.repository.updateChallengeProgress(userId, reto.id, completedCount, 'expired'));
                            userReto.estado = 'expired';
                        }
                    }
                }
                // NOTA: Ya no revertimos 'expired' a 'joined'. Una vez expirado, se queda expirado.
            }

            results.push({
                ...reto,
                joined: !!userReto,
                status: userReto?.estado || (isExpiredByDate ? 'expired' : undefined),
                progress: progressPercent,
                total_tasks: totalTasks,
                completed_tasks: completedCount,
                percent: progressPercent,
                tasks: tasks.map(t => {
                    const ut = userTasks.find(ut => ut.tarea_id === t.id);
                    return {
                        ...t,
                        completed: ut?.completado || false,
                        current_progress: ut?.progreso_actual || 0
                    };
                })
            });
        }

        // Execute any status updates in parallel (non-blocking for response)
        if (statusUpdates.length > 0) {
            Promise.all(statusUpdates).catch(console.error);
        }

        return results.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
    }

    async joinChallenge(userId: string, retoId: string) {
        const reto = await this.repository.getChallengeById(retoId);
        if (!reto) throw new ApiError(404, 'Reto no encontrado');

        const now = new Date();
        const start = new Date(`${reto.fecha_inicio}T00:00:00.000`);
        
        // Los retos expiran el viernes a medianoche
        const fridayStr = this.getFridayDateStr(reto.fecha_fin);
        const [fy, fm, fd] = fridayStr.split('-').map(Number);
        const end = new Date(fy, fm - 1, fd, 23, 59, 59, 999);

        if (now < start) {
            throw new ApiError(400, 'Este reto aún no ha comenzado');
        }
        if (now > end) {
            throw new ApiError(400, 'Este reto ha expirado');
        }

        const existing = await this.repository.getUserChallenge(userId, retoId);
        if (existing) {
            throw new ApiError(400, 'Ya te has unido a este reto');
        }
        const result = await this.repository.joinChallenge(userId, retoId);

        // Update Streak (Racha)
        await this.rachasService.updateStreak(userId);

        return result;
    }

    async completeTask(userId: string, retoId: string, taskId: string) {
        // 1. Validate participation
        const userReto = await this.repository.getUserChallenge(userId, retoId);
        if (!userReto) {
            throw new ApiError(400, 'Debes unirte al reto primero');
        }

        if (userReto.estado === 'expired') {
            throw new ApiError(400, 'El reto ha expirado y no se pueden completar más tareas.');
        }

        if (userReto.estado === 'completed') {
            // Already completed the whole challenge? Usually allowed to finish remaining tasks?
            // "completed" means progress == total. So usually no tasks left.
            // But if logic allows extra tasks? Assuming no extra tasks for now.
        }

        // 2. Get Task details
        const tasks = await this.repository.getTasksByChallengeId(retoId);
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new ApiError(404, 'Tarea no encontrada');

        // Check if challenge is effectively expired by time but not yet status-updated
        const now = new Date();
        const reto = await this.repository.getChallengeById(retoId);
        if (reto) {
            const fridayStr = this.getFridayDateStr(reto.fecha_fin);
            const [fy, fm, fd] = fridayStr.split('-').map(Number);
            const end = new Date(fy, fm - 1, fd, 23, 59, 59, 999);
            if (now > end && userReto.estado !== 'completed') {
                // It is expired. Update and block.
                await this.repository.updateChallengeProgress(userId, retoId, userReto.progreso, 'expired');
                throw new ApiError(400, 'El reto ha expirado.');
            }
        }

        // 3. Check if already completed
        let userTask = await this.repository.getUserTask(userReto.id, taskId);
        if (userTask?.completado) {
            // Already completed
            return userTask;
        }

        if (!userTask) {
            userTask = await this.repository.createUserTask(userReto.id, taskId);
        }

        // 4. Mark complete locally
        const updatedTask = await this.repository.updateUserTask(userReto.id, taskId, {
            completado: true,
            fecha_completado: new Date().toISOString(),
            progreso_actual: task.cantidad_meta
        });

        // 5. Award Points & CO2 for Task
        if (task.recompensa_puntos > 0) {
            await this.puntosService.logPoints(userId, task.recompensa_puntos, 'tarea_reto', taskId);
        }
        if (task.recompensa_kg_co2 > 0) {
            await this.kgCo2Service.logKgCo2(userId, task.recompensa_kg_co2, 'tarea_reto', taskId);
        }

        // 6. Update Stats
        await this.userStatsService.updateChallengeStats(userId, task.recompensa_puntos, task.recompensa_kg_co2);

        // 7. Update Streak (Racha)
        await this.rachasService.updateStreak(userId);

        // 8. Check Challenge Completion & Update Progress
        // Force refresh of userReto to get current progress? No, calculate locally?
        // Better to query DB or recalc. checkChallengeCompletion does it.
        await this.checkChallengeCompletion(userId, retoId, tasks, taskId);

        return updatedTask;
    }

    private async checkChallengeCompletion(userId: string, retoId: string, allTasks: any[], completedTaskId: string) {
        const userReto = await this.repository.getUserChallenge(userId, retoId);
        if (!userReto) return;

        const userTasks = await this.repository.getUserTasksByChallenge(userReto.id);

        // Count how many tasks are completed
        const completedCount = userTasks.filter(ut => ut.completado).length;
        const totalCount = allTasks.length;

        // Start with current status
        let status: 'joined' | 'completed' | 'expired' = userReto.estado;

        if (completedCount === totalCount && totalCount > 0) {
            if (userReto.estado !== 'completed') {
                status = 'completed';

                // --- CHALLENGE COMPLETE REWARDS ---
                const reto = await this.repository.getChallengeById(retoId);
                if (reto) {
                    // Award Bonus
                    if (reto.recompensa_puntos > 0) {
                        await this.puntosService.logPoints(userId, reto.recompensa_puntos, 'reto_completado', reto.id);
                    }
                    if (reto.recompensa_kg_co2 > 0) {
                        await this.kgCo2Service.logKgCo2(userId, reto.recompensa_kg_co2, 'reto_completado', reto.id);
                    }
                    await this.userStatsService.updateChallengeStats(userId, reto.recompensa_puntos, reto.recompensa_kg_co2);
                }
            }
        } else {
            // Not completed. Check if we just finished one of the LAST day's tasks
            const maxDay = Math.max(...allTasks.map(t => t.dia_orden));
            const completedTask = allTasks.find(t => t.id === completedTaskId);

            if (completedTask && completedTask.dia_orden === maxDay && status !== 'completed' && status !== 'expired') {
                // User finished a last-day task but didn't complete all tasks
                status = 'expired';
            }
        }

        // Update DB with new progress (count) and status
        await this.repository.updateChallengeProgress(userId, retoId, completedCount, status);
    }
}
