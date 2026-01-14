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
        const activeRetos = await this.repository.findActiveChallenges();
        const results = [];

        for (const reto of activeRetos) {
            const userReto = await this.repository.getUserChallenge(userId, reto.id);
            const tasks = await this.repository.getTasksByChallengeId(reto.id);

            // Calculate progress if joined
            let userTasks: any[] = [];
            if (userReto) {
                userTasks = await this.repository.getUserTasksByChallenge(userId, reto.id);
            }

            results.push({
                ...reto,
                joined: !!userReto,
                status: userReto?.estado,
                progress: userReto?.progreso || 0,
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
        return results;
    }

    async joinChallenge(userId: string, retoId: string) {
        const existing = await this.repository.getUserChallenge(userId, retoId);
        if (existing) {
            throw new ApiError(400, 'Ya te has unido a este reto');
        }
        return this.repository.joinChallenge(userId, retoId);
    }

    async completeTask(userId: string, retoId: string, taskId: string) {
        // 1. Validate participation
        const userReto = await this.repository.getUserChallenge(userId, retoId);
        if (!userReto) {
            throw new ApiError(400, 'Debes unirte al reto primero');
        }

        // 2. Get Task details
        const tasks = await this.repository.getTasksByChallengeId(retoId);
        const task = tasks.find(t => t.id === taskId);
        if (!task) throw new ApiError(404, 'Tarea no encontrada');

        // 3. Check if already completed
        let userTask = await this.repository.getUserTask(userId, taskId);
        if (userTask?.completado) {
            // Already completed
            return userTask;
        }

        if (!userTask) {
            userTask = await this.repository.createUserTask(userId, retoId, taskId);
        }

        // 4. Mark complete locally
        const updatedTask = await this.repository.updateUserTask(userId, taskId, {
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

        // 7. Check Challenge Completion & Update Progress
        await this.checkChallengeCompletion(userId, retoId, tasks);

        return updatedTask;
    }

    private async checkChallengeCompletion(userId: string, retoId: string, allTasks: any[]) {
        const userTasks = await this.repository.getUserTasksByChallenge(userId, retoId);

        // Count how many tasks are completed
        const completedCount = userTasks.filter(ut => ut.completado).length;
        const totalCount = allTasks.length;

        // Calculate percentage
        const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

        let status: 'joined' | 'completed' = 'joined';

        if (completedCount === totalCount && totalCount > 0) {
            // Only mark completed if not already completed (to avoid double rewards)
            const userReto = await this.repository.getUserChallenge(userId, retoId);
            if (userReto && userReto.estado !== 'completed') {
                status = 'completed';

                // --- CHALLENGE COMPLETE REWARDS ---
                const reto = await this.repository.getChallengeById(retoId);
                if (reto) {
                    // Award Bonus
                    if (reto.recompensa_puntos > 0) {
                        await this.puntosService.logPoints(userId, reto.recompensa_puntos, 'reto_completado', retoId);
                    }
                    if (reto.recompensa_kg_co2 > 0) {
                        await this.kgCo2Service.logKgCo2(userId, reto.recompensa_kg_co2, 'reto_completado', retoId);
                    }

                    // Stats for Challenge Completion
                    await this.userStatsService.updateChallengeStats(userId, reto.recompensa_puntos, reto.recompensa_kg_co2, true); // true = challenge completed
                }
            } else if (userReto && userReto.estado === 'completed') {
                status = 'completed'; // Remain completed
            }
        }

        await this.repository.updateChallengeProgress(userId, retoId, progressPercent, status);
    }
}
