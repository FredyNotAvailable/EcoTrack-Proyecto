import {
    Heading,
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
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiPlus, HiChevronRight } from 'react-icons/hi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../services/admin.service';
import { LevelStats } from './components/LevelStats';
import { LevelTable } from './components/LevelTable';
import { LevelModal } from './components/LevelModal';

export const AdminLevelsPage = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedLevel, setSelectedLevel] = useState<any>(null);

    // Data Fetching
    const { data: levels = [], isLoading } = useQuery({
        queryKey: ['admin', 'levels'],
        queryFn: AdminAPIService.getLevels
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: AdminAPIService.createLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] });
            toast({ title: 'Nivel creado', status: 'success', isClosable: true });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo crear el nivel',
                status: 'error'
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ nivel, data }: { nivel: number, data: any }) =>
            AdminAPIService.updateLevel(nivel, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] });
            toast({ title: 'Nivel actualizado', status: 'success', isClosable: true });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'No se pudo actualizar el nivel',
                status: 'error'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: AdminAPIService.deleteLevel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'levels'] });
            toast({ title: 'Nivel eliminado', status: 'success', isClosable: true });
        }
    });

    // Handlers
    const handleCreateNew = () => {
        setSelectedLevel(null);
        onOpen();
    };

    const handleEdit = (level: any) => {
        setSelectedLevel(level);
        onOpen();
    };

    const handleSave = (formData: any) => {
        if (selectedLevel) {
            updateMutation.mutate({ nivel: selectedLevel.nivel, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const bgContainer = useColorModeValue('gray.50', 'gray.900');

    return (
        <Box minH="100vh" bg={bgContainer} py={8}>
            <Container maxW="container.xl">
                <VStack spacing={8} align="stretch">
                    {/* Header Section */}
                    <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={4}>
                        <VStack align="start" spacing={1}>
                            <Breadcrumb spacing="8px" separator={<HiChevronRight color="gray.500" />}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin" fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">Panel Admin</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbItem isCurrentPage>
                                    <BreadcrumbLink href="#" fontSize="xs" fontWeight="bold" color="brand.primary" textTransform="uppercase">Niveles</BreadcrumbLink>
                                </BreadcrumbItem>
                            </Breadcrumb>
                            <Heading size="lg" fontWeight="800">Escala de Niveles</Heading>
                            <Text color="gray.500">Configura los puntos requeridos para cada rango de usuario.</Text>
                        </VStack>

                        <Button
                            leftIcon={<HiPlus />}
                            colorScheme="brand"
                            size="lg"
                            borderRadius="2xl"
                            onClick={handleCreateNew}
                            boxShadow="lg"
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                        >
                            Nuevo Nivel
                        </Button>
                    </Flex>

                    {/* Stats Section */}
                    <LevelStats levels={levels} />

                    {/* Content Section */}
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <Text fontWeight="bold" color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
                                Niveles Configurados ({levels.length})
                            </Text>
                        </HStack>

                        <LevelTable
                            levels={levels}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={(nivel) => deleteMutation.mutate(nivel)}
                        />
                    </VStack>
                </VStack>
            </Container>

            <LevelModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                level={selectedLevel}
                existingLevels={levels}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </Box>
    );
};
