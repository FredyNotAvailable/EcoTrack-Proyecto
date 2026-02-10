import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';

export class ProfileController {
    private service = ProfileService.getInstance();

    getMe = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log(`[ProfileController] getMe requested for userId: ${userId}`);
            const profile = await this.service.getProfile(userId);
            if (!profile) {
                console.log(`[ProfileController] [NO PROFILE] Usuario con userId: ${userId} inició sesión pero NO tiene perfil.`);
                res.status(404).json({ success: false, message: 'Perfil no encontrado', registered: false });
                return;
            }
            // Considera registrado solo si username existe y no está vacío
            const registered = !!profile.username && profile.username.trim() !== '';
            console.log(`[ProfileController] getMe result for userId: ${userId} | username: '${profile.username}' | registered: ${registered}`);
            res.json({ success: true, profile, registered });
        } catch (error) {
            console.error(`[ProfileController] Error in getMe:`, error);
            next(error);
        }
    };

    getProfileByUsername = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username = req.params.username as string;
            console.log(`[ProfileController] getProfileByUsername requested for username: ${username}`);
            const profile = await this.service.getProfileByUsername(username);
            if (!profile) {
                res.status(404).json({ success: false, message: 'Perfil no encontrado' });
                return;
            }
            res.json(profile);
        } catch (error) {
            next(error);
        }
    };

    getProfileById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id as string;
            console.log(`[ProfileController] getProfileById requested for userId: ${userId}`);
            const profile = await this.service.getProfile(userId);
            if (!profile) {
                res.status(404).json({ success: false, message: 'Perfil no encontrado' });
                return;
            }
            res.json(profile);
        } catch (error) {
            next(error);
        }
    };

    createMe = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log(`[ProfileController] createMe requested for userId: ${userId} with data:`, {
                username: req.body.username,
                hasBio: !!req.body.bio,
                hasAvatar: !!req.body.avatar_url,
                timestamp: new Date().toISOString()
            });

            const profile = await this.service.createProfile(userId, req.body);
            console.log(`[ProfileController] Profile created successfully for userId: ${userId}`);
            res.status(201).json(profile);
        } catch (error: any) {
            console.error(`[ProfileController] Error in createMe:`, {
                userId: req.user?.id,
                error: error.message,
                code: error.code,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });

            // Pasar el error al middleware de manejo de errores
            // pero asegurar que tenga un statusCode apropiado
            if (!error.statusCode) {
                error.statusCode = 400;
            }
            next(error);
        }
    };

    updateMe = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            const updatedProfile = await this.service.updateProfile(userId, req.body);
            res.status(200).json(updatedProfile);
        } catch (error) {
            next(error);
        }
    };

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.query as string;
            const profiles = await this.service.searchProfiles(query);
            res.json(profiles);
        } catch (error) {
            next(error);
        }
    };
}
