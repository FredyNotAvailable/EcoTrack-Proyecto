import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Select,
    useToast,
    FormErrorMessage,
    useColorModeValue
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminAPIService } from '../../services/admin.service';
import { useEffect } from 'react';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserModal = ({ isOpen, onClose }: UserModalProps) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            role: 'user',
            status: 'active'
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                username: '',
                email: '',
                role: 'user',
                status: 'active'
            });
        }
    }, [isOpen, reset]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            // Add default password for new users
            const newData = { ...data, password: 'password' };
            return AdminAPIService.createUser(newData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
            toast({
                title: 'Usuario creado',
                description: 'La contraseña por defecto es "password"',
                status: 'success',
                duration: 4000
            });
            onClose();
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.error?.message || 'Algo salió mal',
                status: 'error',
                duration: 5000
            });
        }
    });

    const onSubmit = (data: any) => {
        mutation.mutate(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="3xl" shadow="2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader fontWeight="900" fontSize="xl" pt={8} px={8}>
                        Crear Nuevo Usuario
                    </ModalHeader>
                    <ModalCloseButton mt={4} mr={4} />

                    <ModalBody px={8} py={4}>
                        <VStack spacing={6}>
                            <FormControl isInvalid={!!errors.username}>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">Nombre de Usuario</FormLabel>
                                <Input
                                    placeholder="ej. juan_perez"
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    border="none"
                                    borderRadius="xl"
                                    py={6}
                                    {...register('username', { required: 'El nombre de usuario es obligatorio' })}
                                />
                                <FormErrorMessage>{errors.username?.message as string}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.email}>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">Correo Electrónico</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    border="none"
                                    borderRadius="xl"
                                    py={6}
                                    {...register('email', { required: 'El correo es obligatorio' })}
                                />
                                <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">Rol del Usuario</FormLabel>
                                <Select
                                    {...register('role')}
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    border="none"
                                    borderRadius="xl"
                                    h="50px"
                                >
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">Estado Inicial</FormLabel>
                                <Select
                                    {...register('status')}
                                    bg={useColorModeValue('gray.50', 'gray.700')}
                                    border="none"
                                    borderRadius="xl"
                                    h="50px"
                                >
                                    <option value="active">Activo</option>
                                    <option value="suspended">Suspendido</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={8} pb={8} pt={4}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl" fontWeight="600">
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="brand"
                            px={8}
                            type="submit"
                            isLoading={mutation.isPending}
                            borderRadius="xl"
                            fontWeight="800"
                            shadow="lg"
                            _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                        >
                            Crear Usuario
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
