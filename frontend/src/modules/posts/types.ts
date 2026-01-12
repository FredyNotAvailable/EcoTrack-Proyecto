export interface User {
    id: string;
    email: string;
    username?: string; // Optional depending on profile
    full_name?: string;
    avatar_url?: string;
}

export interface Post {
    id: string;
    user_id: string;
    descripcion: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    ubicacion?: string;
    hashtags?: string[];
    is_public: boolean;
    created_at: string;
    updated_at: string;
    user: {
        username: string; // From backend join
        avatar_url?: string;
        full_name?: string;
        is_verified?: boolean;
    };
    _count: {
        likes: number;
        comments: number;
    };
    liked_by_me: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user: {
        username: string;
        avatar_url?: string;
    };
    is_mine: boolean;
}

export interface CreatePostPayload {
    descripcion: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    ubicacion?: string;
    hashtags?: string[];
    is_public?: boolean;
}

export interface CreateCommentPayload {
    content: string;
}
