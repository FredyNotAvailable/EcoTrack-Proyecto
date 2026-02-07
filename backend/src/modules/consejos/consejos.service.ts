import { ConsejosRepository } from './consejos.repository';
import { DailyTip } from './consejos.types';
import { ApiError } from '../../utils/ApiError';
import { cacheService, CACHE_TTL, CACHE_KEYS } from '../../utils/cache';

export class ConsejosService {
    private static instance: ConsejosService;
    private repository: ConsejosRepository;

    constructor() {
        this.repository = ConsejosRepository.getInstance();
    }

    static getInstance(): ConsejosService {
        if (!ConsejosService.instance) {
            ConsejosService.instance = new ConsejosService();
        }
        return ConsejosService.instance;
    }

    async getDailyTip(): Promise<DailyTip> {
        // Get tips from cache or DB
        const tips = await cacheService.getOrSet(
            CACHE_KEYS.consejos(),
            () => this.repository.findAllActive(),
            CACHE_TTL.CONSEJOS
        );

        if (!tips || tips.length === 0) {
            throw new ApiError(404, 'No active tips found', 'NO_TIPS_AVAILABLE');
        }

        // Generate a deterministic index based on the current date (UTC)
        // This ensures all users see the same tip for the same day (UTC day)
        const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
        const hash = this.simpleHash(today);

        const index = Math.abs(hash) % tips.length;

        return tips[index];
    }

    // Simple string hashing function
    private simpleHash(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
}
