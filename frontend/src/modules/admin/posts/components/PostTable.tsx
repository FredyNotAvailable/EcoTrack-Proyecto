import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Avatar,
    Text,
    HStack,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Box,
    Badge,
    Image,
    Icon,
    VStack,
    Center,
    Spinner,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Button,
} from '@chakra-ui/react';
import React from 'react';
import { HiDotsVertical, HiTrash, HiEye, HiOutlineHeart, HiOutlineChatAlt, HiBadgeCheck } from 'react-icons/hi';

interface PostTableProps {
    onViewDetail: (post: any) => void;
    onDelete: (id: string) => void;
    onDismissReport: (id: string) => void;
    posts: any[];
    isLoading: boolean;
}

export const PostTable = ({ onViewDetail, onDelete, onDismissReport, posts, isLoading }: PostTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Alert Dialogs state
    const deleteDisc = useDisclosure();
    const dismissDisc = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const [selectedPost, setSelectedPost] = React.useState<any>(null);

    const handleDeleteClick = (post: any) => {
        setSelectedPost(post);
        deleteDisc.onOpen();
    };

    const handleDismissClick = (post: any) => {
        setSelectedPost(post);
        dismissDisc.onOpen();
    };

    const confirmDelete = () => {
        if (selectedPost) {
            onDelete(selectedPost.id);
            deleteDisc.onClose();
        }
    };

    const confirmDismiss = () => {
        if (selectedPost) {
            onDismissReport(selectedPost.id);
            dismissDisc.onClose();
        }
    };

    if (isLoading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Center>
        );
    }

    if (posts.length === 0) {
        return (
            <Center py={20} bg={bg} borderRadius="2xl" border="1px" borderColor={borderColor}>
                <VStack>
                    <Text color="gray.500">No se encontraron publicaciones.</Text>
                </VStack>
            </Center>
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
            shadow="sm"
        >
            <Table variant="simple">
                <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Tr>
                        <Th py={4}>Usuario</Th>
                        <Th py={4}>Contenido</Th>
                        <Th py={4}>Media</Th>
                        <Th py={4}>Interacciones</Th>
                        <Th py={4}>Fecha</Th>
                        <Th py={4} isNumeric>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {posts.map((post) => (
                        <Tr key={post.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                            <Td>
                                <HStack spacing={3}>
                                    <Avatar size="sm" name={post.user?.username} src={post.user?.avatar_url} />
                                    <Text fontWeight="bold" fontSize="sm">{post.user?.username || 'Usuario'}</Text>
                                </HStack>
                            </Td>
                            <Td maxW="300px">
                                <VStack align="start" spacing={1}>
                                    <Text noOfLines={2} fontSize="sm">
                                        {post.descripcion}
                                    </Text>
                                    {post.is_reported && (
                                        <Badge colorScheme="red" variant="solid" fontSize="10px" borderRadius="full" px={2}>
                                            Reportado
                                        </Badge>
                                    )}
                                </VStack>
                            </Td>
                            <Td>
                                {post.media ? (
                                    <Box borderRadius="lg" overflow="hidden" w="60px" h="40px" bg="gray.100">
                                        <Image src={post.media.media_url} objectFit="cover" w="full" h="full" />
                                    </Box>
                                ) : (
                                    <Badge colorScheme="gray" variant="subtle">Texto</Badge>
                                )}
                            </Td>
                            <Td>
                                <HStack spacing={4}>
                                    <HStack spacing={1}>
                                        <Icon as={HiOutlineHeart} color="red.400" />
                                        <Text fontSize="sm" fontWeight="medium">{post.likes}</Text>
                                    </HStack>
                                    <HStack spacing={1}>
                                        <Icon as={HiOutlineChatAlt} color="blue.400" />
                                        <Text fontSize="sm" fontWeight="medium">{post.comments}</Text>
                                    </HStack>
                                </HStack>
                            </Td>
                            <Td fontSize="xs" color="gray.500">
                                {new Date(post.created_at).toLocaleDateString()}
                            </Td>
                            <Td isNumeric>
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        aria-label="Opciones"
                                        icon={<HiDotsVertical />}
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="xl"
                                    />
                                    <MenuList borderRadius="xl" shadow="xl" border="none">
                                        <MenuItem
                                            icon={<HiEye />}
                                            onClick={() => onViewDetail(post)}
                                            fontSize="sm"
                                        >
                                            Ver Detalles
                                        </MenuItem>

                                        {post.is_reported && (
                                            <MenuItem
                                                icon={<HiBadgeCheck />}
                                                color="green.500"
                                                onClick={() => handleDismissClick(post)}
                                                fontSize="sm"
                                            >
                                                Descartar Reporte
                                            </MenuItem>
                                        )}

                                        <MenuItem
                                            icon={<HiTrash />}
                                            color="red.500"
                                            onClick={() => handleDeleteClick(post)}
                                            fontSize="sm"
                                        >
                                            Eliminar Publicación
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={deleteDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={deleteDisc.onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Eliminar Publicación
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Estás seguro de eliminar esta publicación de <b>{selectedPost?.user?.username}</b>?
                            <Text mt={2} color="red.500" fontSize="sm">
                                Esta acción eliminará permanentemente el contenido y todas sus interacciones de la comunidad.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={deleteDisc.onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="xl">
                                Confirmar Eliminación
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Dismiss Report Confirmation Dialog */}
            <AlertDialog
                isOpen={dismissDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={dismissDisc.onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Descartar Reporte
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Confirmas que esta publicación no infringe las normas de la comunidad?
                            <Text mt={2} fontSize="sm" color="gray.500">
                                El indicador de "Reportado" será removido y la publicación volverá a su estado normal.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={dismissDisc.onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="green" onClick={confirmDismiss} ml={3} borderRadius="xl">
                                Descartar Reporte
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};
