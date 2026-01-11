import { supabase } from '../../../config/supabase';

export const StorageService = {
    /**
     * Uploads an avatar image to the user's folder in the 'avatars' bucket.
     * @param userId The User ID to create the folder path.
     * @param imageBlob The image data as a Blob (WebP recommended).
     * @returns The public URL of the uploaded image.
     */
    async uploadAvatar(userId: string, imageBlob: Blob): Promise<string> {
        const filePath = `${userId}/avatar.webp`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, imageBlob, {
                upsert: true,
                contentType: 'image/webp'
            });

        if (uploadError) {
            throw new Error(`Error subiendo imagen: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return `${data.publicUrl}?t=${new Date().getTime()}`;
    }
};
