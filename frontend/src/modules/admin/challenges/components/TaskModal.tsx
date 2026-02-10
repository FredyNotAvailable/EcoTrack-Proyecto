import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Flex,
    Text,
    Box,
    IconButton,
    useColorModeValue,
    FormControl,
    FormLabel,
    Input,
    Badge,
    Spinner,
    Center,
    useToast,
    SimpleGrid,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    useDisclosure as useChakraDisclosure,
} from '@chakra-ui/react';
import { useState, useRef } from 'react';
import { HiPlus, HiPencil, HiTrash, HiChevronLeft } from 'react-icons/hi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../../services/admin.service';
import { useForm } from 'react-hook-form';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    challenge: any;
}

export const TaskModal = ({ isOpen, onClose, challenge }: TaskModalProps) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [editingTask, setEditingTask] = useState<any>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Alert Dialog for deletion
    const deleteDisc = useChakraDisclosure();
    const cancelRef = useRef<HTMLButtonElement>(null);
    const [taskToDelete, setTaskToDelete] = useState<any>(null);

    const { register, handleSubmit, reset } = useForm();

    // Data - Tasks
    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['admin', 'challenges', challenge?.id, 'tasks'],
        queryFn: () => AdminAPIService.getChallengeTasks(challenge.id),
        enabled: !!challenge?.id && isOpen,
    });

    // Mutations
    const createTaskMutation = useMutation({
        mutationFn: AdminAPIService.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges', challenge?.id, 'tasks'] });
            toast({ title: 'Tarea añadida', status: 'success' });
            setIsFormOpen(false);
        }
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => AdminAPIService.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges', challenge?.id, 'tasks'] });
            toast({ title: 'Tarea actualizada', status: 'success' });
            setIsFormOpen(false);
        }
    });

    const deleteTaskMutation = useMutation({
        mutationFn: AdminAPIService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'challenges', challenge?.id, 'tasks'] });
            toast({ title: 'Tarea eliminada', status: 'success' });
        }
    });

    // Handlers
    const handleAddNew = () => {
        if (tasks.length >= 5) {
            toast({ title: 'Límite alcanzado', description: 'Un reto solo puede tener 5 tareas (Lunes a Viernes)', status: 'warning' });
            return;
        }
        setEditingTask(null);
        reset({
            titulo: '',
            descripcion: '',
            recompensa_puntos: 50,
            recompensa_kg_co2: 0.5,
            dia_orden: tasks.length + 1,
            reto_id: challenge.id
        });
        setIsFormOpen(true);
    };

    const handleEdit = (task: any) => {
        setEditingTask(task);
        reset({
            titulo: task.titulo,
            descripcion: task.descripcion,
            recompensa_puntos: task.recompensa_puntos,
            recompensa_kg_co2: task.recompensa_kg_co2,
            dia_orden: task.dia_orden,
            reto_id: challenge.id
        });
        setIsFormOpen(true);
    };

    const onSubmit = (data: any) => {
        if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, data });
        } else {
            createTaskMutation.mutate(data);
        }
    };

    const handleDeleteClick = (task: any) => {
        setTaskToDelete(task);
        deleteDisc.onOpen();
    };

    const confirmDelete = () => {
        if (taskToDelete) {
            deleteTaskMutation.mutate(taskToDelete.id);
            deleteDisc.onClose();
        }
    };

    const itemBg = useColorModeValue('gray.50', 'gray.700');

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent borderRadius="3xl" p={2}>
                <ModalHeader fontSize="xl" fontWeight="800">
                    {isFormOpen ? (
                        <HStack spacing={3}>
                            <IconButton
                                aria-label="Atrás"
                                icon={<HiChevronLeft />}
                                size="sm"
                                variant="ghost"
                                onClick={() => setIsFormOpen(false)}
                                borderRadius="full"
                            />
                            <Text>{editingTask ? 'Editar Tarea' : 'Añadir Nueva Tarea'}</Text>
                        </HStack>
                    ) : (
                        <VStack align="start" spacing={0}>
                            <Text>Tareas del Reto</Text>
                            <Text fontSize="sm" color="gray.500" fontWeight="normal">Configura de 1 a 5 tareas (Lunes a Viernes) para "{challenge?.titulo}"</Text>
                        </VStack>
                    )}
                </ModalHeader>
                <ModalCloseButton borderRadius="full" top={6} right={6} />

                <ModalBody pb={6}>
                    {isFormOpen ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">Título de la Tarea</FormLabel>
                                    <Input {...register('titulo')} borderRadius="xl" placeholder="Ej: Registrar 3 comidas vegetarianas" />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold">Descripción (Qué debe hacer el usuario)</FormLabel>
                                    <Input {...register('descripcion')} borderRadius="xl" placeholder="Instrucción corta..." />
                                </FormControl>
                                <SimpleGrid columns={3} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">Puntos</FormLabel>
                                        <Input type="number" {...register('recompensa_puntos', { valueAsNumber: true })} borderRadius="xl" />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">Kg CO2</FormLabel>
                                        <Input type="number" step="0.01" {...register('recompensa_kg_co2', { valueAsNumber: true })} borderRadius="xl" />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm" fontWeight="bold">Día (1-5)</FormLabel>
                                        <Input type="number" {...register('dia_orden', { valueAsNumber: true, min: 1, max: 5 })} borderRadius="xl" />
                                    </FormControl>
                                </SimpleGrid>
                                <Button
                                    w="full"
                                    colorScheme="brand"
                                    type="submit"
                                    isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
                                    borderRadius="xl"
                                    mt={2}
                                >
                                    {editingTask ? 'Guardar Cambios' : 'Añadir Tarea al Reto'}
                                </Button>
                            </VStack>
                        </form>
                    ) : (
                        <VStack spacing={3} align="stretch" mt={2}>
                            {isLoading ? (
                                <Center py={10}><Spinner color="brand.primary" /></Center>
                            ) : tasks.length === 0 ? (
                                <Center py={10} bg={itemBg} borderRadius="2xl">
                                    <VStack spacing={3}>
                                        <Text color="gray.500" fontSize="sm">Aún no hay tareas para este reto.</Text>
                                        <Button leftIcon={<HiPlus />} size="sm" onClick={handleAddNew} borderRadius="lg">Crear Primera Tarea</Button>
                                    </VStack>
                                </Center>
                            ) : (
                                <>
                                    <Flex justify="space-between" align="center" mb={1}>
                                        <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">
                                            Listado de Tareas ({tasks.length})
                                        </Text>
                                        <Button
                                            leftIcon={<HiPlus />}
                                            variant="ghost"
                                            colorScheme="brand"
                                            size="sm"
                                            onClick={handleAddNew}
                                            isDisabled={tasks.length >= 5}
                                        >
                                            Añadir Tarea
                                        </Button>
                                    </Flex>
                                    {tasks.length >= 5 && (
                                        <Box p={3} bg="orange.50" borderRadius="xl" border="1px" borderColor="orange.100">
                                            <Text fontSize="xs" color="orange.700" textAlign="center" fontWeight="bold">
                                                Límite alcanzado: Los retos están diseñados para 5 días (Lunes a Viernes).
                                            </Text>
                                        </Box>
                                    )}
                                    {tasks.sort((a: any, b: any) => a.dia_orden - b.dia_orden).map((task: any) => (
                                        <Box
                                            key={task.id}
                                            p={4}
                                            bg={itemBg}
                                            borderRadius="2xl"
                                            border="1px"
                                            borderColor="transparent"
                                            _hover={{ borderColor: 'brand.primary', bg: useColorModeValue('white', 'gray.600'), shadow: 'sm' }}
                                            transition="all 0.2s"
                                        >
                                            <Flex justify="space-between" align="center">
                                                <HStack spacing={4}>
                                                    <Center w="32px" h="32px" borderRadius="lg" bg="brand.50" color="brand.primary" fontWeight="bold">
                                                        {task.dia_orden}
                                                    </Center>
                                                    <VStack align="start" spacing={0}>
                                                        <Text fontWeight="bold" fontSize="sm">{task.titulo}</Text>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme="green" variant="subtle" fontSize="9px">+{task.recompensa_puntos} pts</Badge>
                                                            <Badge colorScheme="blue" variant="subtle" fontSize="9px">{task.recompensa_kg_co2}kg CO2</Badge>
                                                        </HStack>
                                                    </VStack>
                                                </HStack>
                                                <HStack>
                                                    <IconButton
                                                        aria-label="Editar"
                                                        icon={<HiPencil />}
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEdit(task)}
                                                        borderRadius="lg"
                                                    />
                                                    <IconButton
                                                        aria-label="Eliminar"
                                                        icon={<HiTrash />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() => handleDeleteClick(task)}
                                                        borderRadius="lg"
                                                    />
                                                </HStack>
                                            </Flex>
                                        </Box>
                                    ))}
                                </>
                            )}
                        </VStack>
                    )}
                </ModalBody>

                <AlertDialog
                    isOpen={deleteDisc.isOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={deleteDisc.onClose}
                >
                    <AlertDialogOverlay backdropFilter="blur(4px)">
                        <AlertDialogContent borderRadius="2xl">
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Eliminar Tarea
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                ¿Estás seguro de eliminar <b>{taskToDelete?.titulo}</b>?
                                Esta acción no se puede deshacer.
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={deleteDisc.onClose} borderRadius="xl">
                                    Cancelar
                                </Button>
                                <Button colorScheme="red" onClick={confirmDelete} ml={3} borderRadius="xl">
                                    Confirmar Eliminación
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </ModalContent>
        </Modal>
    );
};
