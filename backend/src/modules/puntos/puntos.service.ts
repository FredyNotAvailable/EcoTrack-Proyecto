import { PuntosRepository } from './puntos.repository';

export class PuntosService {
    private repository: PuntosRepository;

    constructor() {
        this.repository = new PuntosRepository();
    }

    async logPoints(userId: string, puntos: number, origen: 'mision' | 'reto' | 'post' | 'comentario', referenciaId?: string) {
        return this.repository.logPoints(userId, puntos, origen, referenciaId);
    }

    async getUserPoints(userId: string) {
        return this.repository.getUserPoints(userId);
    }
}
