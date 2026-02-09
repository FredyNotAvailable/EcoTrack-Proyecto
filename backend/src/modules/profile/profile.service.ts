import { ProfileRepository } from './profile.repository';

export class ProfileService {
    private static instance: ProfileService;
    private repository: ProfileRepository;

    constructor() {
        this.repository = ProfileRepository.getInstance();
    }

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    async getProfile(userId: string) {
        const profile = await this.repository.getById(userId);
        if (!profile) return null;
        return profile;
    }

    async getProfileByUsername(username: string) {
        const profile = await this.repository.getByUsername(username);
        return profile;
    }

    async createProfile(userId: string, data: any) {
        console.log(`[ProfileService] Creating profile for ${userId}`, {
            username: data.username,
            bioLength: data.bio?.length || 0,
            hasAvatar: !!data.avatar_url
        });

        // Verificar si ya existe para evitar duplicados/errores
        const existing = await this.repository.getById(userId);
        if (existing) {
            console.warn(`[ProfileService] Profile already exists for ${userId}`);
            const error: any = new Error('El perfil ya existe');
            error.statusCode = 409; // Conflict
            throw error;
        }

        if (data.bio && data.bio.length > 300) {
            const error: any = new Error('La biografía no puede exceder los 300 caracteres.');
            error.statusCode = 400;
            throw error;
        }

        try {
            const profile = await this.repository.create({
                id: userId,
                ...data
            });

            console.log(`[ProfileService] Profile created successfully for ${userId}`);
            return profile;
        } catch (error: any) {
            console.error(`[ProfileService] Error creating profile:`, {
                userId,
                errorCode: error.code,
                errorMessage: error.message
            });

            // Error de username duplicado (PostgreSQL unique violation)
            if (error.code === '23505') {
                const duplicateError: any = new Error('El nombre de usuario ya está en uso. Por favor elige otro.');
                duplicateError.statusCode = 409;
                duplicateError.code = 'DUPLICATE_USERNAME';
                throw duplicateError;
            }

            // Re-lanzar otros errores
            throw error;
        }
    }

    async updateProfile(userId: string, data: any) {
        if (data.username !== undefined && data.username.trim() === '') {
            throw new Error('El nombre de usuario no puede estar vacío.');
        }

        if (data.bio && data.bio.length > 300) {
            throw new Error('La biografía no puede exceder los 300 caracteres.');
        }

        try {
            return await this.repository.update(userId, data);
        } catch (error: any) {
            if (error.code === '23505') { // Postgres unique_violation code
                throw new Error('El nombre de usuario ya está en uso. Por favor elige otro.');
            }
            throw error;
        }
    }

    async searchProfiles(query: string) {
        if (!query || query.trim() === '') return [];
        return await this.repository.searchProfiles(query);
    }
    async deleteAccount(userId: string) {
        // Delete profile data from DB.
        // Dependent tables (points, missions, etc) should satisfy ON DELETE CASCADE in DB schema.
        await this.repository.delete(userId);
    }
}
