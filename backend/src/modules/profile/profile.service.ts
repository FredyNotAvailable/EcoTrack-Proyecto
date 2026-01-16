import { ProfileRepository } from './profile.repository';

export class ProfileService {
    private repository = new ProfileRepository();

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
        console.log(`[ProfileService] Creating profile for ${userId}`);
        // Verificar si ya existe para evitar duplicados/errores
        const existing = await this.repository.getById(userId);
        if (existing) {
            console.warn(`[ProfileService] Profile already exists for ${userId}`);
            throw new Error('El perfil ya existe');
        }

        if (data.bio && data.bio.length > 300) {
            throw new Error('La biografía no puede exceder los 300 caracteres.');
        }

        try {
            return await this.repository.create({
                id: userId,
                ...data
            });
        } catch (error: any) {
            if (error.code === '23505') {
                throw new Error('El nombre de usuario ya está en uso. Por favor elige otro.');
            }
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
