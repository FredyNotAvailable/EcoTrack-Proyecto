import {
    Box,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
    Text,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    useToast,
    Avatar,
    HStack,
    VStack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    useDisclosure,
    Image,
    SimpleGrid,
    Icon,
    Flex,
    InputGroup,
    InputLeftElement,
    Input,
    Tabs,
    TabList,
    Tab,
    useColorModeValue,
    Skeleton,
    Heading
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaEllipsisV, FaCheck, FaTrash, FaExternalLinkAlt, FaSearch, FaExclamationTriangle, FaClock, FaCheckCircle, FaBan } from 'react-icons/fa';
import { AdminAPIService } from '../services/admin.service';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Define types locally
interface Report {
    id: string;
    post_id: string;
    reporter_id: string;
    reason: string;
    details?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'resolved';
    created_at: string;
    reporter: { username: string; avatar_url: string };
    post_preview?: {
        id: string;
        descripcion: string;
        status: string;
        is_reported: boolean;
        media: { media_url: string; media_type: string } | null;
        user: { username: string; avatar_url: string };
    };
}

const REASON_MAP: Record<string, string> = {
    'spam': 'Spam o engañoso',
    'inappropriate': 'Contenido inapropiado',
    'harassment': 'Acoso o intimidación',
    'misinformation': 'Información falsa',
    'other': 'Otro motivo'
};

const StatCard = ({ label, value, icon, color, delay = 0 }: any) => {
    const bg = useColorModeValue('white', 'gray.800');
    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            p={6}
            bg={bg}
            borderRadius="2xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
        >
            <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                    <Text color="gray.500" fontSize="sm" fontWeight="medium">{label}</Text>
                    <Heading size="lg">{value}</Heading>
                </VStack>
                <Box p={3} bg={`${color}.50`} borderRadius="xl" color={`${color}.500`}>
                    <Icon as={icon} boxSize={6} />
                </Box>
            </Flex>
        </MotionBox>
    );
};

