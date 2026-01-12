import { PostsRepository } from './posts.repository';
import { PostsStorage } from './posts.storage';
import { CreatePostDTO, CreateCommentDTO, Post, PostComment, PostListOptions } from './posts.types';
import { ApiError } from '../../utils/ApiError';

export class PostsService {
    private repository: PostsRepository;
    private storage: PostsStorage;

    constructor() {
        this.repository = new PostsRepository();
        this.storage = new PostsStorage();
    }

    async getFeed(options: PostListOptions): Promise<Post[]> {
        // Enforce limit logic
        if (options.limit && options.limit > 50) options.limit = 50;
        return this.repository.findAllPublic(options);
    }

    async getPostById(id: string, userId?: string): Promise<Post> {
        const post = await this.repository.findById(id, userId);
        if (!post) {
            throw new ApiError(404, 'Post not found', 'NOT_FOUND');
        }
        return post;
    }

    async createPost(userId: string, data: CreatePostDTO): Promise<{ post: Post }> {
        // If media_url is provided (new flow), use it.
        // If not, and media_mime is present (old flow), we could support it but let's stick to the new flow.

        const initialPostData: Partial<Post> = {
            user_id: userId,
            descripcion: data.descripcion,
            is_public: data.is_public ?? true, // Default to true
            ubicacion: data.ubicacion,
            hashtags: data.hashtags,
            media_type: data.media_type,
            media_url: data.media_url || null
        };

        const createdPost = await this.repository.create(initialPostData);

        return {
            post: createdPost
        };
    }

    async updatePost(userId: string, postId: string, data: Partial<CreatePostDTO>): Promise<Post> {
        const post = await this.repository.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found', 'NOT_FOUND');

        if (post.user_id !== userId) {
            throw new ApiError(403, 'Not authorized to update this post', 'FORBIDDEN');
        }

        const updateData: Partial<Post> = {
            descripcion: data.descripcion,
            is_public: data.is_public,
            ubicacion: data.ubicacion,
            hashtags: data.hashtags,
            // media update not supported in this simple flow yet
            updated_at: new Date().toISOString()
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key as keyof Post] === undefined && delete updateData[key as keyof Post]);

        return this.repository.update(postId, updateData);
    }

    async deletePost(userId: string, postId: string): Promise<void> {
        const post = await this.repository.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found', 'NOT_FOUND');

        if (post.user_id !== userId) {
            throw new ApiError(403, 'Not authorized to delete this post', 'FORBIDDEN');
        }

        await this.repository.delete(postId);
    }

    async toggleLike(postId: string, userId: string, action: 'like' | 'unlike'): Promise<void> {
        const post = await this.repository.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found', 'NOT_FOUND');

        if (action === 'like') {
            await this.repository.addLike(postId, userId);
        } else {
            await this.repository.removeLike(postId, userId);
        }
    }

    async getComments(postId: string, limit?: number): Promise<PostComment[]> {
        const post = await this.repository.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found', 'NOT_FOUND');

        return this.repository.findComments(postId, limit);
    }

    async createComment(userId: string, postId: string, data: CreateCommentDTO): Promise<PostComment> {
        const post = await this.repository.findById(postId);
        if (!post) throw new ApiError(404, 'Post not found', 'NOT_FOUND');

        return this.repository.createComment({
            post_id: postId,
            user_id: userId,
            content: data.content
        });
    }

    async updateComment(userId: string, commentId: string, content: string): Promise<void> {
        const comment = await this.repository.findCommentById(commentId);
        if (!comment) throw new ApiError(404, 'Comment not found', 'NOT_FOUND');

        if (comment.user_id !== userId) {
            throw new ApiError(403, 'Not authorized to edit this comment', 'FORBIDDEN');
        }

        await this.repository.updateComment(commentId, content);
    }

    async deleteComment(userId: string, commentId: string): Promise<void> {
        const comment = await this.repository.findCommentById(commentId);
        if (!comment) throw new ApiError(404, 'Comment not found', 'NOT_FOUND');

        if (comment.user_id !== userId) {
            throw new ApiError(403, 'Not authorized to delete this comment', 'FORBIDDEN');
        }

        await this.repository.deleteComment(commentId);
    }
}
