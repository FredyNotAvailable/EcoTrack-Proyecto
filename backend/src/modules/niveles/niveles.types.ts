export interface Nivel {
    nivel: number;
    puntos_minimos: number;
}

export interface LevelProgress {
    nivel: number;
    puntos_actuales_totales: number;
    puntos_nivel_actual: number; // Base points for current level
    puntos_siguiente_nivel: number | null; // Null if max level
    experiencia_relativa: number; // Points earned within this level
    progreso_porcentaje: number; // 0-100
}
