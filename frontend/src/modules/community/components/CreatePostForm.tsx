import {
    Box,
    useToast,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent
} from '@chakra-ui/react';
import { useState } from 'react';
import { useCreatePost } from '../../posts/hooks/usePosts';
import { PostsService } from '../../posts/services/posts.service';
import { PostEditor } from './PostEditor';

interface CreatePostFormProps {
    onBackgroundSubmit?: (data: any) => void;
}

export const CreatePostForm = ({ onBackgroundSubmit }: CreatePostFormProps) => {
    const createPost = useCreatePost();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = async (data: {
        descripcion: string;
        mediaItems: any[];
        ubicacion?: string;
        hashtags?: string[];
    }) => {
        if (onBackgroundSubmit) {
            onBackgroundSubmit(data);
            onClose();
            return;
        }

        // Fallback to old synchronous behavior if no background handler provided
        // (though we plan to use it everywhere)
        let mediaPayload: { url: string; type: 'image' | 'video' }[] = [];
        const newFiles = data.mediaItems.filter(item => item.isNew && item.file);

        if (newFiles.length > 0) {
            setIsUploading(true);
            try {
                const uploadPromises = newFiles.map(item => PostsService.uploadMedia(item.file));
                const urls = await Promise.all(uploadPromises);

                mediaPayload = urls.map((url, index) => {
                    const item = newFiles[index];
                    return {
                        url: url,
                        type: item.type
                    };
                });
            } catch (error) {
                console.error('Error uploading media:', error);
                toast({
                    title: 'Error al subir archivos',
                    description: 'No se pudieron subir las imágenes/video.',
                    status: 'error',
                    duration: 3000,
                });
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        createPost.mutate(
            {
                descripcion: data.descripcion,
                is_public: true,
                ubicacion: data.ubicacion,
                media: mediaPayload,
                hashtags: data.hashtags
            } as any,
            {
                onSuccess: () => {
                    toast({
                        title: 'Publicación creada',
                        status: 'success',
                        duration: 3000,
                    });
                    onClose();
                },
                onError: () => {
                    toast({
                        title: 'Error al crear publicación',
                        status: 'error',
                        duration: 3000,
                    });
                }
            }
        );
    };


    return (
        <Box mb={6} textAlign="center">
            <Button onClick={onOpen} width="100%" borderRadius="2xl" py={6} shadow="sm">
                ¿Qué estás pensando hoy? 🌿
            </Button>

            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
                <ModalContent bg="transparent" boxShadow="none">
                    {/* PostEditor already has its own styling, so we render it directly or wrap it?
                        PostEditor has a fixed maxW="600px" and card styling.
                        ModalContent has default white bg. We should make ModalContent transparent 
                        and let PostEditor be the card.
                     */}
                    <PostEditor
                        onSubmit={handleSubmit}
                        isSubmitting={createPost.isPending || isUploading}
                    // Optionally pass initialData if needed
                    />
                </ModalContent>
            </Modal>
        </Box>
    );
};
