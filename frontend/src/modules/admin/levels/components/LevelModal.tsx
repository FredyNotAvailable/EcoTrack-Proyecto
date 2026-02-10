import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Text,
    FormHelperText,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface LevelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    level?: any; // If editing
    existingLevels: any[];
    isLoading: boolean;
}

export const LevelModal = ({ isOpen, onClose, onSave, level, existingLevels, isLoading }: LevelModalProps) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

    const nivelValue = watch('nivel');


    useEffect(() => {
        if (level) {
            reset({
                nivel: level.nivel,
                puntos_minimos: level.puntos_minimos,
            });
        } else {
            const maxLevel = existingLevels.length > 0
                ? Math.max(...existingLevels.map(l => l.nivel))
                : 0;
            reset({
                nivel: maxLevel + 1,
                puntos_minimos: 0,
            });
        }
    }, [level, reset, isOpen, existingLevels]);

    const onSubmit = (data: any) => {
        onSave(data);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay backdropFilter="blur(10px)" />
            <ModalContent borderRadius="3xl" p={2}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader fontSize="2xl" fontWeight="800">
                        {level ? 'Editar Nivel' : 'Nuevo Nivel'}
                        <Text fontSize="xs" color="gray.500" fontWeight="normal">Configura la escala de progresión.</Text>
                    </ModalHeader>
                    <ModalCloseButton borderRadius="full" top={6} right={6} />

                    <ModalBody>
                        <VStack spacing={5}>
                            <FormControl isRequired isInvalid={!!errors.nivel}>
                                <FormLabel fontWeight="bold" fontSize="sm">Número de Nivel</FormLabel>
                                <Input
                                    type="number"
                                    {...register('nivel', {
                                        required: 'El nivel es obligatorio',
                                        valueAsNumber: true,
                                        min: { value: 1, message: 'Mínimo nivel 1' },
                                        validate: (value) => {
                                            if (!level && existingLevels.some(l => l.nivel === value)) {
                                                return 'Este número de nivel ya existe';
                                            }
                                            return true;
                                        }
                                    })}
                                    borderRadius="xl"
                                    placeholder="Ej: 5"
                                    isDisabled={true}
                                />
                                <FormHelperText>El número de nivel se asigna automáticamente de forma secuencial.</FormHelperText>
                                {errors.nivel && <Text color="red.500" fontSize="xs" mt={1}>{errors.nivel.message as string}</Text>}
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.puntos_minimos}>
                                <FormLabel fontWeight="bold" fontSize="sm">Puntos Mínimos Requeridos</FormLabel>
                                <Input
                                    type="number"
                                    {...register('puntos_minimos', {
                                        required: 'Puntos obligatorios',
                                        valueAsNumber: true,
                                        min: { value: 0, message: 'No puede ser negativo' },
                                        validate: (value) => {
                                            const currentNivel = level?.nivel || nivelValue;
                                            if (!currentNivel) return true;

                                            // Find neighbors in existing levels (excluding the one being edited if applicable)
                                            const otherLevels = existingLevels.filter(l => l.nivel !== level?.nivel);
                                            const prev = [...otherLevels].sort((a, b) => b.nivel - a.nivel).find(l => l.nivel < currentNivel);
                                            const next = [...otherLevels].sort((a, b) => a.nivel - b.nivel).find(l => l.nivel > currentNivel);

                                            if (prev && value <= prev.puntos_minimos) {
                                                return `Debe ser superior a ${prev.puntos_minimos} (Nivel ${prev.nivel})`;
                                            }
                                            if (next && value >= next.puntos_minimos) {
                                                return `Debe ser inferior a ${next.puntos_minimos} (Nivel ${next.nivel})`;
                                            }
                                            return true;
                                        }
                                    })}
                                    borderRadius="xl"
                                    placeholder="Ej: 1000"
                                />
                                {errors.puntos_minimos ? (
                                    <Text color="red.500" fontSize="xs" mt={1}>{errors.puntos_minimos.message as string}</Text>
                                ) : (
                                    <FormHelperText>Los puntos necesarios para alcanzar este rango.</FormHelperText>
                                )}
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter px={6} pb={6}>
                        <Button variant="ghost" mr={3} onClick={onClose} borderRadius="xl">
                            Cancelar
                        </Button>
                        <Button
                            colorScheme="brand"
                            type="submit"
                            isLoading={isLoading}
                            borderRadius="xl"
                            px={8}
                        >
                            {level ? 'Actualizar Nivel' : 'Crear Nivel'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
