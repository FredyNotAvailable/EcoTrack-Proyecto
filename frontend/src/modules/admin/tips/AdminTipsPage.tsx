import {
    Container,
    VStack,
    useDisclosure,
    Button,
    Box,
    Flex,
    Text,
    useColorModeValue,
    useToast,
    HStack,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';
import { TipTable } from './components/TipTable';
import { TipModal } from './components/TipModal';
import { TipStats } from './components/TipStats';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';

export const AdminTipsPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const {
        isOpen: isDeleteOpen,
        onOpen: onDeleteOpen,
        onClose: onDeleteClose
    } = useDisclosure();

    const [selectedTip, setSelectedTip] = useState<any>(null);
    const [tipToDelete, setTipToDelete] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Data Fetching
    const { data: tips = [], isLoading } = useQuery({
        queryKey: ['admin', 'daily-tips'],
        queryFn: AdminAPIService.getDailyTips
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: AdminAPIService.createDailyTip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'daily-tips'] });
            toast({ title: 'Consejo creado', status: 'success', isClosable: true });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo crear el consejo',
                status: 'error'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) =>
            AdminAPIService.updateDailyTip(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'daily-tips'] });
            toast({ title: 'Consejo actualizado', status: 'success', isClosable: true });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo actualizar el consejo',
                status: 'error'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: AdminAPIService.deleteDailyTip,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'daily-tips'] });
            toast({ title: 'Consejo eliminado', status: 'success', isClosable: true });
            onDeleteClose();
        },
        onError: () => toast({ title: 'Error', description: 'No se pudo eliminar el consejo', status: 'error' })
    });

    // Handlers
    const handleCreateNew = () => {
        setSelectedTip(null);
        onOpen();
    };

    const handleEdit = (tip: any) => {
        setSelectedTip(tip);
        onOpen();
    };

    const handleSave = (formData: any) => {
        if (selectedTip) {
            updateMutation.mutate({ id: selectedTip.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDeleteClick = (tip: any) => {
        setTipToDelete(tip);
        onDeleteOpen();
    };

    const handleConfirmDelete = () => {
        if (tipToDelete) {
            deleteMutation.mutate(tipToDelete.id);
        }
    };

    // Filter and Sort Logic
    const filteredTips = tips
        .filter((tip: any) => {
            const matchesSearch =
                tip.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tip.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'active' && tip.activo) ||
                (filterStatus === 'inactive' && !tip.activo);

            return matchesSearch && matchesStatus;
        })
        .sort((a: any, b: any) => {
            // Sort by created_at descending (most recent first)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    const bgFilter = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="full" py={4} px={{ base: 0, md: 4 }}>
            <VStack spacing={8} align="stretch">
                <TipStats tips={tips} />

                {/* Filtros y Acción */}
                <Box
                    p={5}
                    bg={bgFilter}
                    borderRadius="3xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="lg"
                    transition="all 0.3s"
                    _hover={{ shadow: 'xl' }}
                >
                    <Flex
                        direction={{ base: 'column', md: 'row' }}
                        justify="space-between"
                        align={{ base: 'stretch', md: 'center' }}
                        gap={6}
                    >
                        <HStack spacing={4} flex="1">
                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none">
                                    <HiSearch color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Buscar consejos..."
                                    borderRadius="2xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    variant="filled"
                                    focusBorderColor="brand.500"
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                                />
                            </InputGroup>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                borderRadius="2xl"
                                size="lg"
                                maxW="200px"
                                variant="filled"
                                focusBorderColor="brand.500"
                                bg={useColorModeValue('gray.50', 'gray.700')}
                                _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
                            >
                                <option value="all">Todos</option>
                                <option value="active">Activos</option>
                                <option value="inactive">Inactivos</option>
                            </Select>
                        </HStack>

                        <Button
                            leftIcon={<HiPlus />}
                            colorScheme="brand"
                            onClick={handleCreateNew}
                            borderRadius="2xl"
                            size="lg"
                            px={8}
                            fontWeight="bold"
                            shadow="lg"
                            _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                            transition="all 0.3s"
                        >
                            Nuevo Consejo
                        </Button>
                    </Flex>
                </Box>

                {/* Content Section */}
                <VStack align="stretch" spacing={6}>
                    <Flex justify="space-between" align="center" px={2}>
                        <Text fontWeight="900" color="gray.500" fontSize="xs" textTransform="uppercase" letterSpacing="widest">
                            Consejos Encontrados ({filteredTips.length})
                        </Text>
                    </Flex>

                    <TipTable
                        tips={filteredTips}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                </VStack>
            </VStack>

            <TipModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                tip={selectedTip}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={onDeleteClose}
                onConfirm={handleConfirmDelete}
                title={tipToDelete?.titulo}
                description="¿Estás seguro de que deseas eliminar este consejo? Esta acción no se puede deshacer."
                isLoading={deleteMutation.isPending}
            />
        </Container>
    );
};
