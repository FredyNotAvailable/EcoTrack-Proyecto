import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { PostsService } from '../services/posts.service';
import type { CreatePostPayload } from '../types';

export const POSTS_KEYS = {
    all: ['posts'] as const,
    feed: () => [...POSTS_KEYS.all, 'feed'] as const,
    userPosts: (userId: string) => [...POSTS_KEYS.all, 'user', userId] as const,
    detail: (id: string) => [...POSTS_KEYS.all, 'detail', id] as const,
    comments: (id: string) => [...POSTS_KEYS.all, 'comments', id] as const,
};

export const usePostsFeed = () => {
    return useInfiniteQuery({
        queryKey: POSTS_KEYS.feed(),
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) => PostsService.getPosts({ page: pageParam as number, limit: 5 }),
        getNextPageParam: (lastPage) => {
            // Check if there are more pages based on metadata
            const hasMore = lastPage?.meta?.currentPage < lastPage?.meta?.totalPages;
            return hasMore ? lastPage.meta.currentPage + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
        refetchOnWindowFocus: false
    });
};

export const useUserPosts = (userId?: string) => {
    return useInfiniteQuery({
        queryKey: userId ? POSTS_KEYS.userPosts(userId) : [],
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) =>
            PostsService.getPosts({
                page: pageParam as number,
                limit: 9, // Grid usually looks better with 3x3
                authorId: userId
            }),
        getNextPageParam: (lastPage) => {
            const hasMore = lastPage?.meta?.currentPage < lastPage?.meta?.totalPages;
            return hasMore ? lastPage.meta.currentPage + 1 : undefined;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePostPayload) => PostsService.createPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
        },
    });
};

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
            liked ? PostsService.unlikePost(postId) : PostsService.likePost(postId),
        onSuccess: (_, { postId }) => {
            // Invalidate specific post and feed
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.detail(postId) });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
        },
    });
};

export const usePostComments = (postId: string) => {
    return useQuery({
        queryKey: POSTS_KEYS.comments(postId),
        queryFn: () => PostsService.getComments(postId),
        enabled: !!postId,
    });
};

export const useCreateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, content }: { postId: string; content: string }) =>
            PostsService.createComment(postId, { content }),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.comments(postId) });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.detail(postId) }); // Update comment count
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
        },
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId }: { postId: string; commentId: string }) =>
            PostsService.deleteComment(commentId),
        onSuccess: (_, { postId }) => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.comments(postId) });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.detail(postId) });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
        },
    });
};

export const useUpdatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreatePostPayload> }) =>
            PostsService.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
        },
    });
};

export const useDeletePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => PostsService.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
        },
    });
};
