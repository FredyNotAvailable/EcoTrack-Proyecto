import { useState } from 'react';
import {
    Heading,
    Container,
    VStack,
    useDisclosure,
    Button,
    Box,
    Flex,
    Input,
    InputGroup,
    InputLeftElement,
    Select,
    HStack,
    Text,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { MissionStats } from './components/MissionStats';
import { MissionTable } from './components/MissionTable';
import { MissionModal } from './components/MissionModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';

export const AdminMissionsPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [selectedMission, setSelectedMission] = useState<any>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Data Fetching
    const { data: missions = [], isLoading } = useQuery({
        queryKey: ['admin', 'missions'],
        queryFn: AdminAPIService.getMissions,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: AdminAPIService.createMission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'missions'] });
            toast({ title: 'Misión creada', status: 'success', duration: 3000 });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error al crear',
                description: error.response?.data?.message || 'Error desconocido',
                status: 'error'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => AdminAPIService.updateMission(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'missions'] });
            toast({ title: 'Misión actualizada', status: 'success', duration: 3000 });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error al actualizar',
                description: error.response?.data?.message || 'Error desconocido',
                status: 'error'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: AdminAPIService.deleteMission,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'missions'] });
            toast({ title: 'Misión eliminada', status: 'success', duration: 3000 });
        },
        onError: () => toast({ title: 'Error al eliminar', status: 'error' })
    });

    const handleCreateMission = () => {
        setSelectedMission(null);
        onOpen();
    };

    const handleEditMission = (mission: any) => {
        setSelectedMission(mission);
        onOpen();
    };

    const handleDeleteMission = (id: string) => {
        deleteMutation.mutate(id);
    };

    const handleSaveMission = (data: any) => {
        if (selectedMission) {
            updateMutation.mutate({ id: selectedMission.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    // Filter Logic
    const filteredMissions = missions.filter((mission: any) => {
        const matchesSearch =
            mission.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mission.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
            filterCategory === 'all' ||
            mission.categoria === filterCategory;

        return matchesSearch && matchesCategory;
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <Heading size="lg" fontWeight="800">Misiones Diarias</Heading>
                        <Text color="gray.500" fontSize="sm">Gestiona los retos diarios que impulsan el cambio ambiental.</Text>
                    </VStack>
                    <Button
                        leftIcon={<HiPlus />}
                        colorScheme="green"
                        onClick={handleCreateMission}
                        borderRadius="xl"
                        px={8}
                        shadow="md"
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                    >
                        Nueva Misión
                    </Button>
                </Flex>

                <MissionStats missions={missions} />

                {/* Filtros */}
                <Box
                    p={4}
                    bg={bg}
                    borderRadius="2xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <HStack spacing={4}>
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none">
                                <HiSearch color="gray.300" />
                            </InputLeftElement>
                            <Input
                                placeholder="Buscar por título o descripción..."
                                borderRadius="xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                        <Select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            borderRadius="xl"
                            maxW="200px"
                        >
                            <option value="all">Todas las categorías</option>
                            <option value="energia">Energía</option>
                            <option value="agua">Agua</option>
                            <option value="transporte">Transporte</option>
                            <option value="residuos">Residuos</option>
                        </Select>
                    </HStack>
                </Box>

                <MissionTable
                    missions={filteredMissions}
                    isLoading={isLoading}
                    onEdit={handleEditMission}
                    onDelete={handleDeleteMission}
                />
            </VStack>

            <MissionModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSaveMission}
                mission={selectedMission}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </Container>
    );
};
