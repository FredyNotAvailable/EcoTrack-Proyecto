import { useState, useEffect } from "react";
import {
    Box,
    VStack,
    Heading,
    Text,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Icon,
    Input,
    Button,
    Alert,
    AlertIcon,
    AlertDescription,
    Container,
    Card,
    CardBody,
    Spinner,
    Center,
} from "@chakra-ui/react";
import { FaLock, FaEye, FaEyeSlash, FaLeaf, FaCheckCircle } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../config/supabase";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const leafFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(10deg); }
`;

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValidSession, setIsValidSession] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        // Verificar si hay una sesión válida de recovery
        const checkSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error checking session:", error);
                    setIsValidSession(false);
                    setErrorMessage("El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.");
                } else if (session) {
                    setIsValidSession(true);
                } else {
                    // No hay sesión, verificar si es un recovery flow
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get("access_token");
                    const type = hashParams.get("type");

                    if (accessToken && type === "recovery") {
                        // Intentar establecer la sesión con el token
                        const { error: sessionError } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: hashParams.get("refresh_token") || "",
                        });

                        if (sessionError) {
                            setIsValidSession(false);
                            setErrorMessage("El enlace ha expirado o es inválido. Por favor, solicita uno nuevo.");
                        } else {
                            setIsValidSession(true);
                        }
                    } else {
                        setIsValidSession(false);
                        setErrorMessage("Acceso no autorizado. Debes usar el enlace enviado a tu correo.");
                    }
                }
            } catch {
                setIsValidSession(false);
                setErrorMessage("Error al verificar el enlace. Intenta de nuevo más tarde.");
            } finally {
                setIsVerifying(false);
            }
        };

        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setStatus("error");
            setErrorMessage("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setErrorMessage("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        setIsLoading(true);
        setStatus("idle");

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                setStatus("error");
                setErrorMessage(error.message || "Error al actualizar la contraseña");
            } else {
                setStatus("success");
                // Cerrar sesión después de cambiar contraseña para que inicie sesión con la nueva
                await supabase.auth.signOut();
            }
        } catch {
            setStatus("error");
            setErrorMessage("Error inesperado. Por favor, intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <Box minH="100vh" bg="brand.bgBody" display="flex" alignItems="center" justifyContent="center">
                <Center flexDirection="column" gap={4}>
                    <Spinner size="xl" color="brand.primary" thickness="4px" />
                    <Text color="brand.textMuted">Verificando enlace...</Text>
                </Center>
            </Box>
        );
    }

    if (!isValidSession) {
        return (
            <Box minH="100vh" bg="brand.bgBody" display="flex" alignItems="center" justifyContent="center" p={4}>
                <Container maxW="md">
                    <Card bg="brand.bgCard" borderRadius="2xl" overflow="hidden" animation={`${fadeIn} 0.5s ease`}>
                        <CardBody p={8} textAlign="center">
                            <Icon as={FaLeaf} boxSize={12} color="red.400" mb={4} />
                            <Heading size="md" mb={3} color="brand.text">
                                Enlace Inválido
                            </Heading>
                            <Text color="brand.textMuted" mb={6}>
                                {errorMessage}
                            </Text>
                            <Button
                                variant="solid"
                                onClick={() => navigate("/login")}
                                borderRadius="xl"
                            >
                                Volver al inicio de sesión
                            </Button>
                        </CardBody>
                    </Card>
                </Container>
            </Box>
        );
    }

    if (status === "success") {
        return (
            <Box minH="100vh" bg="brand.bgBody" display="flex" alignItems="center" justifyContent="center" p={4}>
                <Container maxW="md">
                    <Card bg="brand.bgCard" borderRadius="2xl" overflow="hidden" animation={`${fadeIn} 0.5s ease`}>
                        <CardBody p={8} textAlign="center">
                            <Icon 
                                as={FaCheckCircle} 
                                boxSize={16} 
                                color="green.400" 
                                mb={4}
                            />
                            <Heading size="md" mb={3} color="brand.text">
                                ¡Contraseña Actualizada! 🌱
                            </Heading>
                            <Text color="brand.textMuted" mb={6}>
                                Tu contraseña ha sido cambiada exitosamente.
                                Ahora puedes iniciar sesión con tu nueva contraseña.
                            </Text>
                            <Button
                                variant="solid"
                                onClick={() => navigate("/login")}
                                borderRadius="xl"
                                size="lg"
                            >
                                Iniciar Sesión
                            </Button>
                        </CardBody>
                    </Card>
                </Container>
            </Box>
        );
    }

    return (
        <Box minH="100vh" bg="brand.bgBody" display="flex" alignItems="center" justifyContent="center" p={4}>
            <Container maxW="md">
                <Card bg="brand.bgCard" borderRadius="2xl" overflow="hidden" animation={`${fadeIn} 0.5s ease`}>
                    {/* Header */}
                    <Box
                        bgGradient="linear(135deg, brand.primary, brand.secondary)"
                        py={6}
                        textAlign="center"
                    >
                        <Icon
                            as={FaLeaf}
                            boxSize={8}
                            color="white"
                            mb={2}
                            animation={`${leafFloat} 3s ease-in-out infinite`}
                        />
                        <Heading size="lg" color="white" fontWeight="700">
                            Nueva Contraseña
                        </Heading>
                        <Text color="whiteAlpha.900" fontSize="sm" mt={1}>
                            Crea tu nueva contraseña segura
                        </Text>
                    </Box>

                    <CardBody p={8}>
                        <VStack spacing={5} as="form" onSubmit={handleSubmit}>
                            {status === "error" && (
                                <Alert status="error" borderRadius="xl" fontSize="sm">
                                    <AlertIcon />
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" fontSize="sm" mb={1}>
                                    Nueva Contraseña
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                                        <Icon as={FaLock} boxSize={4} />
                                    </InputLeftElement>
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Mínimo 6 caracteres"
                                        bg="brand.bgBody"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        focusBorderColor="brand.primary"
                                        borderRadius="xl"
                                        autoFocus
                                    />
                                    <InputRightElement width="3rem">
                                        <Button
                                            h="1.5rem"
                                            size="xs"
                                            onClick={() => setShowPassword(!showPassword)}
                                            variant="ghost"
                                        >
                                            <Icon
                                                as={showPassword ? FaEyeSlash : FaEye}
                                                color="brand.textMuted"
                                                boxSize={3}
                                            />
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel fontWeight="600" fontSize="sm" mb={1}>
                                    Confirmar Contraseña
                                </FormLabel>
                                <InputGroup size="md">
                                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                                        <Icon as={FaLock} boxSize={4} />
                                    </InputLeftElement>
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Repite tu contraseña"
                                        bg="brand.bgBody"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        focusBorderColor="brand.primary"
                                        borderRadius="xl"
                                    />
                                    <InputRightElement width="3rem">
                                        <Button
                                            h="1.5rem"
                                            size="xs"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            variant="ghost"
                                        >
                                            <Icon
                                                as={showConfirmPassword ? FaEyeSlash : FaEye}
                                                color="brand.textMuted"
                                                boxSize={3}
                                            />
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <Button
                                w="full"
                                variant="solid"
                                size="lg"
                                type="submit"
                                isLoading={isLoading}
                                loadingText="Actualizando..."
                                borderRadius="xl"
                                fontWeight="700"
                                mt={2}
                            >
                                Actualizar Contraseña
                            </Button>
                        </VStack>
                    </CardBody>
                </Card>
            </Container>
        </Box>
    );
};

export default ResetPasswordPage;
