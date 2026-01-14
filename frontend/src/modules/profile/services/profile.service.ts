import { supabase } from '../../../config/supabase';

const API_URL = 'http://localhost:3001/api';

export const ProfileAPIService = {
    async getMe() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        const response = await fetch(`${API_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener el perfil');
        }

        const result = await response.json();
        return result;
    },

    async getProfileById(userId: string) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        const response = await fetch(`${API_URL}/profile/${userId}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener el perfil');
        }

        const result = await response.json();
        return result;
    },

    async updateMe(profileData: any) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No hay sesión activa');

        const response = await fetch(`${API_URL}/profile/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar el perfil');
        }

        const result = await response.json();
        return result;
    },

    async create(profileData: any) {
        console.log("ProfileAPIService.create called with:", profileData);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            console.error("ProfileAPIService: No session found");
            throw new Error('No hay sesión activa');
        }

        console.log("ProfileAPIService: Sending POST to", `${API_URL}/profile/me`);
        const response = await fetch(`${API_URL}/profile/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(profileData),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("ProfileAPIService: Error response", error);
            throw new Error(error.message || 'Error al crear el perfil');
        }

        const result = await response.json();
        console.log("ProfileAPIService: Success", result);
        return result;
    }
};
