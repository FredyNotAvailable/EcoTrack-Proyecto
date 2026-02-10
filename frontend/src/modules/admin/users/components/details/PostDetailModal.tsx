import { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, VStack, Box, Image, Text, HStack, Divider, Badge, Icon, IconButton } from '@chakra-ui/react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
}

export const PostDetailModal = ({ isOpen, onClose, post }: PostDetailModalProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        if (post?.media && currentImageIndex < post.media.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setCurrentImageIndex(0);
        onClose();
    };

    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalOverlay backdropFilter="blur(5px)" />
            <ModalContent borderRadius="3xl" overflow="hidden">
                <ModalCloseButton borderRadius="full" bg="white" zIndex={2} />
                <ModalBody p={0}>
                    <VStack align="stretch" spacing={0}>
                        {post.media && post.media.length > 0 && (
                            <Box position="relative" bg="black">
                                <Image
                                    src={post.media[currentImageIndex]?.media_url}
                                    w="full"
                                    maxH="400px"
                                    objectFit="contain"
                                />
                                {post.media.length > 1 && (
                                    <>
                                        {currentImageIndex > 0 && (
                                            <IconButton
                                                aria-label="Anterior"
                                                icon={<Icon as={HiChevronLeft} boxSize={6} />}
                                                position="absolute"
                                                left={2}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                onClick={prevImage}
                                                borderRadius="full"
                                                bg="whiteAlpha.800"
                                                _hover={{ bg: "white" }}
                                                size="sm"
                                            />
                                        )}
                                        {currentImageIndex < post.media.length - 1 && (
                                            <IconButton
                                                aria-label="Siguiente"
                                                icon={<Icon as={HiChevronRight} boxSize={6} />}
                                                position="absolute"
                                                right={2}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                onClick={nextImage}
                                                borderRadius="full"
                                                bg="whiteAlpha.800"
                                                _hover={{ bg: "white" }}
                                                size="sm"
                                            />
                                        )}
                                        <HStack
                                            position="absolute"
                                            bottom={2}
                                            left="50%"
                                            transform="translateX(-50%)"
                                            spacing={1}
                                        >
                                            {post.media.map((_: any, idx: number) => (
                                                <Box
                                                    key={idx}
                                                    w="6px"
                                                    h="6px"
                                                    borderRadius="full"
                                                    bg={idx === currentImageIndex ? "white" : "whiteAlpha.500"}
                                                    transition="all 0.2s"
                                                />
                                            ))}
                                        </HStack>
                                    </>
                                )}
                            </Box>
                        )}
                        <Box p={6}>
                            <Text color="gray.500" fontSize="xs" mb={2}>Publicado el {new Date(post.created_at).toLocaleString()}</Text>
                            <Text fontWeight="bold" fontSize="lg" mb={6}>{post.descripcion}</Text>

                            <HStack spacing={6} p={4} bg="gray.50" borderRadius="2xl" justify="center">
                                <VStack spacing={0}>
                                    <Text fontWeight="extrabold" fontSize="xl" color="brand.500">{post.likes}</Text>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500">REACCIONES</Text>
                                </VStack>
                                <Divider orientation="vertical" h="30px" />
                                <VStack spacing={0}>
                                    <Text fontWeight="extrabold" fontSize="xl" color="blue.500">{post.comments}</Text>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500">COMENTARIOS</Text>
                                </VStack>
                                <Divider orientation="vertical" h="30px" />
                                <VStack spacing={0}>
                                    <Badge colorScheme={post.is_public ? 'green' : 'gray'}>{post.is_public ? 'Público' : 'Solo Amigos'}</Badge>
                                    <Text fontSize="xs" fontWeight="bold" color="gray.500" mt={1}>AUDIENCIA</Text>
                                </VStack>
                            </HStack>

                            {post.hashtags && post.hashtags.length > 0 && (
                                <HStack mt={6} flexWrap="wrap">
                                    {post.hashtags.map((tag: string, idx: number) => (
                                        <Badge key={idx} colorScheme="blue" variant="subtle" px={2} py={1} borderRadius="lg">#{tag}</Badge>
                                    ))}
                                </HStack>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
