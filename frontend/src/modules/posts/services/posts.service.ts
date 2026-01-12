import apiClient from '../../../services/apiClient';
import type { Post, Comment, CreatePostPayload, CreateCommentPayload } from '../types';

export const PostsService = {
    async getPosts(params?: { page?: number; limit?: number }) {
        const { data } = await apiClient.get<{ data: Post[]; meta: any }>('/posts', { params });
        return data; // Returns { data: Post[], meta: ... }
    },

    async getPostById(id: string) {
        const { data } = await apiClient.get<{ data: Post }>('/posts/' + id);
        return data.data;
    },

    async createPost(payload: CreatePostPayload) {
        // If there's a file upload needed, it should be handled before or here using the signed URL flow.
        // For now, assume payload has media_url if uploaded.
        // The backend `POST /posts` accepts the payload directly.
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
        return data; // assumes success returns { data: { success: true } } or similar
    },

    // Helper for media upload (simplified)
    async uploadMedia(file: File) {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await apiClient.post<{ data: { url: string } }>('/posts/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return data.data.url;
    }
};
