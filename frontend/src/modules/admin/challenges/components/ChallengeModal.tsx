import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Textarea,
    Select,
    SimpleGrid,
    Switch,
    Text,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface ChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    challenge: any;
    isLoading: boolean;
}

export const ChallengeModal = ({ isOpen, onClose, onSave, challenge, isLoading }: ChallengeModalProps) => {
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (challenge) {
            reset({
                titulo: challenge.titulo,
                descripcion: challenge.descripcion,
                categoria: challenge.categoria,
                recompensa_puntos: challenge.recompensa_puntos,
                recompensa_kg_co2: challenge.recompensa_kg_co2,
                fecha_inicio: challenge.fecha_inicio.split('T')[0],
                fecha_fin: challenge.fecha_fin.split('T')[0],
                activo: challenge.activo !== false
            });
        } else {
            reset({
                titulo: '',
                descripcion: '',
                categoria: 'energia',
                recompensa_puntos: 500,
                recompensa_kg_co2: 5.0,
                fecha_inicio: new Date().toISOString().split('T')[0],
                fecha_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                activo: true
            });
        }
    }, [challenge, reset, isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(8px)" />
            <ModalContent borderRadius="3xl" p={2}>
                <ModalHeader fontSize="2xl" fontWeight="800">
                    {challenge ? 'Editar Reto Semanal' : 'Nuevo Reto Semanal'}
                    <Text fontSize="xs" color="gray.500" fontWeight="normal">Los retos consisten en 5 tareas (Lunes a Viernes).</Text>
                </ModalHeader>
                <ModalCloseButton borderRadius="full" top={6} right={6} />
                <form onSubmit={handleSubmit(onSave)}>
                    <ModalBody>
                        <VStack spacing={5}>
                            <FormControl isRequired>
                                <FormLabel fontWeight="bold">Título del Reto</FormLabel>
                                <Input {...register('titulo')} borderRadius="xl" placeholder="Ej: Semana del Ahorro Energético" />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="bold">Descripción Detallada</FormLabel>
                                <Textarea {...register('descripcion')} borderRadius="xl" rows={3} placeholder="Describe el objetivo global de este reto semanal..." />
                            </FormControl>

                            <SimpleGrid columns={2} spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Fecha Inicio</FormLabel>
                                    <Input type="date" {...register('fecha_inicio')} borderRadius="xl" />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Fecha Fin</FormLabel>
                                    <Input type="date" {...register('fecha_fin')} borderRadius="xl" />
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={2} spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Puntos (Total)</FormLabel>
                                    <Input type="number" {...register('recompensa_puntos', { valueAsNumber: true })} borderRadius="xl" />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Kg CO2 (Total)</FormLabel>
                                    <Input type="number" step="0.01" {...register('recompensa_kg_co2', { valueAsNumber: true })} borderRadius="xl" />
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={2} spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Categoría</FormLabel>
                                    <Select {...register('categoria')} borderRadius="xl">
                                        <option value="energia">Energía</option>
                                        <option value="agua">Agua</option>
                                        <option value="transporte">Transporte</option>
                                        <option value="residuos">Residuos</option>
                                    </Select>
                                </FormControl>
                                <FormControl display="flex" alignItems="center" pt={8}>
                                    <FormLabel mb="0" fontSize="sm" fontWeight="bold">Reto Activo</FormLabel>
                                    <Switch size="lg" colorScheme="green" {...register('activo')} />
                                </FormControl>
                            </SimpleGrid>
                        </VStack>
                    </ModalBody>
                    <ModalFooter px={6} pb={6}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">Cancelar</Button>
                        <Button colorScheme="brand" type="submit" isLoading={isLoading} borderRadius="xl" px={8}>
                            {challenge ? 'Guardar Cambios' : 'Crear Reto'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
