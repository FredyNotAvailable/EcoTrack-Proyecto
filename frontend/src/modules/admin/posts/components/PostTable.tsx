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
    Tooltip,
    AspectRatio
} from '@chakra-ui/react';
import React from 'react';
import { HiDotsVertical, HiTrash, HiEye, HiOutlineHeart, HiOutlineChatAlt, HiBadgeCheck, HiPhotograph, HiExclamation } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '../../shared/EmptyState';

// Motion components
const MotionTr = motion(Tr);

interface PostTableProps {
    onViewDetail: (post: any) => void;
    onDelete: (id: string) => void;
    onDismissReport: (id: string) => void;
    posts: any[];
    isLoading: boolean;
}

export const PostTable = ({ onViewDetail, onDelete, onDismissReport, posts, isLoading }: PostTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    // Alert Dialogs state
    const deleteDisc = useDisclosure();
    const dismissDisc = useDisclosure();
    const cancelRef = React.useRef<any>(null);
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
                <VStack spacing={4}>
                    <Spinner size="xl" color="green.500" thickness="4px" speed="0.65s" emptyColor="gray.200" />
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Cargando publicaciones...</Text>
                </VStack>
            </Center>
        );
    }

    if (posts.length === 0) {
        return (
            <EmptyState
                title="Sin Publicaciones"
                description="No hay publicaciones para mostrar en este momento."
                icon={HiPhotograph}
            />
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
            shadow="lg"
            position="relative"
        >
            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                        <Tr>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Autor</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Contenido</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Media</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Impacto</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Fecha</Th>
                            <Th py={6} isNumeric fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <AnimatePresence>
                            {posts.map((post, index) => (
                                <MotionTr
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    _hover={{ bg: hoverBg }}
                                >
                                    <Td py={4}>
                                        <HStack spacing={3}>
                                            <Avatar
                                                size="md"
                                                name={post.user?.username}
                                                src={post.user?.avatar_url}
                                                border="2px solid"
                                                borderColor="white"
                                                shadow="md"
                                            />
                                            <Box>
                                                <Text fontWeight="800" fontSize="sm" color="gray.700">
                                                    @{post.user?.username || 'Usuario'}
                                                </Text>
                                                <Badge
                                                    colorScheme={post.is_reported ? 'red' : 'green'}
                                                    variant="subtle"
                                                    fontSize="10px"
                                                    borderRadius="full"
                                                    px={2}
                                                >
                                                    {post.is_reported ? 'REPORTADO' : 'ACTIVO'}
                                                </Badge>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td maxW="300px">
                                        <VStack align="start" spacing={1}>
                                            <Text noOfLines={2} fontSize="sm" fontWeight="500" color="gray.600">
                                                {post.descripcion || <Text as="span" color="gray.400" fontStyle="italic">Sin descripción...</Text>}
                                            </Text>
                                            {post.is_reported && (
                                                <HStack spacing={1} color="red.500">
                                                    <Icon as={HiExclamation} />
                                                    <Text fontSize="xs" fontWeight="bold">Reportado por la comunidad</Text>
                                                </HStack>
                                            )}
                                        </VStack>
                                    </Td>
                                    <Td>
                                        {post.media ? (
                                            <AspectRatio ratio={16 / 9} w="80px" borderRadius="xl" overflow="hidden" border="1px solid" borderColor="gray.100">
                                                <Image
                                                    src={post.media.media_url}
                                                    objectFit="cover"
                                                    fallback={<Center bg="gray.100" h="full"><Icon as={HiPhotograph} color="gray.400" /></Center>}
                                                />
                                            </AspectRatio>
                                        ) : (
                                            <Center w="80px" h="45px" bg="gray.50" borderRadius="xl" border="1px dashed" borderColor="gray.200">
                                                <Text fontSize="xs" color="gray.400" fontWeight="bold">TXT</Text>
                                            </Center>
                                        )}
                                    </Td>
                                    <Td>
                                        <HStack spacing={4}>
                                            <Tooltip label="Likes" hasArrow placement="top">
                                                <HStack spacing={1} bg="pink.50" color="pink.500" px={2} py={1} borderRadius="lg">
                                                    <Icon as={HiOutlineHeart} />
                                                    <Text fontSize="xs" fontWeight="900">{post.likes || 0}</Text>
                                                </HStack>
                                            </Tooltip>
                                            <Tooltip label="Comentarios" hasArrow placement="top">
                                                <HStack spacing={1} bg="blue.50" color="blue.500" px={2} py={1} borderRadius="lg">
                                                    <Icon as={HiOutlineChatAlt} />
                                                    <Text fontSize="xs" fontWeight="900">{post.comments || 0}</Text>
                                                </HStack>
                                            </Tooltip>
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm" fontWeight="600" color="gray.500">
                                        {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </Td>
                                    <Td isNumeric>
                                        <Menu>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label="Opciones"
                                                icon={<HiDotsVertical />}
                                                variant="ghost"
                                                size="sm"
                                                borderRadius="full"
                                                _hover={{ bg: 'white', shadow: 'md' }}
                                            />
                                            <MenuList borderRadius="xl" shadow="2xl" border="none" p={2} zIndex={10}>
                                                <MenuItem
                                                    icon={<HiEye />}
                                                    onClick={() => onViewDetail(post)}
                                                    fontWeight="600"
                                                    borderRadius="lg"
                                                    mb={1}
                                                >
                                                    Ver Detalles
                                                </MenuItem>

                                                {post.is_reported && (
                                                    <MenuItem
                                                        icon={<HiBadgeCheck />}
                                                        color="green.500"
                                                        onClick={() => handleDismissClick(post)}
                                                        fontWeight="600"
                                                        borderRadius="lg"
                                                        mb={1}
                                                    >
                                                        Descartar Reporte
                                                    </MenuItem>
                                                )}

                                                <MenuItem
                                                    icon={<HiTrash />}
                                                    color="red.500"
                                                    onClick={() => handleDeleteClick(post)}
                                                    fontWeight="600"
                                                    borderRadius="lg"
                                                    _hover={{ bg: 'red.50' }}
                                                >
                                                    Eliminar Publicación
                                                </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </MotionTr>
                            ))}
                        </AnimatePresence>
                    </Tbody>
                </Table>
            </Box>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={deleteDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={deleteDisc.onClose}
                isCentered
                motionPreset="slideInBottom"
            >
                <AlertDialogOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
                <AlertDialogContent borderRadius="3xl" shadow="2xl">
                    <AlertDialogHeader fontSize="xl" fontWeight="900" pt={8} px={8}>
                        <HStack spacing={3} color="red.500" mb={2}>
                            <Icon as={HiTrash} boxSize={6} />
                            <Text>Eliminar Publicación</Text>
                        </HStack>
                    </AlertDialogHeader>

                    <AlertDialogBody px={8}>
                        <Text color="gray.600" mb={4}>
                            ¿Estás seguro de eliminar esta publicación de <Text as="span" fontWeight="800" color="gray.800">@{selectedPost?.user?.username}</Text>?
                        </Text>
                        <Box p={4} bg="red.50" borderRadius="xl" border="1px dashed" borderColor="red.200">
                            <HStack align="start" color="red.600">
                                <Icon as={HiExclamation} mt={1} />
                                <Text fontSize="sm" fontWeight="600">
                                    Esta acción eliminará permanentemente el contenido, todos sus likes y comentarios. No se puede deshacer.
                                </Text>
                            </HStack>
                        </Box>
                    </AlertDialogBody>

                    <AlertDialogFooter pb={8} px={8}>
                        <Button ref={cancelRef} onClick={deleteDisc.onClose} borderRadius="full" size="lg" fontWeight="bold">
                            Cancelar
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="full" size="lg" shadow="lg" _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}>
                            Sí, Eliminar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dismiss Report Confirmation Dialog */}
            <AlertDialog
                isOpen={dismissDisc.isOpen}
                leastDestructiveRef={cancelRef}
                onClose={dismissDisc.onClose}
                isCentered
                motionPreset="slideInBottom"
            >
                <AlertDialogOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
                <AlertDialogContent borderRadius="3xl" shadow="2xl">
                    <AlertDialogHeader fontSize="xl" fontWeight="900" pt={8} px={8}>
                        <HStack spacing={3} color="green.500" mb={2}>
                            <Icon as={HiBadgeCheck} boxSize={6} />
                            <Text>Descartar Reporte</Text>
                        </HStack>
                    </AlertDialogHeader>

                    <AlertDialogBody px={8}>
                        <Text color="gray.600">
                            ¿Confirmas que esta publicación no infringe las normas de la comunidad?
                        </Text>
                        <Text mt={4} fontSize="sm" color="gray.500" bg="gray.100" p={3} borderRadius="xl">
                            El indicador de "Reportado" será removido y la publicación volverá a ser visible para todos sin advertencias.
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter pb={8} px={8}>
                        <Button ref={cancelRef} onClick={dismissDisc.onClose} borderRadius="full" size="lg" fontWeight="bold">
                            Cancelar
                        </Button>
                        <Button colorScheme="green" onClick={confirmDismiss} ml={3} borderRadius="full" size="lg" shadow="lg" _hover={{ shadow: 'xl', transform: 'translateY(-2px)' }}>
                            Confirmar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
};
