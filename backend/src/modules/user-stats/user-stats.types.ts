export interface UserStats {
    user_id: string;
    puntos_totales: number;
    nivel: number;
    experiencia: number;
    kg_co2_ahorrado: number;
    retos_completados: number;
    misiones_diarias_completadas: number;
    posts_creados: number;
    comentarios_creados: number;
    likes_recibidos: number;
    ultimo_evento?: string;
    updated_at: string;
}
