import { Request, Response } from 'express';
import { UserStatsService } from './user-stats.service';
import { ApiError } from '../../utils/ApiError';

export class UserStatsController {
    private service: UserStatsService;

    constructor() {
        this.service = new UserStatsService();
    }

    getStats = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id; // Auth middleware populates this
            // We expose a public getStats but simplified or just for the user.
            // Since repo already has getStats(userId), let's use it.
            // Note: service wrapper might be needed if logic is specialized, 
            // but for now repository.getStats is practically what we need, 
            // except the service probably exposes it or we can call repo via service.

            // Wait, does service have getStats?
            // Checking service... it has update methods but not a simple get.
            // Let's add getStats to service or use repo directly here.
            // Best practice: Controller -> Service -> Repository.
            // So we should add getStats to Service.

            const stats = await this.service.getStats(userId);
            res.json(stats);
        } catch (error) {
            console.error('Error in getStats controller:', error);
            if (error instanceof ApiError) {
                res.status(error.statusCode).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Internal Server Error' });
            }
        }
    };
    getGlobalStats = async (req: Request, res: Response) => {
        try {
            const stats = await this.service.getGlobalStats();
            res.json(stats);
        } catch (error) {
            console.error('Error in getGlobalStats controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    getLeaderboard = async (req: Request, res: Response) => {
        try {
            const limit = req.query.limit ? Number(req.query.limit) : 50;
            const period = req.query.period as 'global' | 'day' | 'week' | 'month' || 'global';

            const leaderboard = await this.service.getLeaderboard(limit, period);
            res.json(leaderboard);
        } catch (error) {
            console.error('Error in getLeaderboard controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    getStatsById = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            const stats = await this.service.getStats(userId);
            if (!stats) {
                res.status(404).json({ error: 'Stats not found' });
                return;
            }
            res.json(stats);
        } catch (error) {
            console.error('Error in getStatsById controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
