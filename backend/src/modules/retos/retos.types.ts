export interface Reto {
    id: string;
    titulo: string;
    descripcion: string;
    categoria: 'energia' | 'agua' | 'transporte' | 'residuos';
    fecha_inicio: string;
    fecha_fin: string;
    recompensa_puntos: number;
    recompensa_kg_co2: number;
    imagen_url?: string;
    created_at: string;
}

export interface RetoTarea {
    id: string;
    reto_id: string;
    titulo: string;
    descripcion: string;
    recompensa_puntos: number;
    recompensa_kg_co2: number;
    tipo: 'manual' | 'post' | 'event';
    cantidad_meta: number;
    dia_orden: number;
}

export interface UserReto {
    id: string;
    user_id: string;
    reto_id: string;
    estado: 'joined' | 'completed';
    progreso: number;
    fecha_union: string;
    fecha_completado?: string;
    reto?: Reto; // Joined relation
}

export interface UserRetoTarea {
    id: string;
    user_id: string;
    reto_id: string;
    tarea_id: string;
    completado: boolean;
    progreso_actual: number;
    fecha_completado?: string;
}
