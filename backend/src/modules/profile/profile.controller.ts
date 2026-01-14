import { Request, Response, NextFunction } from 'express';
import { ProfileService } from './profile.service';

export class ProfileController {
    private service = new ProfileService();

    getMe = async (req: any, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            console.log(`[ProfileController] getMe requested for userId: ${userId}`);
            const profile = await this.service.getProfile(userId);
            if (!profile) {
                console.log(`[ProfileController] Profile not found for userId: ${userId}`);
                res.status(404).json({ success: false, message: 'Perfil no encontrado' });
                return;
            }
            res.json(profile);
        } catch (error) {
            console.error(`[ProfileController] Error in getMe:`, error);
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
            console.log(`[ProfileController] createMe requested for userId: ${userId} with data:`, req.body);
            const profile = await this.service.createProfile(userId, req.body);
            console.log(`[ProfileController] Profile created successfully for userId: ${userId}`);
            res.status(201).json(profile);
        } catch (error) {
            console.error(`[ProfileController] Error in createMe:`, error);
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
}
