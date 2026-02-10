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
} from '@chakra-ui/react';
import { HiOutlineHeart, HiOutlineChatAlt, HiOutlineCalendar, HiBadgeCheck } from 'react-icons/hi';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any;
    onDismissReport?: (id: string) => void;
}

export const PostDetailModal = ({ isOpen, onClose, post, onDismissReport }: PostDetailModalProps) => {
    if (!post) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="3xl" overflow="hidden">
                <ModalHeader borderBottomWidth="1px" py={4}>
                    Detalles de la Publicación
                </ModalHeader>
                <ModalCloseButton top={4} />

                <ModalBody p={0}>
                    <VStack align="stretch" spacing={0}>
                        {/* Autor Info */}
                        <Box p={6}>
                            <HStack spacing={4}>
                                <Avatar name={post.user?.username} src={post.user?.avatar_url} size="md" />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="800" fontSize="lg">{post.user?.username}</Text>
                                    <HStack spacing={2} color="gray.500">
                                        <Icon as={HiOutlineCalendar} />
                                        <Text fontSize="xs">
                                            Publicado el {new Date(post.created_at).toLocaleString()}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </HStack>
                        </Box>

                        {/* Contenido */}
                        <Box px={6} pb={6}>
                            <Text fontSize="md" lineHeight="tall" color="gray.700">
                                {post.descripcion}
                            </Text>
                        </Box>

                        {/* Imagen (si existe) */}
                        {post.media && (
                            <Box w="full" bg="gray.100">
                                <Image
                                    src={post.media.media_url}
                                    w="full"
                                    maxH="500px"
                                    objectFit="contain"
                                    mx="auto"
                                />
                            </Box>
                        )}

                        {/* Métricas */}
                        <Box p={6}>
                            <HStack spacing={6} justify="center" bg="gray.50" p={4} borderRadius="2xl">
                                <VStack spacing={0}>
                                    <HStack spacing={1} color="red.500">
                                        <Icon as={HiOutlineHeart} boxSize={5} />
                                        <Text fontWeight="bold" fontSize="lg">{post.likes}</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.400">Likes</Text>
                                </VStack>
                                <Divider orientation="vertical" h="30px" />
                                <VStack spacing={0}>
                                    <HStack spacing={1} color="blue.500">
                                        <Icon as={HiOutlineChatAlt} boxSize={5} />
                                        <Text fontWeight="bold" fontSize="lg">{post.comments}</Text>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.400">Comentarios</Text>
                                </VStack>
                            </HStack>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter borderTopWidth="1px" p={4}>
                    <HStack spacing={3} w="full">
                        <Button variant="ghost" onClick={onClose} borderRadius="xl">
                            Cerrar
                        </Button>
                        <Flex flex={1} />
                        {post.is_reported && onDismissReport && (
                            <Button
                                colorScheme="green"
                                leftIcon={<HiBadgeCheck />}
                                onClick={() => {
                                    onDismissReport(post.id);
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
