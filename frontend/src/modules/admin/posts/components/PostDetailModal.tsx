import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Button,
    VStack,
    HStack,
    Avatar,
    Text,
    Box,
    Image,
    Divider,
    Icon,
    Flex,
    useColorModeValue,
    IconButton,
    Spinner,
    Center
} from '@chakra-ui/react';
import { HiOutlineHeart, HiOutlineChatAlt, HiOutlineCalendar, HiBadgeCheck, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useQuery } from '@tanstack/react-query';
import { AdminAPIService } from '../../services/admin.service';
import { useState } from 'react';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
    onDismissReport?: (id: string) => void;
}

export const PostDetailModal = ({ isOpen, onClose, post, onDismissReport }: PostDetailModalProps) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const bgComment = useColorModeValue('gray.50', 'gray.700');

    const { data: fullPost, isLoading } = useQuery({
        queryKey: ['admin', 'post', post?.id],
        queryFn: () => AdminAPIService.getPostDetails(post.id),
        enabled: !!post && isOpen,
    });

    const handleNextImage = () => {
        if (fullPost?.media) {
            setCurrentImageIndex((prev) => (prev + 1) % fullPost.media.length);
        }
    };

    const handlePrevImage = () => {
        if (fullPost?.media) {
            setCurrentImageIndex((prev) => (prev - 1 + fullPost.media.length) % fullPost.media.length);
        }
    };

    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="3xl" overflow="hidden">
                <ModalHeader borderBottomWidth="1px" py={4}>
                    Detalles de la Publicación
                </ModalHeader>
                <ModalCloseButton top={4} right={4} borderRadius="full" />

                <ModalBody p={0}>
                    {isLoading ? (
                        <Center py={20}>
                            <Spinner size="xl" color="brand.500" />
                        </Center>
                    ) : (
                        <VStack align="stretch" spacing={0}>
                            {/* Autor Info */}
                            <Box p={6}>
                                <HStack spacing={4}>
                                    <Avatar name={fullPost?.user?.username} src={fullPost?.user?.avatar_url} size="md" />
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="800" fontSize="lg">{fullPost?.user?.username}</Text>
                                        <HStack spacing={2} color="gray.500">
                                            <Icon as={HiOutlineCalendar} />
                                            <Text fontSize="xs">
                                                Publicado el {new Date(fullPost?.created_at).toLocaleString()}
                                            </Text>
                                        </HStack>
                                    </VStack>
                                </HStack>
                            </Box>

                            {/* Contenido */}
                            <Box px={6} pb={6}>
                                <Text fontSize="md" lineHeight="tall" color="gray.700">
                                    {fullPost?.descripcion}
                                </Text>
                            </Box>

                            {/* Carrusel de Imágenes */}
                            {fullPost?.media && fullPost.media.length > 0 && (
                                <Box w="full" bg="gray.900" position="relative" h="500px">
                                    <Center h="full">
                                        <Image
                                            src={fullPost.media[currentImageIndex].media_url}
                                            maxH="100%"
                                            maxW="100%"
                                            objectFit="contain"
                                        />
                                    </Center>

                                    {fullPost.media.length > 1 && (
                                        <>
                                            <IconButton
                                                aria-label="Previous image"
                                                icon={<HiChevronLeft size={24} />}
                                                position="absolute"
                                                left={2}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                onClick={handlePrevImage}
                                                borderRadius="full"
                                                bg="blackAlpha.600"
                                                color="white"
                                                _hover={{ bg: 'blackAlpha.800' }}
                                            />
                                            <IconButton
                                                aria-label="Next image"
                                                icon={<HiChevronRight size={24} />}
                                                position="absolute"
                                                right={2}
                                                top="50%"
                                                transform="translateY(-50%)"
                                                onClick={handleNextImage}
                                                borderRadius="full"
                                                bg="blackAlpha.600"
                                                color="white"
                                                _hover={{ bg: 'blackAlpha.800' }}
                                            />
                                            <Flex justify="center" position="absolute" bottom={4} w="full" gap={2}>
                                                {fullPost.media.map((_: any, idx: number) => (
                                                    <Box
                                                        key={idx}
                                                        w="8px"
                                                        h="8px"
                                                        borderRadius="full"
                                                        bg={idx === currentImageIndex ? "white" : "whiteAlpha.500"}
                                                        transition="all 0.2s"
                                                    />
                                                ))}
                                            </Flex>
                                        </>
                                    )}
                                </Box>
                            )}

                            {/* Métricas */}
                            <Box p={6}>
                                <HStack spacing={6} justify="center" bg="gray.50" p={4} borderRadius="2xl">
                                    <VStack spacing={0}>
                                        <HStack spacing={1} color="red.500">
                                            <Icon as={HiOutlineHeart} boxSize={5} />
                                            <Text fontWeight="bold" fontSize="lg">{fullPost?.likes}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.400">Likes</Text>
                                    </VStack>
                                    <Divider orientation="vertical" h="30px" />
                                    <VStack spacing={0}>
                                        <HStack spacing={1} color="blue.500">
                                            <Icon as={HiOutlineChatAlt} boxSize={5} />
                                            <Text fontWeight="bold" fontSize="lg">{fullPost?.comments_count?.[0]?.count || 0}</Text>
                                        </HStack>
                                        <Text fontSize="xs" color="gray.400">Comentarios</Text>
                                    </VStack>
                                </HStack>
                            </Box>

                            {/* Sección de Comentarios */}
                            <Box px={6} pb={8}>
                                <Text fontWeight="900" fontSize="sm" textTransform="uppercase" color="gray.500" mb={4} letterSpacing="wider">
                                    Comentarios ({fullPost?.comments?.length || 0})
                                </Text>

                                <VStack spacing={4} align="stretch" maxH="300px" overflowY="auto" pr={2}>
                                    {fullPost?.comments && fullPost.comments.length > 0 ? (
                                        fullPost.comments.map((comment: any) => (
                                            <HStack key={comment.id} align="start" spacing={3}>
                                                <Avatar
                                                    size="sm"
                                                    name={comment.user?.username}
                                                    src={comment.user?.avatar_url}
                                                />
                                                <Box bg={bgComment} p={3} borderRadius="xl" flex={1}>
                                                    <HStack justify="space-between" mb={1}>
                                                        <Text fontWeight="bold" fontSize="sm">
                                                            {comment.user?.username || 'Usuario desconocido'}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.400">
                                                            {new Date(comment.created_at).toLocaleDateString()}
                                                        </Text>
                                                    </HStack>
                                                    <Text fontSize="sm" color="gray.700">
                                                        {comment.content}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                        ))
                                    ) : (
                                        <Center py={8} flexDirection="column" color="gray.400">
                                            <Icon as={HiOutlineChatAlt} boxSize={8} mb={2} />
                                            <Text fontSize="sm">No hay comentarios aún.</Text>
                                        </Center>
                                    )}
                                </VStack>
                            </Box>
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter borderTopWidth="1px" p={4}>
                    <HStack spacing={3} w="full">
                        <Button variant="ghost" onClick={onClose} borderRadius="xl">
                            Cerrar
                        </Button>
                        <Flex flex={1} />
                        {fullPost?.is_reported && onDismissReport && (
                            <Button
                                colorScheme="green"
                                leftIcon={<HiBadgeCheck />}
                                onClick={() => {
                                    onDismissReport(fullPost.id);
                                    onClose();
                                }}
                                borderRadius="xl"
                            >
                                Descartar Reporte
                            </Button>
                        )}
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
