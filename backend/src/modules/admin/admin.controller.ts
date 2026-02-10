import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
    // --- Daily Tips Management ---
    getDailyTips = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tips = await this.service.getDailyTips();
            res.json(tips);
        } catch (error) {
            next(error);
        }
    };

    createDailyTip = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tip = await this.service.createDailyTip(req.body);
            res.status(201).json(tip);
        } catch (error) {
            next(error);
        }
    };

    updateDailyTip = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const tip = await this.service.updateDailyTip(id, req.body);
            res.json(tip);
        } catch (error) {
            next(error);
        }
    };

    getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await this.service.getDashboardStats();
            res.json(stats);
        } catch (error) {
            next(error);
        }
    };

    deleteDailyTip = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deleteDailyTip(id);
            res.json({ message: 'Consejo eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    };
    private service = AdminService.getInstance();

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.service.getUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.service.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.service.updateUser(id, req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deleteUser(id);
            res.json({ message: 'Usuario eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    };

    changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { status } = req.body;
            const user = await this.service.updateStatus(id, status);
            res.json(user);
        } catch (error) {
            next(error);
        }
    };

    getUserDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const details = await this.service.getUserDetails(id);
            res.json(details);
        } catch (error) {
            next(error);
        }
    };

    // --- Post Moderation ---

    getPosts = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const posts = await this.service.getPosts();
            res.json(posts);
        } catch (error) {
            next(error);
        }
    };

    deletePost = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deletePost(id);
            res.json({ message: 'Publicación eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    };

    getPostDetails = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const post = await this.service.getPostDetails(id);
            res.json(post);
        } catch (error) {
            next(error);
        }
    };

    dismissPostReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.dismissReport(id);
            res.json({ message: 'Reporte descartado correctamente' });
        } catch (error) {
            next(error);
        }
    };

    getPostReports = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reports = await this.service.getPostReports();
            res.json(reports);
        } catch (error) {
            next(error);
        }
    };

    resolvePostReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const { action } = req.body; // 'dismiss' | 'delete_post'
            await this.service.resolveReport(id, action);
            res.json({ message: 'Reporte resuelto correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // --- Mission Management ---

    getMissions = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const missions = await this.service.getMissions();
            res.json(missions);
        } catch (error) {
            next(error);
        }
    };

    createMission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const mission = await this.service.createMission(req.body);
            res.status(201).json(mission);
        } catch (error) {
            next(error);
        }
    };

    updateMission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const mission = await this.service.updateMission(id, req.body);
            res.json(mission);
        } catch (error) {
            next(error);
        }
    };

    deleteMission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deleteMission(id);
            res.json({ message: 'Misión eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // --- Challenge Management ---

    getChallenges = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const challenges = await this.service.getChallenges();
            res.json(challenges);
        } catch (error) {
            next(error);
        }
    };

    createChallenge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const challenge = await this.service.createChallenge(req.body);
            res.status(201).json(challenge);
        } catch (error) {
            next(error);
        }
    };

    updateChallenge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const challenge = await this.service.updateChallenge(id, req.body);
            res.json(challenge);
        } catch (error) {
            next(error);
        }
    };

    deleteChallenge = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deleteChallenge(id);
            res.json({ message: 'Reto eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // --- Task Management ---

    getTasks = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const retoId = req.params.retoId as string;
            const tasks = await this.service.getTasks(retoId);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    createTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const task = await this.service.createTask(req.body);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };

    updateTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const task = await this.service.updateTask(id, req.body);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    deleteTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.service.deleteTask(id);
            res.json({ message: 'Tarea eliminada correctamente' });
        } catch (error) {
            next(error);
        }
    };

    // --- Level Management ---

    getLevels = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const levels = await this.service.getLevels();
            res.json(levels);
        } catch (error) {
            next(error);
        }
    };

    createLevel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const level = await this.service.createLevel(req.body);
            res.status(201).json(level);
        } catch (error) {
            next(error);
        }
    };

    updateLevel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nivelStr = req.params.nivel as string;
            const nivel = parseInt(nivelStr);
            const level = await this.service.updateLevel(nivel, req.body);
            res.json(level);
        } catch (error) {
            next(error);
        }
    };

    deleteLevel = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const nivelStr = req.params.nivel as string;
            const nivel = parseInt(nivelStr);
            await this.service.deleteLevel(nivel);
            res.json({ message: 'Nivel eliminado correctamente' });
        } catch (error) {
            next(error);
        }
    };
}
