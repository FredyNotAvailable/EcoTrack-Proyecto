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
import { HiDotsVertical, HiPencil, HiTrash, HiOutlineBadgeCheck, HiLightningBolt } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { tableRowVariants } from '../../shared/animations';
import { EmptyState } from '../../shared/EmptyState';
import { LiveStatus } from '../../shared/LiveStatus';

interface MissionTableProps {
    missions: any[];
    isLoading: boolean;
    onEdit: (mission: any) => void;
    onDelete: (id: string) => void;
}

const MotionTr = motion(Tr);

export const MissionTable = ({ missions, isLoading, onEdit, onDelete }: MissionTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const theadBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
            <Box bg={bg} borderRadius="3xl" border="1px" borderColor={borderColor} p={4}>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Misión</Th>
                            <Th>Categoría</Th>
                            <Th>Dificultad</Th>
                            <Th>Puntos</Th>
                            <Th>Impacto</Th>
                            <Th>Estado</Th>
                            <Th isNumeric>Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Tr key={i}>
                                <Td><Skeleton height="40px" width="200px" /></Td>
                                <Td><Skeleton height="20px" width="80px" /></Td>
                                <Td><Skeleton height="20px" width="80px" /></Td>
                                <Td><Skeleton height="20px" width="50px" /></Td>
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

    if (missions.length === 0) {
        return (
            <EmptyState
                title="Sin Misiones"
                description="No hay metas actuales disponibles en esta categoría."
                icon={HiLightningBolt}
            />
        );
    }

    const getCategoryStyles = (category: string) => {
        const categories: Record<string, string> = {
            energia: 'orange',
            agua: 'blue',
            transporte: 'green',
            residuos: 'purple'
        };
        const color = categories[category] || 'gray';
        return {
            colorScheme: color,
            borderRadius: "full",
            px: 3,
            py: 0.5,
            fontSize: "10px",
            textTransform: "uppercase" as const
        };
    };

    const getDifficultyBadge = (difficulty: string) => {
        const levels: Record<string, string> = {
            'fácil': 'green',
            'intermedio': 'yellow',
            'difícil': 'red'
        };
        return (
            <Badge
                colorScheme={levels[difficulty.toLowerCase()] || 'gray'}
                fontSize="10px"
                px={2}
                borderRadius="md"
                variant="subtle"
            >
                {difficulty}
            </Badge>
        );
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
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Misión</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Categoría</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Dificultad</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Puntos</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Impacto (CO2)</Th>
                        <Th fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Estado</Th>
                        <Th isNumeric fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" py={5}>Acciones</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    <AnimatePresence mode='popLayout'>
                        {missions.map((mission, index) => (
                            <MotionTr
                                key={mission.id}
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
                                        <Text fontWeight="800" fontSize="sm">{mission.titulo}</Text>
                                        <Text fontSize="xs" color="gray.400" fontWeight="600" noOfLines={1} maxW="300px">{mission.descripcion}</Text>
                                    </VStack>
                                </Td>
                                <Td py={4}><Badge {...getCategoryStyles(mission.categoria)}>{mission.categoria}</Badge></Td>
                                <Td py={4}>{getDifficultyBadge(mission.dificultad || 'Fácil')}</Td>
                                <Td py={4}>
                                    <HStack spacing={1}>
                                        <HiOutlineBadgeCheck color="#38A169" />
                                        <Text fontWeight="900" fontSize="sm">{mission.puntos}</Text>
                                    </HStack>
                                </Td>
                                <Td py={4}>
                                    <Text fontSize="sm" fontWeight="bold" color="green.600">-{mission.kg_co2_ahorrado || 0} kg</Text>
                                </Td>
                                <Td py={4}>
                                    <LiveStatus
                                        isActive={mission.activa}
                                        activeLabel="Publicada"
                                        inactiveLabel="Oculta"
                                    />
                                </Td>
                                <Td py={4} isNumeric>
                                    <Menu>
                                        <Tooltip label="Opciones de misión" placement="top" hasArrow>
                                            <MenuButton
                                                as={IconButton}
                                                aria-label="Opciones"
                                                icon={<HiDotsVertical />}
                                                variant="ghost"
                                                size="sm"
                                                borderRadius="lg"
                                            />
                                        </Tooltip>
                                        <MenuList borderRadius="xl" shadow="2xl" border="none" py={2}>
                                            <MenuItem icon={<HiPencil size={18} />} onClick={() => onEdit(mission)} fontWeight="800" fontSize="sm" py={3}>
                                                Editar Misión
                                            </MenuItem>
                                            <MenuItem icon={<HiTrash size={18} />} color="red.500" onClick={() => handleDeleteClick(mission)} fontWeight="800" fontSize="sm" py={3}>
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
