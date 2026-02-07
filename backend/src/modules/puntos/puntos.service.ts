import { PuntosRepository } from './puntos.repository';

export class PuntosService {
    private static instance: PuntosService;
    private repository: PuntosRepository;

    constructor() {
        this.repository = new PuntosRepository();
    }

    static getInstance(): PuntosService {
        if (!PuntosService.instance) {
            PuntosService.instance = new PuntosService();
        }
        return PuntosService.instance;
    }

    async logPoints(userId: string, puntos: number, origen: 'mision' | 'reto' | 'post' | 'comentario' | 'tarea_reto' | 'reto_completado', referenciaId?: string) {
        return this.repository.logPoints(userId, puntos, origen, referenciaId);
    }

    async getUserPoints(userId: string) {
        return this.repository.getUserPoints(userId);
    }
}