const ReportsPage = () => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'dismissed' | 'resolved'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: reports, isLoading } = useQuery({
        queryKey: ['admin-reports'],
        queryFn: AdminAPIService.getPostReports
    });

    const filteredReports = useMemo(() => {
        if (!reports) return [];
        return reports.filter((r: Report) => {
            const matchesStatus = filterStatus === 'all' || (filterStatus === 'pending' ? (r.status === 'pending' || r.status === 'reviewed') : r.status === filterStatus);
            const matchesSearch =
                r.reporter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.post_preview?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.reason?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [reports, filterStatus, searchTerm]);

    const stats = useMemo(() => {
        if (!reports) return { total: 0, pending: 0, resolved: 0, dismissed: 0 };
        return {
            total: reports.length,
            pending: reports.filter((r: any) => r.status === 'pending' || r.status === 'reviewed').length,
            resolved: reports.filter((r: any) => r.status === 'resolved').length,
            dismissed: reports.filter((r: any) => r.status === 'dismissed').length,
        };
    }, [reports]);

    const resolveMutation = useMutation({
        mutationFn: ({ id, action }: { id: string, action: 'dismiss' | 'delete_post' }) =>
            AdminAPIService.resolvePostReport(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
            toast({
                title: 'Acción realizada con éxito',
                status: 'success',
                duration: 3000,
                isClosable: true,
                position: 'top-right'
            });
            onClose();
        },
        onError: () => {
            toast({
                title: 'Error al procesar la acción',
                status: 'error',
                duration: 3000,
            });
        }
    });

    const handleViewPost = (report: Report) => {
        setSelectedReport(report);
        onOpen();
    };

    const handleResolve = (action: 'dismiss' | 'delete_post') => {
        if (selectedReport) {
            resolveMutation.mutate({ id: selectedReport.id, action });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
            case 'reviewed': return <Badge colorScheme="yellow" variant="subtle" borderRadius="full" px={3} fontWeight="800">PENDIENTE</Badge>;
            case 'resolved': return <Badge colorScheme="red" variant="subtle" borderRadius="full" px={3} fontWeight="800">ELIMINADO</Badge>;
            case 'dismissed': return <Badge colorScheme="green" variant="subtle" borderRadius="full" px={3} fontWeight="800">SIN INFRACCIÓN</Badge>;
            default: return <Badge borderRadius="full" px={3}>{status.toUpperCase()}</Badge>;
        }
    };

    const translateReason = (reason: string) => REASON_MAP[reason] || reason;

    const bgCard = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box p={4}>
            <VStack spacing={6} align="stretch">
                {/* SECCIÓN 1: ESTADÍSTICAS */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                    <StatCard label="Total Reportes" value={stats.total} icon={FaExclamationTriangle} color="blue" delay={0.1} />
                    <StatCard label="Por Moderar" value={stats.pending} icon={FaClock} color="orange" delay={0.15} />
                    <StatCard label="Contenido Seguro" value={stats.dismissed} icon={FaCheckCircle} color="green" delay={0.2} />
                    <StatCard label="Posts Bloqueados" value={stats.resolved} icon={FaBan} color="red" delay={0.25} />
                </SimpleGrid>

                {/* SECCIÓN 2: BUSCADOR Y FILTROS */}
                <Box
                    bg={bgCard}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Flex direction={{ base: 'column', lg: 'row' }} gap={4} justify="space-between">
                        <Tabs
                            variant="soft-rounded"
                            colorScheme="green"
                            onChange={(index) => {
                                const statuses: ('all' | 'pending' | 'dismissed' | 'resolved')[] = ['all', 'pending', 'dismissed', 'resolved'];
                                setFilterStatus(statuses[index]);
                            }}
                        >
                            <TabList>
                                <Tab fontWeight="bold" fontSize="sm">Todos</Tab>
                                <Tab fontWeight="bold" fontSize="sm">Pendientes</Tab>
                                <Tab fontWeight="bold" fontSize="sm">Seguros</Tab>
                                <Tab fontWeight="bold" fontSize="sm">Eliminados</Tab>
                            </TabList>
                        </Tabs>

                        <HStack spacing={4} w={{ base: 'full', lg: '400px' }}>
                            <InputGroup size="md">
                                <InputLeftElement pointerEvents="none">
                                    <FaSearch color="gray.300" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Buscar por usuario o razón..."
                                    borderRadius="xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    border="none"
                                    _focus={{ boxShadow: 'none', bg: useColorModeValue('gray.100', 'gray.600') }}
                                />
                            </InputGroup>
                        </HStack>
                    </Flex>
                </Box>

                {/* SECCIÓN 3: TABLA DE REPORTES */}
                <Box
                    bg={bgCard}
                    p={6}
                    borderRadius="2xl"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <Box overflowX="auto">
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800">Fecha</Th>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800">Denunciante</Th>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800">Autor Reportado</Th>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800">Razón</Th>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800">Estado</Th>
                                    <Th color="gray.400" textTransform="uppercase" fontSize="xs" fontWeight="800" textAlign="right">Acciones</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {isLoading ? (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center">
                                            <VStack spacing={4} py={10}>
                                                <Skeleton height="20px" width="100%" />
                                                <Skeleton height="20px" width="100%" />
                                                <Skeleton height="20px" width="100%" />
                                            </VStack>
                                        </Td>
                                    </Tr>
                                ) : filteredReports.map((report: Report) => (
                                    <Tr
                                        key={report.id}
                                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700/30') }}
                                        transition="background 0.2s"
                                    >
                                        <Td fontSize="sm" color="gray.500">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </Td>
                                        <Td>
                                            <HStack>
                                                <Avatar size="xs" src={report.reporter?.avatar_url} name={report.reporter?.username} />
                                                <Text fontSize="sm" fontWeight="bold">@{report.reporter?.username}</Text>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            {report.post_preview && report.post_preview.status !== 'blocked' ? (
                                                <HStack>
                                                    <Avatar size="xs" src={report.post_preview.user?.avatar_url} name={report.post_preview.user?.username} />
                                                    <Text fontSize="sm" fontWeight="bold">@{report.post_preview.user?.username}</Text>
                                                </HStack>
                                            ) : (
                                                <Text fontSize="xs" color="red.400" fontWeight="bold">POST ELIMINADO/BLOQUEADO</Text>
                                            )}
                                        </Td>
                                        <Td>
                                            <VStack align="start" spacing={1}>
                                                <Text fontSize="sm" fontWeight="700" color="red.600">
                                                    {translateReason(report.reason)}
                                                </Text>
                                                {report.details && (
                                                    <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="150px">
                                                        {report.details}
                                                    </Text>
                                                )}
                                            </VStack>
                                        </Td>
                                        <Td>{getStatusBadge(report.status)}</Td>
                                        <Td textAlign="right">
                                            <Menu isLazy>
                                                <MenuButton
                                                    as={IconButton}
                                                    icon={<FaEllipsisV />}
                                                    variant="ghost"
                                                    size="sm"
                                                    borderRadius="full"
                                                />
                                                <MenuList borderRadius="xl" shadow="2xl" border="none" zIndex={10}>
                                                    {report.post_preview && (
                                                        <MenuItem
                                                            icon={<FaExternalLinkAlt />}
                                                            onClick={() => handleViewPost(report)}
                                                            fontWeight="600"
                                                        >
                                                            Ver Publicación
                                                        </MenuItem>
                                                    )}
                                                    {(report.status === 'pending' || report.status === 'reviewed') && (
                                                        <>
                                                            <MenuItem
                                                                icon={<FaCheck />}
                                                                color="green.500"
                                                                onClick={() => resolveMutation.mutate({ id: report.id, action: 'dismiss' })}
                                                                fontWeight="700"
                                                            >
                                                                Ignorar Reporte
                                                            </MenuItem>
                                                            <MenuItem
                                                                icon={<FaTrash />}
                                                                color="red.500"
                                                                onClick={() => resolveMutation.mutate({ id: report.id, action: 'delete_post' })}
                                                                fontWeight="700"
                                                            >
                                                                Eliminar Publicación
                                                            </MenuItem>
                                                        </>
                                                    )}
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))}
                                {!isLoading && filteredReports.length === 0 && (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center" py={20}>
                                            <VStack spacing={3}>
                                                <Icon as={FaCheckCircle} boxSize={12} color="gray.100" />
                                                <Text fontWeight="800" color="gray.300" fontSize="xl">No hay reportes que coincidan</Text>
                                            </VStack>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </VStack>

            {/* Premium Modal for Details */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
                <ModalOverlay backdropFilter="blur(10px)" bg="blackAlpha.700" />
                <ModalContent borderRadius="3xl" overflow="hidden">
                    <ModalHeader borderBottom="1px solid" borderColor="gray.100" bg="gray.50">
                        <HStack justify="space-between">
                            <Text fontSize="md" fontWeight="900">REVISIÓN DE MODERACIÓN</Text>
                            {selectedReport && getStatusBadge(selectedReport.status)}
                        </HStack>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody p={0}>
                        {selectedReport && (
                            <VStack spacing={0} align="stretch">
                                {/* Informacion del Reporte */}
                                <Box p={6} bg="red.50">
                                    <HStack spacing={4} mb={4}>
                                        <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} />
                                        <VStack align="start" spacing={0}>
                                            <Text fontSize="xs" fontWeight="800" color="red.400" textTransform="uppercase">Motivo del Reporte</Text>
                                            <Text fontSize="lg" fontWeight="900" color="red.800">{translateReason(selectedReport.reason)}</Text>
                                        </VStack>
                                    </HStack>
                                    {selectedReport.details && (
                                        <Box bg="white" p={4} borderRadius="2xl" border="1px dashed" borderColor="red.200">
                                            <Text fontSize="sm" fontStyle="italic" color="gray.700">"{selectedReport.details}"</Text>
                                        </Box>
                                    )}
                                    <HStack mt={4} justify="space-between">
                                        <HStack>
                                            <Text fontSize="xs" fontWeight="bold" color="gray.500">REPORTE DE:</Text>
                                            <Avatar size="xs" src={selectedReport.reporter?.avatar_url} />
                                            <Text fontSize="xs" fontWeight="900">@{selectedReport.reporter?.username}</Text>
                                        </HStack>
                                        <Text fontSize="xs" fontWeight="800" color="gray.400">{new Date(selectedReport.created_at).toLocaleString()}</Text>
                                    </HStack>
                                </Box>

                                {/* Visualización del Post */}
                                <Box p={6}>
                                    <Text fontSize="xs" fontWeight="800" color="gray.400" textTransform="uppercase" mb={4}>Contenido en Cuestión</Text>
                                    {selectedReport.post_preview && selectedReport.post_preview.status !== 'blocked' ? (
                                        <Box borderRadius="3xl" border="1px solid" borderColor="gray.100" p={5} overflow="hidden">
                                            <HStack mb={4}>
                                                <Avatar size="sm" src={selectedReport.post_preview.user?.avatar_url} />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontWeight="900">@{selectedReport.post_preview.user?.username}</Text>
                                                    <Text fontSize="xs" color="gray.500">Autor de la publicación</Text>
                                                </VStack>
                                            </HStack>

                                            <Text mb={4} fontSize="md" lineHeight="tall" fontWeight="500">{selectedReport.post_preview.descripcion}</Text>

                                            {selectedReport.post_preview.media && (
                                                <Box
                                                    borderRadius="2xl"
                                                    overflow="hidden"
                                                    bg="black"
                                                    maxH="450px"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                    boxShadow="lg"
                                                >
                                                    {selectedReport.post_preview.media.media_type === 'image' ? (
                                                        <Image
                                                            src={selectedReport.post_preview.media.media_url}
                                                            objectFit="contain"
                                                            maxH="450px"
                                                            w="100%"
                                                        />
                                                    ) : (
                                                        <video
                                                            src={selectedReport.post_preview.media.media_url}
                                                            controls
                                                            style={{ maxWidth: '100%', maxHeight: '450px' }}
                                                        />
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    ) : (
                                        <Flex direction="column" align="center" justify="center" py={12} bg="gray.50" borderRadius="3xl" border="2px dashed" borderColor="gray.200">
                                            <Icon as={FaBan} boxSize={10} color="gray.300" mb={3} />
                                            <Text color="gray.500" fontWeight="800">Esta publicación ya ha sido bloqueada/eliminada</Text>
                                        </Flex>
                                    )}
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>

                    <ModalFooter bg="gray.50" borderTop="1px solid" borderColor="gray.100" p={6}>
                        {(selectedReport?.status === 'pending' || selectedReport?.status === 'reviewed') && (
                            <VStack w="full" spacing={3}>
                                <Button
                                    w="full"
                                    variant="solid"
                                    colorScheme="gray"
                                    onClick={() => handleResolve('dismiss')}
                                    isLoading={resolveMutation.isPending}
                                    borderRadius="xl"
                                    fontWeight="900"
                                >
                                    Ignorar Reporte (Todo está bien)
                                </Button>
                                <Button
                                    w="full"
                                    colorScheme="red"
                                    onClick={() => handleResolve('delete_post')}
                                    isLoading={resolveMutation.isPending}
                                    borderRadius="xl"
                                    fontWeight="900"
                                    leftIcon={<FaTrash />}
                                    boxShadow="0 8px 15px -5px var(--chakra-colors-red-400)"
                                >
                                    Eliminar Publicación (Incumple normas)
                                </Button>
                            </VStack>
                        )}
                        {selectedReport?.status !== 'pending' && selectedReport?.status !== 'reviewed' && (
                            <Button w="full" onClick={onClose} borderRadius="xl" fontWeight="900" size="lg">Cerrar</Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default ReportsPage;
