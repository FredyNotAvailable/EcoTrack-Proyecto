import { supabase } from '../../config/supabaseClient';
import { UploadResponse } from './posts.types';

export class PostsStorage {
    private bucketName = 'posts';

    async createUploadUrl(userId: string, postId: string, mimeType: string): Promise<UploadResponse> {
        const ext = this.getExtension(mimeType);
        const timestamp = Date.now();
        const filePath = `${userId}/${postId}/${timestamp}.${ext}`;

        const { data, error } = await supabase
            .storage
            .from(this.bucketName)
            .createSignedUploadUrl(filePath);

        if (error) throw error;

        return {
            path: filePath,
            signedUrl: data.signedUrl // valid for 60 seconds by default usually, or customizable
        };
    }

    private getExtension(mime: string): string {
        switch (mime) {
            case 'image/jpeg': return 'jpg';
            case 'image/png': return 'png';
            case 'image/webp': return 'webp';
            case 'video/mp4': return 'mp4';
            case 'video/webm': return 'webm';
            default: return 'bin';
        }
    }
}
