import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    RadioGroup,
    Radio,
    Stack,
    Text,
    Textarea,
    VStack,
    Box
} from '@chakra-ui/react';
import { useState } from 'react';

interface ReportPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details?: string) => void;
    isLoading?: boolean;
}

export const ReportPostModal = ({ isOpen, onClose, onSubmit, isLoading }: ReportPostModalProps) => {
    const [reason, setReason] = useState('spam');
    const [details, setDetails] = useState('');
    const [step, setStep] = useState<'select' | 'confirm'>('select');

    const handleNext = () => {
        setStep('confirm');
    };

    const handleBack = () => {
        setStep('select');
    };

    const handleSubmit = () => {
        onSubmit(reason, details);
    };

    const handleClose = () => {
        onClose();
        setStep('select');
        setReason('spam');
        setDetails('');
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader>Reportar publicación</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {step === 'select' ? (
                        <>
                            <Text mb={4} color="gray.600">
                                ¿Por qué quieres reportar esta publicación?
                            </Text>

                            <RadioGroup onChange={setReason} value={reason}>
                                <Stack direction="column" spacing={3}>
                                    <Radio value="spam" colorScheme="red">Es spam o engañoso</Radio>
                                    <Radio value="inappropriate" colorScheme="red">Contenido inapropiado u ofensivo</Radio>
                                    <Radio value="harassment" colorScheme="red">Acoso o intimidación</Radio>
                                    <Radio value="misinformation" colorScheme="red">Información falsa</Radio>
                                    <Radio value="other" colorScheme="red">Otro motivo</Radio>
                                </Stack>
                            </RadioGroup>

                            {reason === 'other' && (
                                <Textarea
                                    mt={4}
                                    placeholder="Por favor, describe el problema..."
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    resize="none"
                                    focusBorderColor="red.500"
                                />
                            )}
                        </>
                    ) : (
                        <VStack spacing={4} align="start">
                            <Text fontWeight="bold">¿Estás seguro de que quieres reportar esta publicación?</Text>
                            <Text fontSize="sm" color="gray.600">
                                Si reportas esta publicación, nuestros moderadores la revisarán. Si infringe nuestras normas, será eliminada.
                            </Text>
                            <Box w="100%" p={3} bg="gray.50" borderRadius="md">
                                <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>RAZÓN SELECCIONADA:</Text>
                                <Text fontSize="sm">
                                    {reason === 'spam' && 'Es spam o engañoso'}
                                    {reason === 'inappropriate' && 'Contenido inapropiado u ofensivo'}
                                    {reason === 'harassment' && 'Acoso o intimidación'}
                                    {reason === 'misinformation' && 'Información falsa'}
                                    {reason === 'other' && 'Otro motivo'}
                                </Text>
                                {details && (
                                    <Text fontSize="sm" mt={1} fontStyle="italic">"{details}"</Text>
                                )}
                            </Box>
                        </VStack>
                    )}
                </ModalBody>

                <ModalFooter>
                    {step === 'select' ? (
                        <>
                            <Button variant="ghost" mr={3} onClick={handleClose}>
                                Cancelar
                            </Button>
                            <Button colorScheme="red" onClick={handleNext}>
                                Siguiente
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" mr={3} onClick={handleBack}>
                                Atrás
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                bg="red.500"
                                _hover={{ bg: "red.600" }}
                            >
                                Confirmar Reporte
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
