import { KgCo2Repository } from './kgco2.repository';

export class KgCo2Service {
    private repository: KgCo2Repository;

    constructor() {
        this.repository = new KgCo2Repository();
    }

    async logKgCo2(userId: string, amount: number, origin: 'mision' | 'reto' | 'post' | 'comentario' | 'tarea_reto' | 'reto_completado', referenceId?: string): Promise<void> {
        await this.repository.createLog({
            user_id: userId,
            kg_co2: amount,
            origen: origin,
            referencia_id: referenceId
        });
    }
}
