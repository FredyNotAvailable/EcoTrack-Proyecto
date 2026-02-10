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
    VStack
} from '@chakra-ui/react';
import { HiDotsVertical, HiPencil, HiTrash, HiChevronUp, HiChartBar } from 'react-icons/hi';
import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '../../shared/EmptyState';

// Motion components
const MotionTr = motion(Tr);

interface LevelTableProps {
    levels: any[];
    isLoading: boolean;
    onEdit: (level: any) => void;
    onDelete: (nivel: number) => void;
}

export const LevelTable = ({ levels, isLoading, onEdit, onDelete }: LevelTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

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
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.primary" thickness="4px" speed="0.65s" emptyColor="gray.200" />
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Cargando niveles...</Text>
                </VStack>
            </Center>
        );
    }

    if (levels.length === 0) {
        return (
            <EmptyState
                title="Sin Niveles Configurados"
                description="No hay niveles definidos en el sistema. Comienza creando el Nivel 1."
                icon={HiChartBar}
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
                    <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                        <Tr>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Nivel</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Requisito</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Progresión</Th>
                            <Th py={6} textAlign="right" fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <AnimatePresence>
                            {levels.map((level, index) => {
                                const nextLevel = levels[index + 1];
                                const pointsForNext = nextLevel ? nextLevel.puntos_minimos - level.puntos_minimos : null;

                                return (
                                    <MotionTr
                                        key={level.nivel}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        _hover={{ bg: hoverBg }}
                                    >
                                        <Td py={4}>
                                            <Flex align="center">
                                                <Center
                                                    w="42px"
                                                    h="42px"
                                                    bg="brand.50"
                                                    color="brand.600"
                                                    borderRadius="xl"
                                                    fontWeight="900"
                                                    fontSize="lg"
                                                    mr={4}
                                                    shadow="md"
                                                    border="2px solid"
                                                    borderColor="brand.100"
                                                >
                                                    {level.nivel}
                                                </Center>
                                                <Box>
                                                    <Text fontWeight="800" fontSize="md" color="gray.700">Nivel {level.nivel}</Text>
                                                    <Text fontSize="xs" color="gray.400" fontWeight="600">Rango de Usuario</Text>
                                                </Box>
                                            </Flex>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme="green"
                                                variant="subtle"
                                                borderRadius="lg"
                                                px={3}
                                                py={1.5}
                                                fontSize="xs"
                                                fontWeight="800"
                                            >
                                                {level.puntos_minimos.toLocaleString()} PTS
                                            </Badge>
                                        </Td>
                                        <Td>
                                            {pointsForNext ? (
                                                <Flex align="center" color="gray.500" fontSize="sm" fontWeight="500">
                                                    <Icon as={HiChevronUp} mr={2} color="brand.400" />
                                                    <Text>REQUIERE <Text as="span" fontWeight="bold" color="gray.700">+{pointsForNext.toLocaleString()}</Text> PARA SUBIR</Text>
                                                </Flex>
                                            ) : (
                                                <Badge
                                                    colorScheme="purple"
                                                    variant="solid"
                                                    borderRadius="full"
                                                    px={3}
                                                    py={1}
                                                    fontSize="xs"
                                                    fontWeight="bold"
                                                    boxShadow="md"
                                                >
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
                                                    _hover={{ bg: 'white', shadow: 'md' }}
                                                />
                                                <MenuList borderRadius="xl" shadow="2xl" border="none" p={2} zIndex={10}>
                                                    <MenuItem
                                                        icon={<HiPencil />}
                                                        onClick={() => onEdit(level)}
                                                        fontWeight="600"
                                                        borderRadius="lg"
                                                        mb={1}
                                                    >
                                                        Editar Nivel
                                                    </MenuItem>
                                                    <MenuItem
                                                        icon={<HiTrash />}
                                                        color="red.500"
                                                        onClick={() => handleDeleteClick(level)}
                                                        fontWeight="600"
                                                        borderRadius="lg"
                                                        _hover={{ bg: 'red.50' }}
                                                    >
                                                        Eliminar
                                                    </MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </MotionTr>
                                );
                            })}
                        </AnimatePresence>
                    </Tbody>
                </Table>
            </Box>

            {/* Delete Confirmation */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
                motionPreset="slideInBottom"
            >
                <AlertDialogOverlay backdropFilter="blur(8px)" bg="blackAlpha.400" />
                <AlertDialogContent borderRadius="3xl" shadow="2xl">
                    <AlertDialogHeader fontSize="xl" fontWeight="900" pt={8} px={8}>
                        Eliminar Nivel
                    </AlertDialogHeader>

                    <AlertDialogBody px={8}>
                        <Text color="gray.600">
                            ¿Estás seguro de eliminar el <Text as="span" fontWeight="800" color="gray.800">Nivel {levelToDelete?.nivel}</Text>?
                        </Text>
                        <Text mt={4} fontSize="sm" color="orange.600" bg="orange.50" p={4} borderRadius="xl" border="1px dashed" borderColor="orange.200">
                            <Icon as={HiChartBar} mr={2} />
                            Esto podría afectar el cálculo de rangos para los usuarios que actualmente están en este nivel.
                        </Text>
                    </AlertDialogBody>

                    <AlertDialogFooter pb={8} px={8}>
                        <Button ref={cancelRef} onClick={onClose} borderRadius="full" size="lg" fontWeight="bold">
                            Cancelar
                        </Button>
                        <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="full" shadow="lg" size="lg" _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}>
                            Eliminar Nivel
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Box>
    );
};
