export interface DailyMission {
    id: string;
    titulo: string;
    descripcion: string;
    eco_tip?: string;
    impacto?: string;
    kg_co2_ahorrado?: number;
    puntos: number;
    dificultad?: string;
    categoria: 'energia' | 'agua' | 'transporte' | 'residuos';
    activa: boolean;
    created_at: string;
}
