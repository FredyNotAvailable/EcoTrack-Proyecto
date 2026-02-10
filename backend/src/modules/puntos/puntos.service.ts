import { PuntosRepository } from './puntos.repository';
import { NotificationsService } from '../notifications/notifications.service';

export class PuntosService {
    private notificationsService = NotificationsService.getInstance();
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
        const result = await this.repository.logPoints(userId, puntos, origen, referenciaId);

        // --- Notificar al usuario ---
        const messages: Record<string, string> = {
            mision: 'por completar una misión diaria.',
            reto: 'por participar en un reto.',
            post: 'por compartir tus acciones ecológicas.',
            comentario: 'por interactuar con la comunidad.',
            tarea_reto: 'por completar una tarea del reto semanal.',
            reto_completado: '¡Felicidades! Has completado el reto semanal.'
        };

        await this.notificationsService.notifyAchievement(
            userId,
            `+${puntos} Puntos ganados`,
            `Has ganado ${puntos} puntos ${messages[origen] || ''}`,
            referenciaId,
            origen === 'mision' ? 'mision' : (origen.includes('reto') ? 'challenge' : 'post')
        );

        return result;
    }

    async getUserPoints(userId: string) {
        return this.repository.getUserPoints(userId);
    }
}
