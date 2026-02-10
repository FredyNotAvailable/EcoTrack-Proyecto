import { PostsRepository } from './posts.repository';
import { PostsStorage } from './posts.storage';
import { CreatePostDTO, CreateCommentDTO, Post, PostComment, PostListOptions } from './posts.types';
import { ApiError } from '../../utils/ApiError';
import { PuntosService } from '../puntos/puntos.service';
import { RachasService } from '../rachas/rachas.service';
import { UserStatsService } from '../user-stats/user-stats.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ProfileRepository } from '../profile/profile.repository';

export class PostsService {
    private static instance: PostsService;
    private repository: PostsRepository;
    private storage: PostsStorage;
    private puntosService: PuntosService;
    private rachasService: RachasService;
    private userStatsService: UserStatsService;
    private notificationsService: NotificationsService;
    private profileRepository: ProfileRepository;

    constructor() {
        this.repository = PostsRepository.getInstance();
        this.storage = PostsStorage.getInstance();
        this.puntosService = PuntosService.getInstance();
        this.rachasService = RachasService.getInstance();
        this.userStatsService = UserStatsService.getInstance();
        this.notificationsService = NotificationsService.getInstance();
        this.profileRepository = ProfileRepository.getInstance();
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
        // Extraer hashtags de la descripción automáticamente
        const descriptionHashtags = data.descripcion.match(/#(\w+)/g)?.map(h => h.substring(1).toLowerCase()) || [];

        // Mezclar con los hashtags recibidos del modal y eliminar duplicados
        const providedHashtags = data.hashtags || [];
        const combinedHashtags = Array.from(new Set([
            ...providedHashtags.map(h => h.toLowerCase().replace(/^#/, '')),
            ...descriptionHashtags
        ])).filter(h => h.length > 0).slice(0, 10);

        const initialPostData: Partial<Post> = {
            user_id: userId,
            descripcion: data.descripcion,
            is_public: data.is_public ?? true,
            ubicacion: data.ubicacion,
            hashtags: combinedHashtags
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

            // Attach media to returned object for immediate UI update
            createdPost.media = mediaItems.map(m => ({
                id: 'temp-id',
                ...m
            }));
        }

        // --- SIDE EFFECTS (NON-BLOCKING) ---
        // Corremos esto en segundo plano para no demorar la respuesta al usuario
        (async () => {
            try {
                console.log(`[PostsService] ⚡ Processing side effects for user ${userId}...`);
                await Promise.all([
                    this.puntosService.logPoints(userId, 15, 'post', createdPost.id),
                    this.rachasService.updateStreak(userId),
                    this.userStatsService.updatePostStats(userId, 15)
                ]);
                console.log(`[PostsService] ✅ Side effects completed for post ${createdPost.id}`);
            } catch (err) {
                console.error(`[PostsService] ❌ Error in background side effects:`, err);
            }
        })();

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

        // Extraer hashtags si hay descripción o hashtags nuevos
        let combinedHashtags = data.hashtags;
        if (data.descripcion !== undefined || data.hashtags !== undefined) {
            const currentDesc = data.descripcion ?? post.descripcion;
            const currentHashtags = data.hashtags ?? post.hashtags ?? [];

            const descriptionHashtags = currentDesc.match(/#(\w+)/g)?.map(h => h.substring(1).toLowerCase()) || [];
            combinedHashtags = Array.from(new Set([
                ...currentHashtags.map((h: string) => h.toLowerCase().replace(/^#/, '')),
                ...descriptionHashtags
            ])).filter(h => h.length > 0).slice(0, 10);
        }

        const updateData: Partial<Post> = {
            descripcion: data.descripcion,
            is_public: data.is_public,
            ubicacion: data.ubicacion,
            hashtags: combinedHashtags,
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

            // --- Notificar al autor ---
            if (post.user_id !== userId) {
                const actor = await this.profileRepository.getById(userId);
                await this.notificationsService.notifySocial(
                    post.user_id,
                    userId,
                    'Nuevo Like',
                    `@${actor?.username || 'Alguien'} le dio me gusta a tu publicación.`,
                    postId,
                    'post'
                );
            }
        } else {
            await Promise.all([
                this.repository.removeLike(postId, userId),
                this.userStatsService.updateLikeStats(post.user_id, false),
                this.notificationsService.deleteSocialNotification(post.user_id, userId, postId)
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

        // --- Notificar al autor ---
        if (post.user_id !== userId) {
            const actor = await this.profileRepository.getById(userId);
            await this.notificationsService.notifySocial(
                post.user_id,
                userId,
                'Nuevo Comentario',
                `@${actor?.username || 'Alguien'} comentó tu publicación: "${comment.content.slice(0, 30)}..."`,
                postId,
                'post'
            );
        }

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

        const post = await this.repository.findById(comment.post_id);

        await Promise.all([
            this.repository.deleteComment(commentId),
            post && this.notificationsService.deleteSocialNotification(post.user_id, userId, comment.id)
        ]);
    }

    async getPopularHashtags(): Promise<{ hashtag: string, count: number }[]> {
        return this.repository.getPopularHashtags();
    }

    async searchHashtags(query: string): Promise<{ hashtag: string, count: number }[]> {
        if (!query || query.trim() === '') return [];
        return this.repository.searchHashtags(query);
    }

    async reportPost(userId: string, postId: string, reason: string, details?: string): Promise<void> {
        // 0. Check if already reported
        const alreadyReported = await this.repository.hasUserReportedPost(postId, userId);
        if (alreadyReported) {
            throw new ApiError(400, 'Ya has reportado esta publicación.', 'ALREADY_REPORTED');
        }

        // 1. Create Report Entry
        await this.repository.createReport({
            post_id: postId,
            reporter_id: userId,
            reason,
            details
        });

        // 2. Mark Post as Reported (Denormalization for quick filtering)
        await this.repository.update(postId, { is_reported: true });

        // 3. Notificar al reportero (Confirmación)
        await this.notificationsService.notifySystem(
            userId,
            'Reporte Recibido',
            'Gracias por tu reporte. Nuestro equipo lo revisará pronto para mantener la comunidad segura.'
        );

        // 4. Notificar al autor (Moderación)
        const post = await this.repository.findById(postId);
        if (post && post.user_id !== userId) {
            await this.notificationsService.notifyModeration(
                post.user_id,
                'Contenido Reportado',
                'Una de tus publicaciones ha sido reportada por la comunidad y está bajo revisión.',
                postId
            );
        }
    }
}
