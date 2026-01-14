import { MisionesRepository } from './misiones.repository';
import { DailyMission } from './misiones.types';
import { ApiError } from '../../utils/ApiError';
import crypto from 'crypto';

export class MisionesService {
    private repository: MisionesRepository;

    constructor() {
        this.repository = new MisionesRepository();
    }

    private getHash(input: string): number {
        const hash = crypto.createHash('sha256').update(input).digest('hex');
        return parseInt(hash.substring(0, 8), 16);
    }

    async getDailyMissions(): Promise<DailyMission[]> {
        const activeMissions = await this.repository.findAllActive();

        if (!activeMissions || activeMissions.length === 0) {
            throw new ApiError(404, 'No active missions found');
        }

        // Get current date string YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Sort missions deterministically based on date + mission ID
        const shuffled = activeMissions.sort((a, b) => {
            const hashA = this.getHash(`${today}-${a.id}`);
            const hashB = this.getHash(`${today}-${b.id}`);
            return hashA - hashB;
        });

        // Return top 5
        return shuffled.slice(0, 5);
    }

    async getCompletedMissions(userId: string): Promise<string[]> {
        return this.repository.getCompletedMissions(userId);
    }

    async completeMission(userId: string, missionId: string): Promise<void> {
        // 1. Verify availability (optional, as DB fk handles exist check, but we could check if it's in today's set)

        // 2. Mark as completed
        await this.repository.completeMission(userId, missionId);

        // 3. Fetch mission details to get points
        // NOTE: Ideally we should fetch this from DB or cache. For now we might need a getById in repo.
        // Or, we assume frontend sends types, but backend must verify.
        // Let's verify by fetching all active strategies or just fetching the specific mission.
        // Since we don't have getById, let's add it or hack it by finding in active.
        // Better approach: Add getById to Repository. But for now, let's use findAllActive and find.
        const allMissions = await this.repository.findAllActive();
        const mission = allMissions.find(m => m.id === missionId);

        if (mission) {
            // 4. Log points
            const { PuntosService } = await import('../puntos/puntos.service');
            const puntosService = new PuntosService();
            await puntosService.logPoints(userId, mission.puntos, 'mision', mission.id);

            // 5. Log KgCO2
            if (mission.kg_co2_ahorrado && mission.kg_co2_ahorrado > 0) {
                const { KgCo2Service } = await import('../kgco2/kgco2.service');
                const kgCo2Service = new KgCo2Service();
                await kgCo2Service.logKgCo2(userId, mission.kg_co2_ahorrado, 'mision', mission.id);
            }

            // 6. Update Streak (Racha)
            const { RachasService } = await import('../rachas/rachas.service');
            const rachasService = new RachasService();
            await rachasService.updateStreak(userId);

            // 7. Update User Stats
            const { UserStatsService } = await import('../user-stats/user-stats.service');
            const userStatsService = new UserStatsService();
            await userStatsService.updateMissionStats(userId, mission.puntos, mission.kg_co2_ahorrado || 0);
        }
    }
}
