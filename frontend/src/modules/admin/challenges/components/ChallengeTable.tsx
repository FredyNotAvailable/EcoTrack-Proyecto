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
    VStack,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure,
    Button,
    Tooltip,
    Skeleton
} from '@chakra-ui/react';
import React from 'react';
import { HiDotsVertical, HiPencil, HiTrash, HiViewList, HiFlag } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { tableRowVariants } from '../../shared/animations';
import { EmptyState } from '../../shared/EmptyState';
import { LiveStatus } from '../../shared/LiveStatus';

interface ChallengeTableProps {
    challenges: any[];
    isLoading: boolean;
    onEdit: (challenge: any) => void;
    onDelete: (id: string) => void;
    onManageTasks: (challenge: any) => void;
}

const MotionTr = motion(Tr);

export const ChallengeTable = ({ challenges, isLoading, onEdit, onDelete, onManageTasks }: ChallengeTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const theadBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
            <Box bg={bg} borderRadius="3xl" border="1px" borderColor={borderColor} p={4}>
                <Table variant="simple">
                    <Thead>
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
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Tr key={i}>
                                <Td><Skeleton height="40px" width="200px" /></Td>
                                <Td><Skeleton height="20px" width="80px" /></Td>
                                <Td><Skeleton height="20px" width="120px" /></Td>
                                <Td><Skeleton height="20px" width="80px" /></Td>
                                <Td><Skeleton height="20px" width="80px" /></Td>
                                <Td isNumeric><Skeleton height="32px" width="32px" ml="auto" /></Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>
        );
    }

    if (challenges.length === 0) {
        return (
            <EmptyState
                title="Sin Retos Activos"
                description="No hay desafíos que coincidan con tus criterios de búsqueda."
                icon={HiFlag}
            />
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
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
            shadow="sm"
        >
            <Table variant="simple">
                <Thead bg={theadBg}>
                    <Tr>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Reto Semanal</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Categoría</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Vigencia</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Recompensa</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Estado</Th>
                        <Th isNumeric fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <AnimatePresence mode='popLayout'>
                        {challenges.map((challenge, index) => (
                            <MotionTr
                                key={challenge.id}
                                _hover={{ bg: hoverBg }}
                                variants={tableRowVariants}
                                initial="hidden"
                                animate="visible"
                                custom={index}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Td py={4}>
                                    <VStack align="start" spacing={0}>
                                        <Text fontWeight="800" fontSize="sm">{challenge.titulo}</Text>
                                        <Text fontSize="xs" color="gray.400" fontWeight="600" noOfLines={1} maxW="300px">
                                            {challenge.descripcion}
                                        </Text>
                                    </VStack>
                                </Td>
                                <Td py={4}>
                                    <Badge
                                        colorScheme={getCategoryColor(challenge.categoria)}
                                        borderRadius="full"
                                        px={3}
                                        py={0.5}
                                        fontSize="10px"
                                        textTransform="uppercase"
                                    >
                                        {challenge.categoria}
                                    </Badge>
                                </Td>
                                <Td py={4} fontSize="xs">
                                    <Text fontWeight="800" color="gray.700">
                                        {new Date(challenge.fecha_inicio).toLocaleDateString()}
                                    </Text>
                                    <Text color="gray.400" fontWeight="bold">
                                        al {new Date(challenge.fecha_fin).toLocaleDateString()}
                                    </Text>
                                </Td>
                                <Td py={4}>
                                    <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" fontWeight="900" color="brand.500">{challenge.recompensa_puntos} pts</Text>
                                        <Text fontSize="10px" fontWeight="800" color="green.500">{challenge.recompensa_kg_co2} kg CO2</Text>
                                    </VStack>
                                </Td>
                                <Td py={4}>
                                    <LiveStatus
                                        isActive={
                                            new Date() >= new Date(challenge.fecha_inicio) &&
                                            new Date() <= new Date(challenge.fecha_fin)
                                        }
                                        activeLabel="Activo"
                                        inactiveLabel="Inactivo"
                                    />
                                </Td>
                                <Td py={4} isNumeric>
                                    <Menu>
                                        <Tooltip label="Opciones de reto" placement="top" hasArrow>
                                            <MenuButton
                                                as={IconButton}
                                                icon={<HiDotsVertical />}
                                                variant="ghost"
                                                size="sm"
                                                borderRadius="lg"
                                            />
                                        </Tooltip>
                                        <MenuList borderRadius="xl" shadow="2xl" border="none" py={2}>
                                            <MenuItem icon={<HiViewList size={18} />} onClick={() => onManageTasks(challenge)} fontWeight="800" fontSize="sm" py={3}>
                                                Gestionar Tareas
                                            </MenuItem>
                                            <MenuItem icon={<HiPencil size={18} />} onClick={() => onEdit(challenge)} fontWeight="800" fontSize="sm" py={3}>
                                                Editar Reto
                                            </MenuItem>
                                            <MenuItem icon={<HiTrash size={18} />} color="red.500" onClick={() => handleDeleteClick(challenge.id)} fontWeight="800" fontSize="sm" py={3}>
                                                Eliminar
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Td>
                            </MotionTr>
                        ))}
                    </AnimatePresence>
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
