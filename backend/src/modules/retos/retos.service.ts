import { RetosRepository } from './retos.repository';
import { PuntosService } from '../puntos/puntos.service';
import { KgCo2Service } from '../kgco2/kgco2.service';
import { UserStatsService } from '../user-stats/user-stats.service';
import { ApiError } from '../../utils/ApiError';

export class RetosService {
    private repository: RetosRepository;
    private puntosService: PuntosService;
    private kgCo2Service: KgCo2Service;
    private userStatsService: UserStatsService;

    constructor() {
        this.repository = new RetosRepository();
        this.puntosService = new PuntosService();
        this.kgCo2Service = new KgCo2Service();
        this.userStatsService = new UserStatsService();
    }

    async getAllChallenges() {
        return this.repository.findAllChallenges();
    }

    async getActiveChallengesWithStatus(userId: string) {
        const now = new Date();
        // 1. Get Active Challenges (Available to join or active)
        const activeRetos = await this.repository.findActiveChallenges();

        // 2. Get User's Joined Challenges (History)
        const userRetos = await this.repository.getAllUserChallenges(userId);

        // 3. Find challenges that user joined but are NOT in the active list (e.g. Expired)
        const activeIds = new Set(activeRetos.map(r => r.id));
        const missingRetoIds = userRetos
            .map(ur => ur.reto_id)
            .filter(id => !activeIds.has(id));

        const extraRetos = await this.repository.getChallengesByIds(missingRetoIds);

        // 4. Combine Lists
        const allRelevantRetos = [...activeRetos, ...extraRetos];

        // Remove duplicates if any (though logic above should prevent it)
        const uniqueRetosMap = new Map();
        allRelevantRetos.forEach(r => uniqueRetosMap.set(r.id, r));
        const finalRetos = Array.from(uniqueRetosMap.values());

        const results = [];

        for (const reto of finalRetos) {
            let userReto = userRetos.find(ur => ur.reto_id === reto.id);
            const tasks = await this.repository.getTasksByChallengeId(reto.id);
            let userTasks: any[] = [];

            if (userReto) {
                userTasks = await this.repository.getUserTasksByChallenge(userReto.id);
            }

            const totalTasks = tasks.length;
            const completedCount = userTasks.filter(ut => ut.completado).length;
            const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

            if (userReto) {
                // --- LAZY EXPIRATION & RECOVERY CHECK ---
                // Set end of day for fairness (Local Time)
                const endDate = new Date(`${reto.fecha_fin}T23:59:59.999`);

                // Check if last day's task is completed
                const maxDay = tasks.length > 0 ? Math.max(...tasks.map(t => t.dia_orden)) : 0;
                const lastDayTask = tasks.find(t => t.dia_orden === maxDay);
                const isLastTaskDone = lastDayTask ? userTasks.some(ut => ut.tarea_id === lastDayTask.id && ut.completado) : false;

                if (now > endDate || isLastTaskDone) {
                    // Time has passed OR last task is done
                    if (userReto.estado === 'joined' && completedCount < totalTasks) {
                        // Should be expired
                        await this.repository.updateChallengeProgress(userId, reto.id, completedCount, 'expired');
                        userReto.estado = 'expired';
                    }
                } else {
                    // Time has NOT passed AND last task NOT done (Challenge is active)
                    if (userReto.estado === 'expired') {
                        // RECOVERY: It was marked expired but conditions are still valid (likely timezone recovery)
                        await this.repository.updateChallengeProgress(userId, reto.id, completedCount, 'joined');
                        userReto.estado = 'joined';
                    }
                }
            }

            results.push({
                ...reto,
                joined: !!userReto,
                status: userReto?.estado,
                // Client expects 'progress' to be percentage (0-100)
                progress: progressPercent,
                // Detailed Breakdown
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

        // Sort: Active/Joined first, then Expired? Or just keep original sort (created_at desc usually)
        // Repo returns sorted by created_at. Merging might mess it slightly if extraRetos are older.
        // Let's sort results by fecha_inicio descending (newest first)
        return results.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime());
    }

    async joinChallenge(userId: string, retoId: string) {
        const reto = await this.repository.getChallengeById(retoId);
        if (!reto) throw new ApiError(404, 'Reto no encontrado');

        const now = new Date();
        const start = new Date(`${reto.fecha_inicio}T00:00:00.000`);
        const end = new Date(`${reto.fecha_fin}T23:59:59.999`);

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
        const { RachasService } = await import('../rachas/rachas.service');
        const rachasService = new RachasService();
        await rachasService.updateStreak(userId);

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
            const end = new Date(`${reto.fecha_fin}T23:59:59.999`);
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
        const { RachasService } = await import('../rachas/rachas.service');
        const rachasService = new RachasService();
        await rachasService.updateStreak(userId);

        // 7. Check Challenge Completion & Update Progress
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
