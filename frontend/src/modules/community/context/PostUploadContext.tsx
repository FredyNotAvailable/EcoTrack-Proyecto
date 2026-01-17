import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { useToast } from '@chakra-ui/react';
import { PostsService } from '../../posts/services/posts.service';
import { useCreatePost } from '../../posts/hooks/usePosts';

export interface UploadState {
    previewUrl: string | null;
    progress: number;
    status: 'uploading' | 'creating' | 'preloading' | 'success' | 'error';
    message: string;
}

interface PostUploadContextType {
    uploadState: UploadState | null;
    handleBackgroundSubmit: (data: any) => Promise<void>;
}

const PostUploadContext = createContext<PostUploadContextType | undefined>(undefined);

export const PostUploadProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [uploadState, setUploadState] = useState<UploadState | null>(null);
    const createPostMutation = useCreatePost();
    const toast = useToast();

    const preloadMedia = async (media: { media_url: string; media_type: string }[]) => {
        const promises = media.map(m => {
            return new Promise((resolve) => {
                if (m.media_type === 'video') {
                    const video = document.createElement('video');
                    video.src = m.media_url;
                    video.preload = 'auto';
                    video.onloadeddata = () => resolve(true);
                    video.onerror = () => resolve(false); // Resolve anyway to not block forever
                    // Timeout as fallback
                    setTimeout(() => resolve(false), 10000);
                } else {
                    const img = new Image();
                    img.src = m.media_url;
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                    // Timeout as fallback
                    setTimeout(() => resolve(false), 10000);
                }
            });
        });
        await Promise.all(promises);
    };

    const handleBackgroundSubmit = async (data: any) => {
        // Initial state
        const firstMedia = data.mediaItems[0];
        setUploadState({
            previewUrl: firstMedia?.url || null,
            progress: 10,
            status: 'uploading',
            message: 'Subiendo contenido...'
        });

        try {
            let mediaPayload: { url: string; type: 'image' | 'video' }[] = [];

            // 1. Upload Media
            const newFiles = data.mediaItems.filter((item: any) => item.isNew && item.file);
            if (newFiles.length > 0) {
                const totalFiles = newFiles.length;
                const urls: string[] = [];

                for (let i = 0; i < newFiles.length; i++) {
                    const url = await PostsService.uploadMedia(newFiles[i].file);
                    urls.push(url);
                    setUploadState(prev => prev ? ({
                        ...prev,
                        progress: 10 + ((i + 1) / totalFiles) * 70, // 10% to 80% span
                        message: `Subiendo ${i + 1} de ${totalFiles}...`
                    }) : null);
                }

                mediaPayload = urls.map((url, index) => ({
                    url: url,
                    type: newFiles[index].type
                }));
            }

            // 2. Create Post
            setUploadState(prev => prev ? ({
                ...prev,
                status: 'creating',
                progress: 90,
                message: 'Finalizando publicación...'
            }) : null);

            const newPost = await createPostMutation.mutateAsync({
                descripcion: data.descripcion,
                is_public: true,
                ubicacion: data.ubicacion,
                media: mediaPayload,
                hashtags: data.hashtags
            } as any);

            // 3. Preload created media
            if (newPost.media && newPost.media.length > 0) {
                setUploadState(prev => prev ? ({
                    ...prev,
                    status: 'preloading',
                    progress: 95,
                    message: 'Preparando vista...'
                }) : null);
                await preloadMedia(newPost.media);
            }

            // 4. Success
            setUploadState(prev => prev ? ({
                ...prev,
                status: 'success',
                progress: 100,
                message: '¡Publicación exitosa!'
            }) : null);

            // Close after 3 seconds
            setTimeout(() => {
                setUploadState(null);
            }, 3000);

        } catch (error) {
            console.error('Background upload error:', error);
            setUploadState(prev => prev ? ({
                ...prev,
                status: 'error',
                message: 'Error al publicar'
            }) : null);
            toast({
                title: 'Error al publicar',
                description: 'Hubo un problema al subir tu publicación.',
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        }
    };

    return (
        <PostUploadContext.Provider value={{ uploadState, handleBackgroundSubmit }}>
            {children}
        </PostUploadContext.Provider>
    );
};

export const usePostUpload = () => {
    const context = useContext(PostUploadContext);
    if (context === undefined) {
        throw new Error('usePostUpload must be used within a PostUploadProvider');
    }
    return context;
};
