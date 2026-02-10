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
    Textarea,
    Switch,
    VStack,
    Text,
    FormErrorMessage,
    Flex,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    tip: any;
    isLoading: boolean;
}

export const TipModal = ({ isOpen, onClose, onSave, tip, isLoading }: TipModalProps) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        activo: true,
    });
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        if (tip) {
            setFormData({
                titulo: tip.titulo || '',
                descripcion: tip.descripcion || '',
                activo: tip.activo !== undefined ? tip.activo : true,
            });
        } else {
            setFormData({
                titulo: '',
                descripcion: '',
                activo: true,
            });
        }
        setErrors({});
    }, [tip, isOpen]);

    const validate = () => {
        const newErrors: any = {};
        if (formData.titulo.length < 5) newErrors.titulo = 'El título debe tener al menos 5 caracteres';
        if (formData.titulo.length > 100) newErrors.titulo = 'El título no puede exceder los 100 caracteres';
        if (formData.descripcion.length < 10) newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
        if (formData.descripcion.length > 500) newErrors.descripcion = 'La descripción no puede exceder los 500 caracteres';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
            <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.300" />
            <ModalContent borderRadius="2xl" shadow="2xl">
                <ModalHeader borderBottom="1px" borderColor="gray.100" py={6}>
                    {tip ? 'Editar Consejo Diario' : 'Nuevo Consejo Diario'}
                </ModalHeader>
                <ModalCloseButton top={6} />

                <form onSubmit={handleSubmit}>
                    <ModalBody py={8}>
                        <VStack spacing={6} align="stretch">
                            <FormControl isRequired isInvalid={!!errors.titulo}>
                                <FormLabel fontSize="sm" fontWeight="bold">Título del Consejo</FormLabel>
                                <Input
                                    value={formData.titulo}
                                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ej: Ahorra agua al lavarte los dientes"
                                    borderRadius="xl"
                                    h="50px"
                                />
                                <Flex justify="space-between">
                                    <FormErrorMessage>{errors.titulo}</FormErrorMessage>
                                    <Text fontSize="xs" color={formData.titulo.length > 100 ? 'red.500' : 'gray.500'} mt={1}>
                                        {formData.titulo.length}/100
                                    </Text>
                                </Flex>
                            </FormControl>

                            <FormControl isRequired isInvalid={!!errors.descripcion}>
                                <FormLabel fontSize="sm" fontWeight="bold">Descripción / Detalles</FormLabel>
                                <Textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    placeholder="Describe el consejo de forma breve y accionable..."
                                    borderRadius="xl"
                                    rows={5}
                                />
                                <Flex justify="space-between">
                                    <FormErrorMessage>{errors.descripcion}</FormErrorMessage>
                                    <Text fontSize="xs" color={formData.descripcion.length > 500 ? 'red.500' : 'gray.500'} mt={1}>
                                        {formData.descripcion.length}/500
                                    </Text>
                                </Flex>
                            </FormControl>

                            <FormControl display="flex" alignItems="center">
                                <FormLabel mb="0" fontSize="sm" fontWeight="bold">
                                    {formData.activo ? 'Consejo Activo' : 'Consejo Inactivo'}
                                </FormLabel>
                                <Switch
                                    colorScheme="green"
                                    isChecked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                />
                                <Text ml={4} fontSize="xs" color="gray.500">
                                    Los consejos inactivos no se mostrarán en la página de inicio.
                                </Text>
                            </FormControl>
                        </VStack>
                    </ModalBody>

                    <ModalFooter borderTop="1px" borderColor="gray.100" py={6}>
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
                            {tip ? 'Guardar Cambios' : 'Crear Consejo'}
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
};
