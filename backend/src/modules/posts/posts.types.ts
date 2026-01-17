export interface PostMedia {
    id: string;
    post_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    position: number;
}

export interface Post {
    id: string;
    user_id: string;
    descripcion: string;
    media: PostMedia[];
    ubicacion?: string | null;
    hashtags?: string[] | null;
    is_public: boolean;
    is_reported: boolean;
    created_at: string;
    updated_at: string;

    // Aggregated fields
    likes_count?: number;
    comments_count?: number;
    liked_by_me?: boolean;

    // User data (joined)
    user?: {
        username: string;
        avatar_url: string;
    };
}

export interface PostComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    user?: {
        username: string;
        avatar_url: string;
    };
}

export interface CreatePostDTO {
    descripcion: string;
    is_public?: boolean;
    ubicacion?: string;
    hashtags?: string[];
    media?: {
        url: string;
        type: 'image' | 'video';
    }[];
}

export interface CreateCommentDTO {
    content: string;
}

export interface PostListOptions {
    limit?: number;
    cursor?: string; // Timestamptz string
    userId?: string; // To check liked_by_me
    authorId?: string; // To filter by specific user
    hashtag?: string; // To filter by hashtag
}

export interface UploadResponse {
    path: string;
    signedUrl: string;
}
