import { PostsRepository } from './posts.repository';
import { PostsStorage } from './posts.storage';
import { CreatePostDTO, CreateCommentDTO, Post, PostComment, PostListOptions } from './posts.types';
import { ApiError } from '../../utils/ApiError';
import { PuntosService } from '../puntos/puntos.service';
import { RachasService } from '../rachas/rachas.service';
import { UserStatsService } from '../user-stats/user-stats.service';

export class PostsService {
    private static instance: PostsService;
    private repository: PostsRepository;
    private storage: PostsStorage;
    private puntosService: PuntosService;
    private rachasService: RachasService;
    private userStatsService: UserStatsService;

    constructor() {
        this.repository = PostsRepository.getInstance();
        this.storage = PostsStorage.getInstance();
        this.puntosService = PuntosService.getInstance();
        this.rachasService = RachasService.getInstance();
        this.userStatsService = UserStatsService.getInstance();
    }

    static getInstance(): PostsService {
        if (!PostsService.instance) {
            PostsService.instance = new PostsService();
        }
        return PostsService.instance;
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
        const initialPostData: Partial<Post> = {
            user_id: userId,
            descripcion: data.descripcion,
            is_public: data.is_public ?? true, // Default to true
            ubicacion: data.ubicacion,
            hashtags: data.hashtags
        };

        const createdPost = await this.repository.create(initialPostData);

        // Insert Media if any
        if (data.media && data.media.length > 0) {
            const mediaItems = data.media.map((item, index) => ({
                post_id: createdPost.id,
                media_url: item.url,
                media_type: item.type,
                position: index
            }));

            await this.repository.addMedia(mediaItems);

            // Attach media to returned object for immediate UI update (mocking the DB return)
            createdPost.media = mediaItems.map(m => ({
                id: 'temp-id', // We don't have the UUID unless we fetch back, but mostly fine for UI feedback
                ...m
            }));
        }

        // Log points, update streak, and stats in parallel
        await Promise.all([
            this.puntosService.logPoints(userId, 15, 'post', createdPost.id),
            this.rachasService.updateStreak(userId),
            this.userStatsService.updatePostStats(userId, 15)
        ]);


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

        // Handle Media Update (Wipe and Replace Strategy for reordering)
        if (data.media) {
            await this.repository.deleteAllMedia(postId);

            if (data.media.length > 0) {
                const mediaItems = data.media.map((item, index) => ({
                    post_id: postId,
                    media_url: item.url,
                    media_type: item.type,
                    position: index
                }));
                await this.repository.addMedia(mediaItems);
            }
        }

        const updateData: Partial<Post> = {
            descripcion: data.descripcion,
            is_public: data.is_public,
            ubicacion: data.ubicacion,
            hashtags: data.hashtags,
            updated_at: new Date().toISOString()
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key as keyof Post] === undefined && delete updateData[key as keyof Post]);

        const updated = await this.repository.update(postId, updateData);
        // Fetch full to get new media order
        const fullUpdated = await this.repository.findById(postId, userId);
        return fullUpdated || updated;
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
            await Promise.all([
                this.repository.addLike(postId, userId),
                this.userStatsService.updateLikeStats(post.user_id, true)
            ]);
        } else {
            await Promise.all([
                this.repository.removeLike(postId, userId),
                this.userStatsService.updateLikeStats(post.user_id, false)
            ]);
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

        const comment = await this.repository.createComment({
            post_id: postId,
            user_id: userId,
            content: data.content
        });

        // Log points, update streak, and stats in parallel
        await Promise.all([
            this.puntosService.logPoints(userId, 5, 'comentario', comment.id),
            this.rachasService.updateStreak(userId),
            this.userStatsService.updateCommentStats(userId, 5)
        ]);

        return comment;
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

    async getPopularHashtags(): Promise<{ hashtag: string, count: number }[]> {
        return this.repository.getPopularHashtags();
    }

    async searchHashtags(query: string): Promise<{ hashtag: string, count: number }[]> {
        if (!query || query.trim() === '') return [];
        return this.repository.searchHashtags(query);
    }
}
