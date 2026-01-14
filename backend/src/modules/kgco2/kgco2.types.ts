export interface KgCo2Log {
    id: string;
    user_id: string;
    kg_co2: number;
    origen: 'mision' | 'reto' | 'post' | 'comentario' | 'tarea_reto' | 'reto_completado';
    referencia_id?: string;
    created_at: string;
}
