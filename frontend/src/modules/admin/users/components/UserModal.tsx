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
    FormErrorMessage
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
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent borderRadius="2xl">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader fontWeight="bold">
                        Crear Nuevo Usuario
                    </ModalHeader>
                    <ModalCloseButton />

                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isInvalid={!!errors.username}>
                                <FormLabel fontSize="sm">Nombre de Usuario</FormLabel>
                                <Input
                                    placeholder="ej. juan_perez"
                                    {...register('username', { required: 'El nombre de usuario es obligatorio' })}
                                />
                                <FormErrorMessage>{errors.username?.message as string}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.email}>
                                <FormLabel fontSize="sm">Correo Electrónico</FormLabel>
                                <Input
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    {...register('email', { required: 'El correo es obligatorio' })}
                                />
                                <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">Rol</FormLabel>
                                <Select {...register('role')}>
                                    <option value="user">Usuario</option>
                                    <option value="admin">Administrador</option>
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm">Estado</FormLabel>
                                <Select {...register('status')}>
                                    <option value="active">Activo</option>
                                    <option value="suspended">Suspendido</option>
                                </Select>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="brand"
                            bg="brand.primary"
                            _hover={{ bg: 'brand.hover' }}
                            type="submit"
                            isLoading={mutation.isPending}
                            borderRadius="xl"
                        >
                            Crear Usuario
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
