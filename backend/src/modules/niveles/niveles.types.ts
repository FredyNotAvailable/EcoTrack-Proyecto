export interface Nivel {
    id: string;
    nivel: number;
    titulo: string;
    puntos_minimos: number;
    created_at?: string;
}

export interface LevelProgress {
    nivel: number;
    titulo: string;
    puntos_actuales_totales: number;
    puntos_nivel_actual: number; // Base points for current level
    puntos_siguiente_nivel: number | null; // Null if max level
    experiencia_relativa: number; // Points earned within this level
    progreso_porcentaje: number; // 0-100
}
