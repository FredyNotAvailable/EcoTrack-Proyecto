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
import { ChallengeStats } from './components/ChallengeStats';
import { ChallengeTable } from './components/ChallengeTable';
import { ChallengeModal } from './components/ChallengeModal';
import { TaskModal } from './components/TaskModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';

export const AdminChallengesPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Selection states
    const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
    const [viewingTasksOf, setViewingTasksOf] = useState<any>(null);

    // Disclosures
    const challengeDisc = useDisclosure();
    const taskDisc = useDisclosure();

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Data Fetching
    const { data: challenges = [], isLoading } = useQuery({
        queryKey: ['admin', 'challenges'],
        queryFn: AdminAPIService.getChallenges,
    });

    // Mutations - Challenges
    const createChallengeMutation = useMutation({
        mutationFn: AdminAPIService.createChallenge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] });
            toast({ title: 'Reto creado', status: 'success' });
            challengeDisc.onClose();
        },
        onError: (error: any) => toast({ title: 'Error', description: error.response?.data?.message, status: 'error' })
    });

    const updateChallengeMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => AdminAPIService.updateChallenge(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] });
            toast({ title: 'Reto actualizado', status: 'success' });
            challengeDisc.onClose();
        },
        onError: (error: any) => toast({ title: 'Error', description: error.response?.data?.message, status: 'error' })
    });

    const deleteChallengeMutation = useMutation({
        mutationFn: AdminAPIService.deleteChallenge,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges'] });
            toast({ title: 'Reto eliminado', status: 'success' });
        }
    });

    // Handlers
    const handleCreateChallenge = () => {
        setSelectedChallenge(null);
        challengeDisc.onOpen();
    };

    const handleEditChallenge = (challenge: any) => {
        setSelectedChallenge(challenge);
        challengeDisc.onOpen();
    };

    const handleManageTasks = (challenge: any) => {
        setViewingTasksOf(challenge);
        taskDisc.onOpen();
    };

    const handleSaveChallenge = (data: any) => {
        if (selectedChallenge) {
            updateChallengeMutation.mutate({ id: selectedChallenge.id, data });
        } else {
            createChallengeMutation.mutate(data);
        }
    };

    // Filter Logic
    const filteredChallenges = challenges.filter((c: any) => {
        const matchesSearch = c.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || c.categoria === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
                <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                        <Heading size="lg" fontWeight="800">Retos Semanales</Heading>
                        <Text color="gray.500" fontSize="sm">Configura los desafíos de mayor impacto para la comunidad.</Text>
                    </VStack>
                    <Button
                        leftIcon={<HiPlus />}
                        colorScheme="brand"
                        onClick={handleCreateChallenge}
                        borderRadius="xl"
                        px={8}
                    >
                        Nuevo Reto
                    </Button>
                </Flex>

                <ChallengeStats challenges={challenges} />

                {/* Filtros */}
                <Box p={4} bg={bg} borderRadius="2xl" border="1px" borderColor={borderColor}>
                    <HStack spacing={4}>
                        <InputGroup maxW="400px">
                            <InputLeftElement pointerEvents="none"><HiSearch color="gray.300" /></InputLeftElement>
                            <Input
                                placeholder="Buscar retos..."
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

                <ChallengeTable
                    challenges={filteredChallenges}
                    isLoading={isLoading}
                    onEdit={handleEditChallenge}
                    onDelete={(id) => deleteChallengeMutation.mutate(id)}
                    onManageTasks={handleManageTasks}
                />
            </VStack>

            <ChallengeModal
                isOpen={challengeDisc.isOpen}
                onClose={challengeDisc.onClose}
                onSave={handleSaveChallenge}
                challenge={selectedChallenge}
                isLoading={createChallengeMutation.isPending || updateChallengeMutation.isPending}
            />

            <TaskModal
                isOpen={taskDisc.isOpen}
                onClose={taskDisc.onClose}
                challenge={viewingTasksOf}
            />
        </Container>
    );
};
