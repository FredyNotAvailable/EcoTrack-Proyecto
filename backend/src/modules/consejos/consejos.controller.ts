import { Request, Response, NextFunction } from 'express';
import { ConsejosService } from './consejos.service';

const consejosService = new ConsejosService();

export const getDailyQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tip = await consejosService.getDailyTip();
        res.json(tip);
    } catch (error) {
        next(error);
    }
};
