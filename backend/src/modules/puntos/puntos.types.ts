export interface PuntosLog {
    id: string;
    user_id: string;
    puntos: number;
    origen: 'mision' | 'reto' | 'post' | 'comentario';
    referencia_id?: string;
    created_at: string;
}
