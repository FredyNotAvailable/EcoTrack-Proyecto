import {
    Container,
    VStack,
    useDisclosure,
    Button,
    Flex,
    Text,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
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


    return (
        <Container maxW="full" py={4} px={{ base: 0, md: 4 }}>
            <VStack spacing={8} align="stretch">
                <LevelStats levels={levels} />

                {/* Content Section Header & Action */}
                <Flex
                    justify="space-between"
                    align="center"
                    mb={2}
                >
                    <Text fontWeight="bold" color="gray.500" fontSize="sm" textTransform="uppercase" letterSpacing="wider">
                        Niveles Configurados ({levels.length})
                    </Text>

                    <Button
                        leftIcon={<HiPlus />}
                        colorScheme="brand"
                        size="md"
                        borderRadius="xl"
                        onClick={handleCreateNew}
                        shadow="sm"
                        _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                    >
                        Nuevo Nivel
                    </Button>
                </Flex>

                <LevelTable
                    levels={levels}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={(nivel) => deleteMutation.mutate(nivel)}
                />
            </VStack>

            <LevelModal
                isOpen={isOpen}
                onClose={onClose}
                onSave={handleSave}
                level={selectedLevel}
                existingLevels={levels}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />
        </Container>
    );
};
