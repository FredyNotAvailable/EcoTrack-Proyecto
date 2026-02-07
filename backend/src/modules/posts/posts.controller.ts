import { Request, Response, NextFunction } from 'express';
import { PostsService } from './posts.service';
import { ApiError } from '../../utils/ApiError';

const service = PostsService.getInstance();

import { mediaService } from './media.service';
import multer from 'multer';

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, cursor, authorId, hashtag } = req.query;
        const userId = req.user?.id; // Optional auth
        const requestedLimit = limit ? Number(limit) : 10;

        const posts = await service.getFeed({
            limit: requestedLimit + 1, // Pedir uno extra para saber si hay más
            cursor: cursor as string,
            userId,
            authorId: authorId as string,
            hashtag: hashtag as string
        });

        // Determinar si hay más resultados
        const hasMore = posts.length > requestedLimit;
        const resultPosts = hasMore ? posts.slice(0, requestedLimit) : posts;
        const nextCursor = hasMore && resultPosts.length > 0 
            ? resultPosts[resultPosts.length - 1].created_at 
            : null;

        res.json({ 
            data: resultPosts,
            pagination: {
                hasMore,
                nextCursor,
                count: resultPosts.length
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const post = await service.getPostById(id as string, userId);
        res.json({ data: post });
    } catch (error) {
        next(error);
    }
};

export const uploadMedia = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            // Fallback for single file if somehow used
            if (!req.file) throw new ApiError(400, 'No files uploaded');
        }

        const userId = req.user!.id;
        const files = (req.files as any) || [req.file];

        const urls: string[] = [];

        for (const file of files) {
            const publicUrl = await mediaService.processAndUpload(file, userId);
            urls.push(publicUrl);
        }

        // Return array of URLs. Frontend might need to adapt if it expects single "url".
        // But we are updating frontend too.
        res.json({ data: { urls } });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body ya validado por middleware validateBody(createPostSchema)
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        console.log('Backend - createPost received body:', req.body);
        console.log('Backend - hashtags:', req.body.hashtags);

        const created = await service.createPost(req.user!.id, req.body);
        res.status(201).json({ data: created });
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const postId = typeof id === 'string' ? id : id[0];
        // Re-use create schema for partial updates or create a new one?
        // Let's use createPostSchema but make fields optional or just parse partial
        // Ideally we should have updatePostSchema or partial()
        // Assuming strict validation is needed:
        // const validation = createPostSchema.partial().safeParse(req.body);

        // For simplicity, let's allow partial body directly passed, ensuring strictly validated later if needed
        // But better to validate.

        const updated = await service.updatePost(req.user!.id, postId, req.body);
        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const postId = typeof id === 'string' ? id : id[0];
        await service.deletePost(req.user!.id, postId);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};

export const likePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        await service.toggleLike(id as string, req.user.id, 'like');
        res.json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        await service.toggleLike(id as string, req.user.id, 'unlike');
        res.json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const comments = await service.getComments(id as string);
        res.json({ data: comments });
    } catch (error) {
        next(error);
    }
};

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        // Body validado por middleware validateBody(createCommentSchema)
        const comment = await service.createComment(req.user.id, id as string, req.body);
        res.status(201).json({ data: comment });
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Comment ID
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        // Body validado por middleware validateBody(updateCommentSchema)
        await service.updateComment(req.user.id, id as string, req.body.content);
        res.json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        await service.deleteComment(req.user.id, id as string);
        res.json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const getPopularHashtags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hashtags = await service.getPopularHashtags();
        res.json({ data: hashtags });
    } catch (error) {
        next(error);
    }
};

export const searchHashtags = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const query = req.query.query as string;
        const hashtags = await service.searchHashtags(query);
        res.json({ data: hashtags });
    } catch (error) {
        next(error);
    }
};
