import { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    useToast
} from '@chakra-ui/react';
import { PostEditor } from './PostEditor';
import { PostsService } from '../../posts/services/posts.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../../posts/types';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onCloseComplete?: () => void;
}

export const EditPostModal = ({ isOpen, onClose, post, onCloseComplete }: EditPostModalProps) => {
    const toast = useToast();
    const queryClient = useQueryClient();

    const [isUploading, setIsUploading] = useState(false); // Add uploading state

    const updatePost = useMutation({
        mutationFn: (data: { descripcion: string; ubicacion?: string; hashtags?: string[]; media?: any[] }) =>
            PostsService.updatePost(post.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast({
                title: 'Post actualizado',
                status: 'success',
                duration: 3000,
            });
            onClose();
        },
        onError: () => {
            toast({
                title: 'Error al actualizar',
                status: 'error',
                duration: 3000,
            });
        }
    });

    const handleSubmit = async (data: {
        descripcion: string;
        mediaItems: any[]; // EditorMediaItem[]
        ubicacion?: string;
        hashtags?: string[]
    }) => {
        setIsUploading(true);
        try {
            // Process media items to get final URLs order
            const finalMedia = await Promise.all(data.mediaItems.map(async (item) => {
                if (item.isNew && item.file) {
                    const url = await PostsService.uploadMedia(item.file);
                    return {
                        url: url,
                        type: item.type
                    };
                } else {
                    return {
                        url: item.url,
                        type: item.type
                    };
                }
            }));

            updatePost.mutate({
                descripcion: data.descripcion,
                ubicacion: data.ubicacion,
                hashtags: data.hashtags,
                media: finalMedia
            });
        } catch (error) {
            toast({
                title: 'Error al subir archivos',
                status: 'error'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} onCloseComplete={onCloseComplete} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent bg="transparent" boxShadow="none">
                <PostEditor
                    onSubmit={handleSubmit}
                    isSubmitting={updatePost.isPending || isUploading}
                    initialData={{
                        descripcion: post.descripcion,
                        ubicacion: post.ubicacion || undefined,
                        hashtags: post.hashtags || [],
                        media: post.media
                    }}
                />
            </ModalContent>
        </Modal>
    );
};
