import apiClient from '../../../services/apiClient';
import type { Post, Comment, CreatePostPayload, CreateCommentPayload } from '../types';

export const PostsService = {
    async getPosts(params?: { page?: number; limit?: number; authorId?: string; hashtag?: string }) {
        const { data } = await apiClient.get<{ data: Post[]; meta: any }>('/posts', { params });
        return data;
    },

    async getPopularHashtags() {
        const { data } = await apiClient.get<{ data: { hashtag: string; count: number }[] }>('/posts/hashtags/popular');
        return data.data;
    },

    async searchHashtags(query: string) {
        const { data } = await apiClient.get<{ data: { hashtag: string; count: number }[] }>('/posts/search/hashtags', {
            params: { query }
        });
        return data.data;
    },

    async getPostById(id: string) {
        const { data } = await apiClient.get<{ data: Post }>('/posts/' + id);
        return data.data;
    },

    async createPost(payload: CreatePostPayload) {
        const { data } = await apiClient.post<{ data: { post: Post } }>('/posts', payload);
        return data.data.post;
    },

    async updatePost(id: string, payload: Partial<CreatePostPayload>) {
        const { data } = await apiClient.put<{ data: Post }>('/posts/' + id, payload);
        return data.data;
    },

    async deletePost(id: string) {
        const { data } = await apiClient.delete('/posts/' + id);
        return data;
    },

    async likePost(postId: string) {
        const { data } = await apiClient.post('/posts/' + postId + '/like');
        return data;
    },

    async unlikePost(postId: string) {
        const { data } = await apiClient.delete('/posts/' + postId + '/like');
        return data;
    },

    async getComments(postId: string) {
        const { data } = await apiClient.get<{ data: Comment[] }>('/posts/' + postId + '/comments');
        return data.data;
    },

    async createComment(postId: string, payload: CreateCommentPayload) {
        const { data } = await apiClient.post<{ data: Comment }>('/posts/' + postId + '/comments', payload);
        return data.data;
    },

    async deleteComment(commentId: string) {
        const { data } = await apiClient.delete('/comments/' + commentId);
        return data;
    },

    async uploadMedia(file: File) {
        const formData = new FormData();
        formData.append('files', file);

        const { data } = await apiClient.post<{ data: { urls: string[] } }>('/posts/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data.data.urls[0]; // Backend returns array of URLs, we take the first one since we upload one by one
    }
};
