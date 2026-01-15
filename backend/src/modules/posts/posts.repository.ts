import { supabase } from '../../config/supabaseClient';
import { Post, PostComment, PostListOptions } from './posts.types';

export class PostsRepository {

    // --- Posts ---

    async findAllPublic(options: PostListOptions): Promise<Post[]> {
        let query = supabase
            .from('posts')
            .select(`
                *,
                user:profiles(username, avatar_url),
                likes_count:post_likes(count),
                comments_count:post_comments(count),
                my_like:post_likes!left(user_id)
            `)
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .limit(options.limit || 10);

        if (options.authorId) {
            query = query.eq('user_id', options.authorId);
        }

        if (options.cursor) {
            query = query.lt('created_at', options.cursor);
        }

        if (options.hashtag) {
            query = query.contains('hashtags', [options.hashtag]);
        }

        // Note: my_like filtering needs to happen carefully. 
        // Supabase select filtering on joined tables usually filters the parent row if join is inner.
        // For 'left' join it just returns null if no match.
        // We want to check if *current user* liked it.
        if (options.userId) {
            // We do NOT filter the main query by post_likes.user_id, 
            // because that would restrict the returned counts to only this user's likes.
            // The 'my_like' join (left join) handles the "Liked by me" check properly.
        } else {
            // ...
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((post: any) => this.mapPostData(post, options.userId));
    }

    async findById(id: string, userId?: string): Promise<Post | null> {
        // Query to get post details
        const query = supabase
            .from('posts')
            .select(`
                *,
                user:profiles(username, avatar_url),
                likes_count:post_likes(count),
                comments_count:post_comments(count)
            `)
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error || !data) return null;

        // Separate query for "liked_by_me" because doing it in one specialized query 
        // with specific user_id filter on left join can be tricky in simple SDK usage without filtering the parent.
        // Alternative: use .eq('post_likes.user_id', userId) but that limits the likes count to 1 or 0 (incorrect count).
        // Best approach for correct count + boolean flag in one go is confusing in Supabase JS client syntax.
        // Simple approach: do a quick check if userId is present.
        let likedByMe = false;
        if (userId) {
            const { count } = await supabase
                .from('post_likes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', id)
                .eq('user_id', userId);
            likedByMe = Boolean(count);
        }

        return {
            ...data,
            _count: {
                likes: data.likes_count?.[0]?.count || 0,
                comments: data.comments_count?.[0]?.count || 0
            },
            liked_by_me: likedByMe,
            user: Array.isArray(data.user) ? data.user[0] : data.user // Handle potential array return
        };
    }

    async create(postData: Partial<Post>): Promise<Post> {
        const { data, error } = await supabase
            .from('posts')
            .insert(postData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, postData: Partial<Post>): Promise<Post> {
        const { data, error } = await supabase
            .from('posts')
            .update(postData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    async updateMediaUrl(id: string, mediaUrl: string): Promise<void> {
        const { error } = await supabase
            .from('posts')
            .update({ media_url: mediaUrl })
            .eq('id', id);

        if (error) throw error;
    }

    // --- Likes ---

    async addLike(postId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('post_likes')
            .insert({ post_id: postId, user_id: userId });

        // Ignore unique violation (idempotency)
        if (error && error.code !== '23505') throw error;
    }

    async removeLike(postId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('post_likes')
            .delete()
            .match({ post_id: postId, user_id: userId });

        if (error) throw error;
    }

    // --- Comments ---

    async findComments(postId: string, limit: number = 20): Promise<PostComment[]> {
        const { data, error } = await supabase
            .from('post_comments')
            .select(`
                *,
                user:profiles(username, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true }) // Oldest first
            .limit(limit);

        if (error) throw error;
        return data.map((c: any) => ({
            ...c,
            user: Array.isArray(c.user) ? c.user[0] : c.user
        }));
    }

    async findCommentById(commentId: string): Promise<PostComment | null> {
        const { data, error } = await supabase
            .from('post_comments')
            .select('*')
            .eq('id', commentId)
            .single();

        if (error) return null;
        return data;
    }

    async createComment(comment: Partial<PostComment>): Promise<PostComment> {
        const { data, error } = await supabase
            .from('post_comments')
            .insert(comment)
            .select(`
                *,
                user:profiles(username, avatar_url)
            `)
            .single();

        if (error) throw error;
        return {
            ...data,
            user: Array.isArray(data.user) ? data.user[0] : data.user
        };
    }

    async updateComment(id: string, content: string): Promise<void> {
        const { error } = await supabase
            .from('post_comments')
            .update({ content, updated_at: new Date() })
            .eq('id', id);

        if (error) throw error;
    }

    async deleteComment(id: string): Promise<void> {
        const { error } = await supabase
            .from('post_comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // --- Hashtags ---

    async getPopularHashtags(): Promise<{ hashtag: string, count: number }[]> {
        const { data, error } = await supabase
            .rpc('get_popular_hashtags');

        if (error) {
            console.error('Error fetching popular hashtags:', error);
            return [];
        }

        return data || [];
    }

    async searchHashtags(query: string): Promise<{ hashtag: string, count: number }[]> {
        const { data, error } = await supabase
            .rpc('search_hashtags', { search_query: query });

        if (error) {
            console.error('Error searching hashtags:', error);
            return [];
        }

        return data || [];
    }

    // Helper to map post data including "liked_by_me" extraction from left join
    private mapPostData(post: any, userId?: string): Post {
        // "my_like" will be an array of objects if match, or empty array if no match
        // But due to aliasing in select, we check what Supabase returns.
        // select: my_like:post_likes!left(user_id) 
        // If we filtered by options.userId, then my_like will contain [{user_id: ...}] if liked, or [] if not.

        const isLiked = userId && Array.isArray(post.my_like) && post.my_like.length > 0 && post.my_like.some((l: any) => l.user_id === userId);

        return {
            ...post,
            user: Array.isArray(post.user) ? post.user[0] : post.user,
            _count: {
                likes: post.likes_count?.[0]?.count || 0,
                comments: post.comments_count?.[0]?.count || 0
            },
            liked_by_me: Boolean(isLiked)
        };
    }
}
