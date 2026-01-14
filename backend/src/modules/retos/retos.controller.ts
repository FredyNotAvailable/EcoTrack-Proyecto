import { Request, Response } from 'express';
import { RetosService } from './retos.service';

export class RetosController {
    private service: RetosService;

    constructor() {
        this.service = new RetosService();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const retos = await this.service.getAllChallenges();
            res.json(retos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    getMyChallenges = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const retos = await this.service.getActiveChallengesWithStatus(userId);
            res.json(retos);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    };

    join = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { id } = req.params as { id: string };
            const result = await this.service.joinChallenge(userId, id);
            res.json(result);
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    };

    completeTask = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { retoId, taskId } = req.params as { retoId: string; taskId: string };
            const result = await this.service.completeTask(userId, retoId, taskId);
            res.json(result);
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    };
}
