import { Request, Response, NextFunction } from 'express';
import { RetosService } from './retos.service';

export class RetosController {
    private service = new RetosService();

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const retos = await this.service.findAll();
            res.status(200).json({ success: true, data: retos });
        } catch (error) {
            next(error);
        }
    };

    joinChallenge = async (req: any, res: Response, next: NextFunction) => {
        try {
            const { retoId } = req.body;
            const userId = req.user.id; // Obtenido del middleware de auth
            const result = await this.service.join(userId, retoId);
            res.status(201).json({ success: true, message: 'Usuario unido al reto', data: result });
        } catch (error) {
            next(error);
        }
    };
}
