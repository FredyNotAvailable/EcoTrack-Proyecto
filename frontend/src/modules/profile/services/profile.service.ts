import apiClient from '../../../services/apiClient';

export interface Profile {
    id?: string;
    username: string;
    bio?: string;
    avatar_url?: string;
    level?: number;
    xp?: number;
    // Add other fields as needed
}

export const ProfileAPIService = {
    async getMe() {
        const response = await apiClient.get('/profile/me');
        return response.data;
    },

    async getProfileById(userId: string) {
        const response = await apiClient.get(`/profile/${userId}`);
        return response.data;
    },

    async getProfileByUsername(username: string) {
        const response = await apiClient.get(`/profile/username/${username}`);
        return response.data;
    },

    async updateMe(profileData: any) {
        const response = await apiClient.put('/profile/me', profileData);
        return response.data;
    },

    async create(profileData: any) {
        console.log("ProfileAPIService.create called with:", profileData);
        const response = await apiClient.post('/profile/me', profileData);
        console.log("ProfileAPIService: Success", response.data);
        return response.data;
    },

    async searchProfiles(query: string) {
        const response = await apiClient.get(`/profile/search`, {
            params: { query }
        });
        return response.data;
    },

    async deleteAccount() {
        const response = await apiClient.delete('/auth/me');
        return response.data;
    }
};
