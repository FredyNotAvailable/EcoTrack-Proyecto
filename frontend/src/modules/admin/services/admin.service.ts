import apiClient from '../../../services/apiClient';

export interface AdminUser {
    id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    status: 'active' | 'suspended';
    avatar_url?: string;
    puntos: number;
    nivel: number;
    created_at: string;
    last_sign_in?: string;
}

export const AdminAPIService = {
    async getUsers(): Promise<AdminUser[]> {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    async createUser(userData: any) {
        const response = await apiClient.post('/admin/users', userData);
        return response.data;
    },

    async updateUser(userId: string, updateData: any) {
        const response = await apiClient.put(`/admin/users/${userId}`, updateData);
        return response.data;
    },

    async updateStatus(userId: string, status: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
        return response.data;
    },

    async getUserDetails(userId: string): Promise<any> {
        const response = await apiClient.get(`/admin/users/${userId}/details`);
        return response.data;
    },

    async deleteUser(userId: string) {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // --- Post Moderation ---

    async getPosts(): Promise<any[]> {
        const response = await apiClient.get('/admin/posts');
        return response.data;
    },

    async getPostDetails(postId: string): Promise<any> {
        const response = await apiClient.get(`/admin/posts/${postId}`);
        return response.data;
    },

    async deletePost(postId: string) {
        const response = await apiClient.delete(`/admin/posts/${postId}`);
        return response.data;
    },

    async dismissPostReport(postId: string) {
        const response = await apiClient.patch(`/admin/posts/${postId}/dismiss-report`);
        return response.data;
    },

    async getPostReports(): Promise<any[]> {
        const response = await apiClient.get('/admin/reports');
        return response.data;
    },

    async resolvePostReport(reportId: string, action: 'dismiss' | 'delete_post') {
        const response = await apiClient.post(`/admin/reports/${reportId}/resolve`, { action });
        return response.data;
    },

    // --- Mission Management ---

    async getMissions(): Promise<any[]> {
        const response = await apiClient.get('/admin/missions');
        return response.data;
    },

    async createMission(missionData: any) {
        const response = await apiClient.post('/admin/missions', missionData);
        return response.data;
    },

    async updateMission(missionId: string, missionData: any) {
        const response = await apiClient.put(`/admin/missions/${missionId}`, missionData);
        return response.data;
    },

    async deleteMission(missionId: string) {
        const response = await apiClient.delete(`/admin/missions/${missionId}`);
        return response.data;
    },

    // --- Challenge Management ---

    async getChallenges(): Promise<any[]> {
        const response = await apiClient.get('/admin/challenges');
        return response.data;
    },

    async createChallenge(challengeData: any) {
        const response = await apiClient.post('/admin/challenges', challengeData);
        return response.data;
    },

    async updateChallenge(challengeId: string, challengeData: any) {
        const response = await apiClient.put(`/admin/challenges/${challengeId}`, challengeData);
        return response.data;
    },

    async deleteChallenge(challengeId: string) {
        const response = await apiClient.delete(`/admin/challenges/${challengeId}`);
        return response.data;
    },

    // --- Task Management ---

    async getChallengeTasks(challengeId: string): Promise<any[]> {
        const response = await apiClient.get(`/admin/challenges/${challengeId}/tasks`);
        return response.data;
    },

    async createTask(taskData: any) {
        const response = await apiClient.post('/admin/challenges/tasks', taskData);
        return response.data;
    },

    async updateTask(taskId: string, taskData: any) {
        const response = await apiClient.put(`/admin/challenges/tasks/${taskId}`, taskData);
        return response.data;
    },

    async deleteTask(taskId: string) {
        const response = await apiClient.delete(`/admin/challenges/tasks/${taskId}`);
        return response.data;
    },

    // --- Level Management ---

    async getLevels(): Promise<any[]> {
        const response = await apiClient.get('/admin/levels');
        return response.data;
    },

    async createLevel(levelData: any) {
        const response = await apiClient.post('/admin/levels', levelData);
        return response.data;
    },

    async updateLevel(nivel: number, levelData: any) {
        const response = await apiClient.put(`/admin/levels/${nivel}`, levelData);
        return response.data;
    },

    async deleteLevel(nivel: number) {
        const response = await apiClient.delete(`/admin/levels/${nivel}`);
        return response.data;
    },

    // --- Daily Tips Management ---

    async getDailyTips(): Promise<any[]> {
        const response = await apiClient.get('/admin/daily-tips');
        return response.data;
    },

    async createDailyTip(tipData: any) {
        const response = await apiClient.post('/admin/daily-tips', tipData);
        return response.data;
    },

    async updateDailyTip(tipId: string, tipData: any) {
        const response = await apiClient.put(`/admin/daily-tips/${tipId}`, tipData);
        return response.data;
    },

    async deleteDailyTip(tipId: string) {
        const response = await apiClient.delete(`/admin/daily-tips/${tipId}`);
        return response.data;
    },

    // --- Dashboard Stats ---

    async getDashboardStats(): Promise<any> {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    }
};
