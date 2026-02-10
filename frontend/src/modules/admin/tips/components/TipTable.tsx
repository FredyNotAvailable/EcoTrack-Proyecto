import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    Badge,
    HStack,
    Box,
    useColorModeValue,
    Text,
    VStack,
    Center,
    Spinner,
    Icon,
    Tooltip
} from '@chakra-ui/react';
import { HiPencil, HiTrash, HiLightBulb, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import { EmptyState } from '../../shared/EmptyState';

// Motion components
const MotionTr = motion(Tr);

interface TipTableProps {
    tips: any[];
    isLoading: boolean;
    onEdit: (tip: any) => void;
    onDelete: (tip: any) => void;
}

export const TipTable = ({ tips, isLoading, onEdit, onDelete }: TipTableProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'gray.700');

    if (isLoading) {
        return (
            <Center py={20}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.primary" thickness="4px" speed="0.65s" emptyColor="gray.200" />
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Cargando consejos...</Text>
                </VStack>
            </Center>
        );
    }

    if (tips.length === 0) {
        return (
            <EmptyState
                title="Sin Consejos Ambientales"
                description="No hay consejos registrados. Agrega nuevos tips para educar a la comunidad."
                icon={HiLightBulb}
            />
        );
    }

    return (
        <Box
            bg={bg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            shadow="lg"
            overflow="hidden"
            position="relative"
        >
            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                        <Tr>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Título</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Estado</Th>
                            <Th py={6} fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Fecha de Creación</Th>
                            <Th py={6} textAlign="right" fontSize="xs" fontWeight="900" textTransform="uppercase" letterSpacing="widest" color="gray.500">Acciones</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <AnimatePresence>
                            {tips.map((tip, index) => (
                                <MotionTr
                                    key={tip.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    _hover={{ bg: hoverBg }}
                                >
                                    <Td py={4}>
                                        <Box>
                                            <Text fontWeight="800" fontSize="sm" color={useColorModeValue('gray.700', 'white')} mb={1}>
                                                {tip.titulo}
                                            </Text>
                                            <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="400px" fontWeight="500">
                                                {tip.descripcion}
                                            </Text>
                                        </Box>
                                    </Td>
                                    <Td>
                                        <Badge
                                            colorScheme={tip.activo ? 'green' : 'gray'}
                                            variant="subtle"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                            textTransform="uppercase"
                                            fontSize="xs"
                                            fontWeight="800"
                                            display="inline-flex"
                                            alignItems="center"
                                        >
                                            <Icon as={tip.activo ? HiCheckCircle : HiXCircle} mr={1} boxSize={3} />
                                            {tip.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </Td>
                                    <Td fontSize="sm" color="gray.500" fontWeight="600">
                                        {new Date(tip.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </Td>
                                    <Td textAlign="right">
                                        <HStack spacing={0} justify="flex-end">
                                            <Tooltip label="Editar Consejo" hasArrow placement="top">
                                                <IconButton
                                                    aria-label="Editar"
                                                    icon={<HiPencil />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="brand"
                                                    onClick={() => onEdit(tip)}
                                                    borderRadius="lg"
                                                    mr={2}
                                                />
                                            </Tooltip>
                                            <Tooltip label="Eliminar Consejo" hasArrow placement="top">
                                                <IconButton
                                                    aria-label="Eliminar"
                                                    icon={<HiTrash />}
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    onClick={() => onDelete(tip)}
                                                    borderRadius="lg"
                                                />
                                            </Tooltip>
                                        </HStack>
                                    </Td>
                                </MotionTr>
                            ))}
                        </AnimatePresence>
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};
