import { NivelesRepository } from './niveles.repository';
import { Nivel, LevelProgress } from './niveles.types';

export class NivelesService {
    private repository: NivelesRepository;
    private cachedLevels: Nivel[] | null = null;
    private lastCacheTime: number = 0;
    private CACHE_TTL = 1000 * 60 * 60; // 1 hour

    constructor() {
        this.repository = new NivelesRepository();
    }

    async getAllLevels(): Promise<Nivel[]> {
        const now = Date.now();
        if (this.cachedLevels && (now - this.lastCacheTime < this.CACHE_TTL)) {
            return this.cachedLevels;
        }

        const levels = await this.repository.getAll();
        this.cachedLevels = levels;
        this.lastCacheTime = now;
        return levels;
    }

    async calculateProgress(currentPoints: number): Promise<LevelProgress> {
        const levels = await this.getAllLevels();

        // 1. Find current level
        // Iterate backwards
        let currentLevelIdx = 0;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (currentPoints >= levels[i].puntos_minimos) {
                currentLevelIdx = i;
                break;
            }
        }

        const currentLevel = levels[currentLevelIdx];
        const nextLevel = levels[currentLevelIdx + 1] || null;

        // 2. Calculate relative experience
        // Exp relative = Total Points - Current Level Min Points
        const experiencia_relativa = currentPoints - currentLevel.puntos_minimos;

        // 3. Calculate Percentage
        let progreso_porcentaje = 0;
        let puntos_siguiente_nivel: number | null = null;
        let puntos_nivel_actual = currentLevel.puntos_minimos;

        if (nextLevel) {
            puntos_siguiente_nivel = nextLevel.puntos_minimos;
            const pointsNeededForNext = nextLevel.puntos_minimos - currentLevel.puntos_minimos;
            if (pointsNeededForNext > 0) {
                progreso_porcentaje = Math.round((experiencia_relativa / pointsNeededForNext) * 100);
            } else {
                progreso_porcentaje = 100; // Should not happen ideally
            }
        } else {
            // Max level
            progreso_porcentaje = 100;
        }

        return {
            nivel: currentLevel.nivel,
            titulo: currentLevel.titulo || `Nivel ${currentLevel.nivel}`,
            puntos_actuales_totales: currentPoints,
            puntos_nivel_actual,
            puntos_siguiente_nivel,
            experiencia_relativa,
            progreso_porcentaje
        };
    }

    // Keep for backward compat or just alias
    async calculateLevel(currentPoints: number): Promise<Nivel> {
        const progress = await this.calculateProgress(currentPoints);
        const levels = await this.getAllLevels();
        return levels.find(l => l.nivel === progress.nivel) as Nivel;
    }
}
