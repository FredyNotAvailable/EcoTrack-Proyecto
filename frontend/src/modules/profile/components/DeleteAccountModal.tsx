import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    Text,
    VStack,
    Icon,
    Box,
    useToast,
    Heading
} from '@chakra-ui/react';
import { FaHeartCrack, FaGhost } from 'react-icons/fa6';
import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ProfileAPIService } from '../services/profile.service';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await ProfileAPIService.deleteAccount();

            toast({
                title: "Cuenta eliminada",
                description: "Esperamos volver a verte pronto. ¡Gracias por tu impacto! 🌍",
                status: "success",
                duration: 5000,
            });

            // Force logout and redirect
            await signOut();
            navigate('/login');

        } catch (error) {
            toast({
                title: "Error",
                description: "No pudimos eliminar tu cuenta. Por favor intenta de nuevo.",
                status: "error",
                duration: 4000
            });
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay backdropFilter="blur(8px)" bg="blackAlpha.600" />
            <ModalContent borderRadius="32px" overflow="hidden" boxShadow="2xl">
                <ModalCloseButton borderRadius="full" zIndex={2} />
                <ModalBody p={0}>
                    {/* Visual Header */}
                    <Box bg="red.50" p={8} textAlign="center" position="relative" overflow="hidden">
                        <Icon
                            as={FaGhost}
                            position="absolute"
                            bottom="-20px"
                            right="-20px"
                            fontSize="160px"
                            color="red.100"
                            opacity={0.5}
                            transform="rotate(-20deg)"
                        />
                        <VStack spacing={4} position="relative" zIndex={1}>
                            <Box
                                bg="white"
                                p={4}
                                borderRadius="full"
                                boxShadow="sm"
                                animation="pulse 2s infinite"
                            >
                                <Icon as={FaHeartCrack} fontSize="40px" color="red.400" />
                            </Box>
                            <Heading size="lg" color="red.800" fontWeight="900">
                                ¿Es un adiós definitivo?
                            </Heading>
                        </VStack>
                    </Box>

                    {/* Content */}
                    <VStack p={8} spacing={4} textAlign="center">
                        <Text color="gray.600" fontSize="md" lineHeight="1.6">
                            Sentimos mucho que te vayas. Al eliminar tu cuenta,
                            <Text as="span" fontWeight="bold" color="red.500"> perderás todo tu progreso, puntos y estadísticas de impacto </Text>
                            de forma permanente.
                        </Text>
                        <Text fontSize="sm" color="gray.400" fontStyle="italic">
                            Esta acción no se puede deshacer.
                        </Text>
                    </VStack>
                </ModalBody>

                <ModalFooter p={6} pt={0} gap={3} justifyContent="center">
                    <Button
                        variant="ghost"
                        borderRadius="full"
                        onClick={onClose}
                        fontWeight="700"
                        color="gray.500"
                    >
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="red"
                        bg="red.500"
                        _hover={{ bg: "red.600", transform: "translateY(-1px)" }}
                        color="white"
                        borderRadius="full"
                        px={6}
                        isLoading={isLoading}
                        loadingText="Eliminando..."
                        onClick={handleDelete}
                        fontWeight="800"
                        boxShadow="lg"
                    >
                        Sí, eliminar cuenta
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
