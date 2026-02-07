import { MisionesRepository } from './misiones.repository';
import { DailyMission } from './misiones.types';
import { ApiError } from '../../utils/ApiError';
import { cacheService, CACHE_TTL, CACHE_KEYS } from '../../utils/cache';
import { PuntosService } from '../puntos/puntos.service';
import { KgCo2Service } from '../kgco2/kgco2.service';
import { RachasService } from '../rachas/rachas.service';
import { UserStatsService } from '../user-stats/user-stats.service';
import crypto from 'crypto';

export class MisionesService {
    private static instance: MisionesService;
    private repository: MisionesRepository;
    private puntosService: PuntosService;
    private kgCo2Service: KgCo2Service;
    private rachasService: RachasService;
    private userStatsService: UserStatsService;

    constructor() {
        this.repository = MisionesRepository.getInstance();
        this.puntosService = PuntosService.getInstance();
        this.kgCo2Service = KgCo2Service.getInstance();
        this.rachasService = RachasService.getInstance();
        this.userStatsService = UserStatsService.getInstance();
    }

    static getInstance(): MisionesService {
        if (!MisionesService.instance) {
            MisionesService.instance = new MisionesService();
        }
        return MisionesService.instance;
    }

    private getHash(input: string): number {
        const hash = crypto.createHash('sha256').update(input).digest('hex');
        return parseInt(hash.substring(0, 8), 16);
    }

    async getDailyMissions(): Promise<DailyMission[]> {
        // Get missions from cache or DB
        const activeMissions = await cacheService.getOrSet(
            CACHE_KEYS.misiones(),
            () => this.repository.findAllActive(),
            CACHE_TTL.MISIONES
        );

        if (!activeMissions || activeMissions.length === 0) {
            throw new ApiError(404, 'No active missions found');
        }

        // Get current date string YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // Categories we want: 1 from each
        const categories: Array<DailyMission['categoria']> = ['energia', 'agua', 'transporte', 'residuos'];

        const selectedMissions: DailyMission[] = [];

        for (const cat of categories) {
            const missionsInCat = activeMissions.filter(m => m.categoria === cat);
            if (missionsInCat.length > 0) {
                // Pick one deterministically from this category
                const shuffled = missionsInCat.sort((a, b) => {
                    const hashA = this.getHash(`${today}-${a.id}`);
                    const hashB = this.getHash(`${today}-${b.id}`);
                    return hashA - hashB;
                });
                selectedMissions.push(shuffled[0]);
            }
        }

        return selectedMissions;
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
        const allMissions = await cacheService.getOrSet(
            CACHE_KEYS.misiones(),
            () => this.repository.findAllActive(),
            CACHE_TTL.MISIONES
        );
        const mission = allMissions.find(m => m.id === missionId);

        if (mission) {
            // Execute points, CO2, streak, and stats updates in parallel
            const promises: Promise<unknown>[] = [
                this.puntosService.logPoints(userId, mission.puntos, 'mision', mission.id),
                this.rachasService.updateStreak(userId),
                this.userStatsService.updateMissionStats(userId, mission.puntos, mission.kg_co2_ahorrado || 0)
            ];

            if (mission.kg_co2_ahorrado && mission.kg_co2_ahorrado > 0) {
                promises.push(this.kgCo2Service.logKgCo2(userId, mission.kg_co2_ahorrado, 'mision', mission.id));
            }

            await Promise.all(promises);
        }
    }
}
