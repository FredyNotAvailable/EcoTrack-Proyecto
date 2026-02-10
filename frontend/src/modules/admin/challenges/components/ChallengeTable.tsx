import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Badge,
    IconButton,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    useColorModeValue,
    Box,
    Spinner,
    Center,
    VStack,
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
import { HiDotsVertical, HiPencil, HiTrash, HiViewList } from 'react-icons/hi';

interface ChallengeTableProps {
    challenges: any[];
    isLoading: boolean;
    onEdit: (challenge: any) => void;
    onDelete: (id: string) => void;
    onManageTasks: (challenge: any) => void;
}

export const ChallengeTable = ({ challenges, isLoading, onEdit, onDelete, onManageTasks }: ChallengeTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Alert Dialog state
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const handleDeleteClick = (id: string) => {
        setSelectedId(id);
        onOpen();
    };

    const confirmDelete = () => {
        if (selectedId) {
            onDelete(selectedId);
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

    if (challenges.length === 0) {
        return (
            <Center py={20} bg={bg} borderRadius="2xl" border="1px" borderColor={borderColor}>
                <Text color="gray.500">No se encontraron retos semanales.</Text>
            </Center>
        );
    }

    const getCategoryColor = (category: string) => {
        const colors: any = {
            energia: 'orange',
            agua: 'blue',
            transporte: 'green',
            residuos: 'purple'
        };
        return colors[category] || 'gray';
    };

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
                        <Th>Reto Semanal</Th>
                        <Th>Categoría</Th>
                        <Th>Vigencia</Th>
                        <Th>Recompensa</Th>
                        <Th>Estado</Th>
                        <Th isNumeric>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {challenges.map((challenge) => (
                        <Tr key={challenge.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                            <Td>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="sm">{challenge.titulo}</Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="300px">
                                        {challenge.descripcion}
                                    </Text>
                                </VStack>
                            </Td>
                            <Td>
                                <Badge colorScheme={getCategoryColor(challenge.categoria)} borderRadius="full" px={2}>
                                    {challenge.categoria.toUpperCase()}
                                </Badge>
                            </Td>
                            <Td fontSize="xs">
                                <Text fontWeight="medium">
                                    {new Date(challenge.fecha_inicio).toLocaleDateString()}
                                </Text>
                                <Text color="gray.500">
                                    al {new Date(challenge.fecha_fin).toLocaleDateString()}
                                </Text>
                            </Td>
                            <Td>
                                <VStack align="start" spacing={0}>
                                    <Text fontSize="sm" fontWeight="bold" color="brand.primary">{challenge.recompensa_puntos} pts</Text>
                                    <Text fontSize="xs" color="gray.500">{challenge.recompensa_kg_co2} kg CO2</Text>
                                </VStack>
                            </Td>
                            <Td>
                                <Badge
                                    colorScheme={challenge.activo ? 'green' : 'gray'}
                                    variant="solid"
                                    borderRadius="full"
                                    px={2}
                                    fontSize="0.7em"
                                >
                                    {challenge.activo ? 'ACTIVO' : 'INACTIVO'}
                                </Badge>
                            </Td>
                            <Td isNumeric>
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        icon={<HiDotsVertical />}
                                        variant="ghost"
                                        size="sm"
                                        borderRadius="xl"
                                    />
                                    <MenuList borderRadius="xl" shadow="xl" border="none">
                                        <MenuItem icon={<HiViewList />} onClick={() => onManageTasks(challenge)}>
                                            Gestionar Tareas
                                        </MenuItem>
                                        <MenuItem icon={<HiPencil />} onClick={() => onEdit(challenge)}>
                                            Editar Reto
                                        </MenuItem>
                                        <MenuItem icon={<HiTrash />} color="red.500" onClick={() => handleDeleteClick(challenge.id)}>
                                            Eliminar
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Eliminar Reto</AlertDialogHeader>
                        <AlertDialogBody>
                            ¿Estás seguro? Esta acción eliminará el reto y todas sus tareas asociadas,
                            afectando el progreso de los usuarios que ya se hayan unido.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onClose} borderRadius="xl">Cancelar</Button>
                            <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="xl">Eliminar permanentemente</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};
