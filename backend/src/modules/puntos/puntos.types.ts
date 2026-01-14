export interface PuntosLog {
    id: string;
    user_id: string;
    puntos: number;
    origen: 'mision' | 'reto' | 'post' | 'comentario' | 'tarea_reto' | 'reto_completado';
    referencia_id?: string;
    created_at: string;
}
