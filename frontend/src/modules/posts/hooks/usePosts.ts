import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { PostsService } from '../services/posts.service';
import type { CreatePostPayload } from '../types';

export const POSTS_KEYS = {
    all: ['posts'] as const,
    feed: () => [...POSTS_KEYS.all, 'feed'] as const,
    userPosts: (userId: string) => [...POSTS_KEYS.all, 'user', userId] as const,
    detail: (id: string) => [...POSTS_KEYS.all, 'detail', id] as const,
    comments: (id: string) => [...POSTS_KEYS.all, 'comments', id] as const,
    trending: () => [...POSTS_KEYS.all, 'trending'] as const,
};

export const usePostsFeed = (hashtag?: string) => {
    return useInfiniteQuery({
        queryKey: hashtag ? [...POSTS_KEYS.feed(), { hashtag }] : POSTS_KEYS.feed(),
        initialPageParam: 1,
        queryFn: ({ pageParam = 1 }) =>
            PostsService.getPosts({
                page: pageParam as number,
                limit: 5,
                hashtag
            }),
        getNextPageParam: (lastPage) => {
            const hasMore = lastPage?.meta?.currentPage < lastPage?.meta?.totalPages;
            return hasMore ? lastPage.meta.currentPage + 1 : undefined;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
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
            queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
    });
};

export const useLikePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ postId, liked }: { postId: string; liked: boolean }) =>
            liked ? PostsService.unlikePost(postId) : PostsService.likePost(postId),
        onMutate: async ({ postId, liked }) => {
            await queryClient.cancelQueries({ queryKey: POSTS_KEYS.feed() });
            await queryClient.cancelQueries({ queryKey: POSTS_KEYS.detail(postId) });

            const previousFeed = queryClient.getQueryData(POSTS_KEYS.feed());
            const previousDetail = queryClient.getQueryData(POSTS_KEYS.detail(postId));

            // Helper to update a single post
            const updatePostLike = (post: any) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        liked_by_me: !liked,
                        _count: {
                            ...post._count,
                            likes: liked ? (post._count?.likes || 1) - 1 : (post._count?.likes || 0) + 1
                        },
                        // Also update legacy stats if present
                        stats: {
                            ...post.stats,
                            likes: liked ? (post.stats?.likes || 1) - 1 : (post.stats?.likes || 0) + 1,
                            likedBy: liked
                                ? post.stats?.likedBy?.filter((u: string) => u !== 'me')
                                : [...(post.stats?.likedBy || []), 'me'] // Dummy visual update
                        }
                    };
                }
                return post;
            };

            // Update Feed
            queryClient.setQueryData(POSTS_KEYS.feed(), (old: any) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map(updatePostLike),
                    })),
                };
            });

            // Update user posts if they exist
            queryClient.setQueriesData({ queryKey: POSTS_KEYS.all }, (old: any) => {
                if (!old || !old.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map(updatePostLike),
                    })),
                };
            });

            // Update Detail
            queryClient.setQueryData(POSTS_KEYS.detail(postId), (old: any) => {
                if (!old) return old;
                return updatePostLike(old);
            });

            return { previousFeed, previousDetail };
        },
        onError: (_err, { postId }, context) => {
            if (context?.previousFeed) {
                queryClient.setQueryData(POSTS_KEYS.feed(), context.previousFeed);
            }
            // Rollback all posts cache roughly (might be overkill but safer)
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.all });

            if (context?.previousDetail) {
                queryClient.setQueryData(POSTS_KEYS.detail(postId), context.previousDetail);
            }
        },
        onSettled: (_, __, { postId }) => {
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.feed() });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.detail(postId) });
            queryClient.invalidateQueries({ queryKey: POSTS_KEYS.all });
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
            queryClient.invalidateQueries({ queryKey: ['racha', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
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
