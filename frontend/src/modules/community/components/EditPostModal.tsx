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
}

export const EditPostModal = ({ isOpen, onClose, post }: EditPostModalProps) => {
    const toast = useToast();
    const queryClient = useQueryClient();

    const updatePost = useMutation({
        mutationFn: (data: { descripcion: string; ubicacion?: string; hashtags?: string[] }) =>
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

    const handleSubmit = (data: { descripcion: string; ubicacion?: string; hashtags?: string[] }) => {
        updatePost.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent bg="transparent" boxShadow="none">
                <PostEditor
                    onSubmit={handleSubmit}
                    isSubmitting={updatePost.isPending}
                    onClose={onClose}
                    initialData={{
                        descripcion: post.descripcion,
                        ubicacion: post.ubicacion || undefined,
                        hashtags: post.hashtags || [],
                        media_url: post.media_url,
                        media_type: post.media_type
                    }}
                />
            </ModalContent>
        </Modal>
    );
};
