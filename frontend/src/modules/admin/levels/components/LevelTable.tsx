import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Box,
    useColorModeValue,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    Badge,
    Spinner,
    Center,
    Text,
    Flex,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    useDisclosure,
    Icon,
} from '@chakra-ui/react';
import { HiDotsVertical, HiPencil, HiTrash, HiChevronUp } from 'react-icons/hi';
import { useRef, useState } from 'react';

interface LevelTableProps {
    levels: any[];
    isLoading: boolean;
    onEdit: (level: any) => void;
    onDelete: (nivel: number) => void;
}

export const LevelTable = ({ levels, isLoading, onEdit, onDelete }: LevelTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Deletion Alert
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [levelToDelete, setLevelToDelete] = useState<any>(null);

    const handleDeleteClick = (level: any) => {
        setLevelToDelete(level);
        onOpen();
    };

    const confirmDelete = () => {
        if (levelToDelete) {
            onDelete(levelToDelete.nivel);
            onClose();
        }
    };

    if (isLoading) {
        return (
            <Center py={20}>
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Center>
        );
    }

    if (levels.length === 0) {
        return (
            <Center py={20} bg={bg} borderRadius="2xl" border="1px" borderColor={borderColor}>
                <Text color="gray.500">No hay niveles configurados aún.</Text>
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
                        <Th color="gray.500" fontWeight="bold">Nivel</Th>
                        <Th color="gray.500" fontWeight="bold">Puntos Mínimos</Th>
                        <Th color="gray.500" fontWeight="bold">Siguiente Nivel</Th>
                        <Th textAlign="right">Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {levels.map((level, index) => {
                        const nextLevel = levels[index + 1];
                        const pointsForNext = nextLevel ? nextLevel.puntos_minimos - level.puntos_minimos : null;

                        return (
                            <Tr key={level.nivel} _hover={{ bg: useColorModeValue('gray.50', 'gray.700/50') }} transition="all 0.2s">
                                <Td>
                                    <Flex align="center">
                                        <Center
                                            w="36px"
                                            h="36px"
                                            bg="brand.50"
                                            color="brand.primary"
                                            borderRadius="xl"
                                            fontWeight="800"
                                            mr={3}
                                        >
                                            {level.nivel}
                                        </Center>
                                        <Text fontWeight="bold">Nivel {level.nivel}</Text>
                                    </Flex>
                                </Td>
                                <Td>
                                    <Badge colorScheme="green" variant="subtle" borderRadius="lg" px={3} py={1}>
                                        {level.puntos_minimos.toLocaleString()} pts
                                    </Badge>
                                </Td>
                                <Td>
                                    {pointsForNext ? (
                                        <Flex align="center" color="gray.500" fontSize="sm">
                                            <Icon as={HiChevronUp} mr={1} boxSize={3} />
                                            Reclama {pointsForNext.toLocaleString()} pts más para subir
                                        </Flex>
                                    ) : (
                                        <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2} fontSize="10px">
                                            NIVEL MÁXIMO
                                        </Badge>
                                    )}
                                </Td>
                                <Td textAlign="right">
                                    <Menu>
                                        <MenuButton
                                            as={IconButton}
                                            icon={<HiDotsVertical />}
                                            variant="ghost"
                                            borderRadius="full"
                                            size="sm"
                                        />
                                        <MenuList borderRadius="xl" shadow="lg" border="none" p={2}>
                                            <MenuItem
                                                icon={<HiPencil />}
                                                onClick={() => onEdit(level)}
                                                borderRadius="lg"
                                            >
                                                Editar Nivel
                                            </MenuItem>
                                            <MenuItem
                                                icon={<HiTrash />}
                                                color="red.500"
                                                onClick={() => handleDeleteClick(level)}
                                                borderRadius="lg"
                                            >
                                                Eliminar
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>

            {/* Delete Confirmation */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Eliminar Nivel
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Estás seguro de eliminar el <b>Nivel {levelToDelete?.nivel}</b>?
                            Esto podría afectar la visualización de los rangos de los usuarios.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose} borderRadius="xl">
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="xl">
                                Confirmar Eliminación
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};
