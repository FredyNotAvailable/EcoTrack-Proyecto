import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Text,
    Badge,
    HStack,
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
import { HiDotsVertical, HiPencil, HiTrash, HiOutlineBadgeCheck } from 'react-icons/hi';

interface MissionTableProps {
    missions: any[];
    isLoading: boolean;
    onEdit: (mission: any) => void;
    onDelete: (id: string) => void;
}

export const MissionTable = ({ missions, isLoading, onEdit, onDelete }: MissionTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    // Alert Dialog state
    const { isOpen, onOpen, onClose } = useDisclosure();
    const cancelRef = React.useRef<HTMLButtonElement>(null);
    const [selectedMission, setSelectedMission] = React.useState<any>(null);

    const handleDeleteClick = (mission: any) => {
        setSelectedMission(mission);
        onOpen();
    };

    const confirmDelete = () => {
        if (selectedMission) {
            onDelete(selectedMission.id);
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

    if (missions.length === 0) {
        return (
            <Center py={20} bg={bg} borderRadius="2xl" border="1px" borderColor={borderColor}>
                <VStack>
                    <Text color="gray.500">No se encontraron misiones.</Text>
                </VStack>
            </Center>
        );
    }

    const getCategoryBadge = (category: string) => {
        const categories: Record<string, string> = {
            energia: 'orange',
            agua: 'blue',
            transporte: 'green',
            residuos: 'purple'
        };
        return <Badge colorScheme={categories[category]} variant="subtle" borderRadius="full" px={2}>{category.toUpperCase()}</Badge>;
    };

    const getDifficultyBadge = (difficulty: string) => {
        const levels: Record<string, string> = {
            'fácil': 'green',
            'intermedio': 'yellow',
            'difícil': 'red'
        };
        return <Badge colorScheme={levels[difficulty.toLowerCase()] || 'gray'} fontSize="0.7em" px={2}>{difficulty}</Badge>;
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
                        <Th py={4}>Misión</Th>
                        <Th py={4}>Categoría</Th>
                        <Th py={4}>Dificultad</Th>
                        <Th py={4}>Puntos</Th>
                        <Th py={4}>Impacto (CO2)</Th>
                        <Th py={4}>Estado</Th>
                        <Th py={4} isNumeric>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {missions.map((mission) => (
                        <Tr key={mission.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }} transition="background 0.2s">
                            <Td>
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" fontSize="sm">{mission.titulo}</Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="300px">{mission.descripcion}</Text>
                                </VStack>
                            </Td>
                            <Td>{getCategoryBadge(mission.categoria)}</Td>
                            <Td>{getDifficultyBadge(mission.dificultad || 'Fácil')}</Td>
                            <Td>
                                <HStack spacing={1}>
                                    <HiOutlineBadgeCheck color="green" />
                                    <Text fontWeight="bold" fontSize="sm">{mission.puntos}</Text>
                                </HStack>
                            </Td>
                            <Td>
                                <Text fontSize="sm" color="gray.600">{mission.kg_co2_ahorrado || 0} kg</Text>
                            </Td>
                            <Td>
                                <Badge colorScheme={mission.activa ? 'green' : 'gray'} variant="solid" borderRadius="full" px={2} fontSize="0.7em">
                                    {mission.activa ? 'ACTIVA' : 'INACTIVA'}
                                </Badge>
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
                                        <MenuItem icon={<HiPencil />} onClick={() => onEdit(mission)} fontSize="sm">
                                            Editar Misión
                                        </MenuItem>
                                        <MenuItem icon={<HiTrash />} color="red.500" onClick={() => handleDeleteClick(mission)} fontSize="sm">
                                            Eliminar
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
            >
                <AlertDialogOverlay backdropFilter="blur(4px)">
                    <AlertDialogContent borderRadius="2xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Eliminar Misión
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            ¿Estás seguro de eliminar <b>{selectedMission?.titulo}</b>?
                            Esta acción no se puede deshacer y afectará el historial de misiones de los usuarios.
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
