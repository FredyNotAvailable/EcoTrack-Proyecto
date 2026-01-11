import { RetosRepository } from './retos.repository';

export class RetosService {
    private repository = new RetosRepository();

    async findAll() {
        return this.repository.getAll();
    }

    async join(userId: string, retoId: string) {
        return this.repository.addParticipant(userId, retoId);
    }
}
