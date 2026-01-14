
import { Request, Response } from 'express';
import { RachasService } from './rachas.service';

export class RachasController {
    private service: RachasService;

    constructor() {
        this.service = new RachasService();
    }

    getRacha = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const racha = await this.service.getRacha(userId);

            if (!racha) {
                // Return zeros if no racha yet
                return res.json({
                    racha_actual: 0,
                    racha_maxima: 0,
                    ultima_fecha: null
                });
            }

            res.json(racha);
        } catch (error) {
            console.error('Error getting racha:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
