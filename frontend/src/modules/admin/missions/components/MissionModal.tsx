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
    FormErrorMessage,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface MissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    mission: any;
    isLoading: boolean;
}

export const MissionModal = ({ isOpen, onClose, onSave, mission, isLoading }: MissionModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm();

    useEffect(() => {
        if (mission) {
            reset(mission);
        } else {
            reset({
                titulo: '',
                descripcion: '',
                eco_tip: '',
                impacto: '',
                kg_co2_ahorrado: 0,
                puntos: 50,
                dificultad: 'fácil',
                categoria: 'energia',
                activa: true
            });
        }
    }, [mission, reset, isOpen]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="3xl" p={2}>
                <ModalHeader fontSize="2xl" fontWeight="800">
                    {mission ? 'Editar Misión' : 'Nueva Misión'}
                </ModalHeader>
                <ModalCloseButton borderRadius="full" top={6} right={6} />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody>
                        <VStack spacing={5}>
                            <FormControl isInvalid={!!errors.titulo} isRequired>
                                <FormLabel fontWeight="bold">Título</FormLabel>
                                <Input
                                    {...register('titulo', { required: 'El título es obligatorio' })}
                                    placeholder="Ej: Apaga las luces innecesarias"
                                    borderRadius="xl"
                                />
                                <FormErrorMessage>{errors.titulo?.message as string}</FormErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={!!errors.descripcion} isRequired>
                                <FormLabel fontWeight="bold">Descripción</FormLabel>
                                <Textarea
                                    {...register('descripcion', { required: 'La descripción es obligatoria' })}
                                    placeholder="Describe qué debe hacer el usuario..."
                                    borderRadius="xl"
                                    rows={3}
                                />
                                <FormErrorMessage>{errors.descripcion?.message as string}</FormErrorMessage>
                            </FormControl>

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
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Dificultad</FormLabel>
                                    <Select {...register('dificultad')} borderRadius="xl">
                                        <option value="fácil">Fácil</option>
                                        <option value="intermedio">Intermedio</option>
                                        <option value="difícil">Difícil</option>
                                    </Select>
                                </FormControl>
                            </SimpleGrid>

                            <SimpleGrid columns={2} spacing={4} w="full">
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">Puntos</FormLabel>
                                    <Input
                                        type="number"
                                        {...register('puntos', { valueAsNumber: true })}
                                        borderRadius="xl"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel fontWeight="bold">CO2 Ahorrado (kg)</FormLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...register('kg_co2_ahorrado', { valueAsNumber: true })}
                                        borderRadius="xl"
                                    />
                                </FormControl>
                            </SimpleGrid>

                            <FormControl>
                                <FormLabel fontWeight="bold">Eco Tip (Opcional)</FormLabel>
                                <Input
                                    {...register('eco_tip')}
                                    placeholder="Un pequeño consejo relacionado..."
                                    borderRadius="xl"
                                />
                            </FormControl>

                            <FormControl display="flex" alignItems="center" bg="gray.50" p={4} borderRadius="2xl">
                                <FormLabel mb="0" flex="1" fontWeight="bold">
                                    Misión Activa
                                    <Text fontSize="xs" color="gray.500" fontWeight="normal">Los usuarios podrán ver y completar esta misión.</Text>
                                </FormLabel>
                                <Switch {...register('activa')} colorScheme="green" size="lg" />
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={6} pb={6}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="green"
                            type="submit"
                            isLoading={isLoading}
                            borderRadius="xl"
                            px={8}
                        >
                            {mission ? 'Guardar Cambios' : 'Crear Misión'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
