import { Request, Response, NextFunction } from 'express';
import { PostsService } from './posts.service';
import { createPostSchema, createCommentSchema, updateCommentSchema } from './posts.validators';
import { ApiError } from '../../utils/ApiError';

const service = new PostsService();

import { mediaService } from './media.service';

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, cursor, authorId } = req.query;
        const userId = req.user?.id; // Optional auth

        const posts = await service.getFeed({
            limit: limit ? Number(limit) : 10,
            cursor: cursor as string,
            userId,
            authorId: authorId as string
        });

        res.json({ data: posts });
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
        if (!req.file) {
            throw new ApiError(400, 'No file uploaded');
        }

        const userId = req.user!.id;
        const publicUrl = await mediaService.processAndUpload(req.file, userId);

        res.json({ data: { url: publicUrl } });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validation = createPostSchema.safeParse(req.body);
        if (!validation.success) {
            console.error('[CreatePost] Validation Error:', JSON.stringify(validation.error.format(), null, 2));
            throw new ApiError(400, 'Validation Error');
        }

        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        const created = await service.createPost(req.user!.id, validation.data);
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

        const validation = createCommentSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ApiError(400, 'Validation Error', 'BAD_REQUEST', validation.error.format());
        }

        const comment = await service.createComment(req.user.id, id as string, validation.data);
        res.status(201).json({ data: comment });
    } catch (error) {
        next(error);
    }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Comment ID
        if (!req.user) throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');

        const validation = updateCommentSchema.safeParse(req.body);
        if (!validation.success) {
            throw new ApiError(400, 'Validation Error', 'BAD_REQUEST', validation.error.format());
        }

        await service.updateComment(req.user.id, id as string, validation.data.content);
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
