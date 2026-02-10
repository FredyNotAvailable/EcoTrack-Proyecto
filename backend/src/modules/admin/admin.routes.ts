import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authMiddleware, requireRole } from '../../middlewares/auth.middleware';
import {
    validateBody,
    adminUserSchema,
    updateAdminUserSchema,
    changeStatusSchema,
    missionSchema,
    updateMissionSchema,
    challengeSchema,
    updateChallengeSchema,
    taskSchema,
    updateTaskSchema,
    levelSchema,
    updateLevelSchema
} from '../../utils/validators';

const router = Router();
const controller = new AdminController();

// Todas las rutas de administración requieren ser ADMIN
router.use(authMiddleware);
router.use(requireRole(['admin']));

// Rutas de gestión de usuarios
router.get('/users', controller.getUsers);
router.post('/users', validateBody(adminUserSchema), controller.createUser);
router.put('/users/:id', validateBody(updateAdminUserSchema), controller.updateUser);
router.patch('/users/:id/status', validateBody(changeStatusSchema), controller.changeStatus);
router.get('/users/:id/details', controller.getUserDetails);
router.delete('/users/:id', controller.deleteUser);

// Rutas de moderación de posts
router.get('/posts', controller.getPosts);
router.delete('/posts/:id', controller.deletePost);
router.patch('/posts/:id/dismiss-report', controller.dismissPostReport);

// Rutas de gestión de misiones
router.get('/missions', controller.getMissions);
router.post('/missions', validateBody(missionSchema), controller.createMission);
router.put('/missions/:id', validateBody(updateMissionSchema), controller.updateMission);
router.delete('/missions/:id', controller.deleteMission);

// Rutas de gestión de retos (Retos Semanales)
router.get('/challenges', controller.getChallenges);
router.post('/challenges', validateBody(challengeSchema), controller.createChallenge);
router.put('/challenges/:id', validateBody(updateChallengeSchema), controller.updateChallenge);
router.delete('/challenges/:id', controller.deleteChallenge);

// Rutas de gestión de tareas de retos
router.get('/challenges/:retoId/tasks', controller.getTasks);
router.post('/challenges/tasks', validateBody(taskSchema), controller.createTask);
router.put('/challenges/tasks/:id', validateBody(updateTaskSchema), controller.updateTask);
router.delete('/challenges/tasks/:id', controller.deleteTask);

// Rutas de gestión de niveles
router.get('/levels', controller.getLevels);
router.post('/levels', validateBody(levelSchema), controller.createLevel);
router.put('/levels/:nivel', validateBody(updateLevelSchema), controller.updateLevel);
router.delete('/levels/:nivel', controller.deleteLevel);

export default router;
