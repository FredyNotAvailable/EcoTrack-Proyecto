import { UserStatsRepository } from './user-stats.repository';
import { NivelesService } from '../niveles/niveles.service';
import { UserStats } from './user-stats.types';

export class UserStatsService {
    private repository: UserStatsRepository;
    private nivelesService: NivelesService;

    constructor() {
        this.repository = new UserStatsRepository();
        this.nivelesService = new NivelesService();
    }

    async getGlobalStats(): Promise<{ total_co2: number; total_users: number }> {
        return this.repository.getGlobalStats();
    }

    async getLeaderboard(limit: number = 50, period: 'global' | 'day' | 'week' | 'month' = 'global'): Promise<any[]> {
        return this.repository.getLeaderboard(limit, period);
    }

    async getStats(userId: string): Promise<any> {
        const stats = await this.getOrCreateStats(userId);
        const progress = await this.nivelesService.calculateProgress(stats.puntos_totales);
        return { ...stats, progress };
    }

    private async getOrCreateStats(userId: string): Promise<UserStats> {
        const stats = await this.repository.getStats(userId);
        if (stats) return stats;
        return this.repository.createStats(userId);
    }

    private async updateLevel(stats: UserStats): Promise<Partial<UserStats>> {
        const progress = await this.nivelesService.calculateProgress(stats.puntos_totales);

        return {
            nivel: progress.nivel,
            experiencia: progress.experiencia_relativa
        };
    }

    async updateMissionStats(userId: string, points: number, kgCo2: number = 0): Promise<void> {
        const stats = await this.getOrCreateStats(userId);

        const newPoints = stats.puntos_totales + points;
        const newKgCo2 = (Number(stats.kg_co2_ahorrado) || 0) + kgCo2;
        const newMissions = stats.misiones_diarias_completadas + 1;

        // Calculate potential new level
        const levelData = await this.updateLevel({ ...stats, puntos_totales: newPoints });

        await this.repository.updateStats(userId, {
            puntos_totales: newPoints,
            kg_co2_ahorrado: newKgCo2,
            misiones_diarias_completadas: newMissions,
            ultimo_evento: new Date().toISOString(),
            ...levelData
        });
    }

    async updatePostStats(userId: string, points: number): Promise<void> {
        const stats = await this.getOrCreateStats(userId);

        const newPoints = stats.puntos_totales + points;
        const newPosts = stats.posts_creados + 1;
        const levelData = await this.updateLevel({ ...stats, puntos_totales: newPoints });

        await this.repository.updateStats(userId, {
            puntos_totales: newPoints,
            posts_creados: newPosts,
            ultimo_evento: new Date().toISOString(),
            ...levelData
        });
    }

    async updateCommentStats(userId: string, points: number): Promise<void> {
        const stats = await this.getOrCreateStats(userId);

        const newPoints = stats.puntos_totales + points;
        const newComments = stats.comentarios_creados + 1;
        const levelData = await this.updateLevel({ ...stats, puntos_totales: newPoints });

        await this.repository.updateStats(userId, {
            puntos_totales: newPoints,
            comentarios_creados: newComments,
            ultimo_evento: new Date().toISOString(),
            ...levelData
        });
    }

    async updateLikeStats(userId: string, increment: boolean): Promise<void> {
        const stats = await this.getOrCreateStats(userId);

        const newLikes = stats.likes_recibidos + (increment ? 1 : -1);

        // Likes don't give points directly here (usually), but if they did we'd add it.
        // Assuming just stats for now.

        await this.repository.updateStats(userId, {
            likes_recibidos: Math.max(0, newLikes),
            ultimo_evento: new Date().toISOString()
        });
    }
    async updateChallengeStats(userId: string, points: number, kgCo2: number = 0, isChallengeCompleted: boolean = false): Promise<void> {
        const stats = await this.getOrCreateStats(userId);

        const newPoints = stats.puntos_totales + points;
        const newKgCo2 = (Number(stats.kg_co2_ahorrado) || 0) + kgCo2;
        const newRetos = stats.retos_completados + (isChallengeCompleted ? 1 : 0);

        const levelData = await this.updateLevel({ ...stats, puntos_totales: newPoints });

        await this.repository.updateStats(userId, {
            puntos_totales: newPoints,
            kg_co2_ahorrado: newKgCo2,
            retos_completados: newRetos,
            ultimo_evento: new Date().toISOString(),
            ...levelData
        });
    }
}
