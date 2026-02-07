import { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    VStack,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    Icon,
    Input,
    Button,
    Text,
    Alert,
    AlertIcon,
    AlertDescription,
    Box,
} from "@chakra-ui/react";
import { FaEnvelope, FaLeaf, FaPaperPlane } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { AuthService } from "../services/auth.service";

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const leafFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
`;

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialEmail?: string;
}

export const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = "" }: ForgotPasswordModalProps) => {
    const [email, setEmail] = useState(initialEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email.trim()) return;

        setIsLoading(true);
        setStatus("idle");

        try {
            const result = await AuthService.forgotPassword(email.trim());
            
            if (result.success) {
                setStatus("success");
                setMessage("¡Listo! Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña. 🌱");
            } else {
                setStatus("error");
                setMessage(result.message);
            }
        } catch {
            setStatus("error");
            setMessage("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStatus("idle");
        setMessage("");
        setEmail(initialEmail);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
            <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
            <ModalContent
                bg="white"
                _dark={{ bg: "gray.800" }}
                borderRadius="2xl"
                mx={4}
                animation={`${fadeIn} 0.3s ease`}
                overflow="hidden"
            >
                {/* Header decorativo */}
                <Box
                    bg="linear-gradient(135deg, brand.primary 0%, brand.secondary 100%)"
                    bgGradient="linear(135deg, brand.primary, brand.secondary)"
                    py={6}
                    textAlign="center"
                    position="relative"
                >
                    <Icon
                        as={FaLeaf}
                        boxSize={8}
                        color="white"
                        mb={2}
                        animation={`${leafFloat} 3s ease-in-out infinite`}
                    />
                    <ModalHeader
                        color="white"
                        fontSize="xl"
                        fontWeight="700"
                        pb={0}
                        pt={0}
                    >
                        Recuperar Contraseña
                    </ModalHeader>
                    <Text color="whiteAlpha.900" fontSize="sm" mt={1}>
                        Te ayudamos a volver a tu cuenta
                    </Text>
                </Box>
                
                <ModalCloseButton color="white" top={4} />

                <ModalBody py={6} px={6}>
                    {status === "success" ? (
                        <VStack spacing={4} py={4}>
                            <Alert
                                status="success"
                                borderRadius="xl"
                                bg="green.50"
                                flexDirection="column"
                                alignItems="center"
                                justifyContent="center"
                                textAlign="center"
                                py={6}
                            >
                                <AlertIcon boxSize={10} mr={0} mb={3} color="green.500" />
                                <AlertDescription fontSize="sm" color="green.800" fontWeight="500">
                                    {message}
                                </AlertDescription>
                            </Alert>
                            <Text fontSize="xs" color="brand.textMuted" textAlign="center">
                                Revisa tu bandeja de entrada y también la carpeta de spam.
                                El enlace expira en 24 horas.
                            </Text>
                            <Button
                                w="full"
                                variant="outline"
                                onClick={handleClose}
                                borderRadius="xl"
                                mt={2}
                            >
                                Entendido
                            </Button>
                        </VStack>
                    ) : (
                        <VStack spacing={5} as="form" onSubmit={handleSubmit}>
                            <Text fontSize="sm" color="brand.textMuted" textAlign="center">
                                Ingresa el correo asociado a tu cuenta y te enviaremos
                                instrucciones para restablecer tu contraseña.
                            </Text>

                            {status === "error" && (
                                <Alert status="error" borderRadius="xl" fontSize="sm">
                                    <AlertIcon />
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" fontSize="sm" mb={1}>
                                    Correo Electrónico
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                                        <Icon as={FaEnvelope} boxSize={4} />
                                    </InputLeftElement>
                                    <Input
                                        type="email"
                                        placeholder="ejemplo@email.com"
                                        bg="brand.bgBody"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        focusBorderColor="brand.primary"
                                        borderRadius="xl"
                                        autoFocus
                                    />
                                </InputGroup>
                            </FormControl>

                            <Button
                                w="full"
                                variant="solid"
                                size="md"
                                h="44px"
                                type="submit"
                                isLoading={isLoading}
                                loadingText="Enviando..."
                                borderRadius="xl"
                                fontWeight="700"
                                leftIcon={<Icon as={FaPaperPlane} />}
                            >
                                Enviar Instrucciones
                            </Button>

                            <Button
                                w="full"
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                color="brand.textMuted"
                            >
                                Cancelar
                            </Button>
                        </VStack>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
