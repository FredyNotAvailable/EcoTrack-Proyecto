import {
    Box,
    useToast,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent
} from '@chakra-ui/react';
import { useCreatePost } from '../../posts/hooks/usePosts';
import { PostsService } from '../../posts/services/posts.service';
import { PostEditor } from './PostEditor';

export const CreatePostForm = () => {
    const createPost = useCreatePost();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false });

    const handleSubmit = async (data: {
        descripcion: string;
        media?: File;
        mediaType?: 'image' | 'video';
        ubicacion?: string;
        hashtags?: string[];
    }) => {
        // TODO: Handle media upload here if integrated (User asked for the *design* first)
        // Since we don't have the media upload service fully wired in the previous step (mocked),
        // we'll explicitly pass what we can. 

        // Note: The previous service had `createPost` taking payload.
        // We'll skip actual file upload logic and just send text for now unless we mocked it properly.
        // Or we pass the file to context? 
        // Let's implement basics.

        let finalMediaUrl: string | undefined;

        // 1. Upload Media if present
        console.log('Completing handleSubmit with media:', data.media);
        if (data.media) {
            // We could show a specific uploading toast or progress here
            try {
                finalMediaUrl = await PostsService.uploadMedia(data.media);
                console.log('Upload completed. URL:', finalMediaUrl);
            } catch (error) {
                console.error('Error uploading media:', error);
                toast({
                    title: 'Error al subir archivo',
                    description: 'No se pudo subir la imagen/video.',
                    status: 'error',
                    duration: 3000,
                });
                return; // Stop submission if upload fails
            }
        }

        // 2. Create Post
        console.log('Mutating createPost with:', { ...data, media_url: finalMediaUrl });
        createPost.mutate(
            {
                descripcion: data.descripcion,
                is_public: true,
                ubicacion: data.ubicacion,
                media_url: finalMediaUrl, // Added media_url
                media_type: data.mediaType
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Publicación creada',
                        status: 'success',
                        duration: 3000,
                    });
                    onClose(); // Close modal on success
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
                        isSubmitting={createPost.isPending}
                        onClose={onClose}
                    // Optionally pass initialData if needed
                    />
                </ModalContent>
            </Modal>
        </Box>
    );
};
