import { Request, Response, NextFunction } from 'express';
import { MisionesService } from './misiones.service';

const misionesService = new MisionesService();

export const getDailyMissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const missions = await misionesService.getDailyMissions();
        res.json(missions);
    } catch (error) {
        next(error);
    }
};

export const getCompletedMissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found');
        const completed = await misionesService.getCompletedMissions(req.user.id);
        res.json(completed);
    } catch (error) {
        next(error);
    }
};

export const completeMission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new Error('User not found');
        const { id } = req.params;
        await misionesService.completeMission(req.user.id, id as string);
        res.json({ success: true, message: 'Mission completed' });
    } catch (error) {
        next(error);
    }
};
