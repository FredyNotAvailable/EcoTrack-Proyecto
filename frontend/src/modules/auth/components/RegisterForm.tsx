import { useState } from "react";
import {
    VStack,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    Icon,
    Input,
    InputRightElement,
    Button,
    Text,
    useToast,
    Divider,
    HStack,
} from "@chakra-ui/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/auth.service";
import { OAuthButtons } from "./OAuthButtons";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Estados de carga
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const toast = useToast();

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (email && email.trim() !== "") {
                const result = await AuthService.checkEmailExists(email);

                if (result.exists) {
                    const isGoogle = result.provider === 'google';
                    toast({
                        title: isGoogle ? "Cuenta Google vinculada" : "Cuenta ya registrada",
                        description: "Este correo ya está en uso. Por favor, inicia sesión.",
                        status: isGoogle ? "info" : "warning",
                        duration: 5000,
                        isClosable: true,
                        position: "top",
                    });
                    setIsLoading(false);
                    return;
                }
            }
            navigate("/onboarding", { state: { email, password } });
        } catch (error: any) {
            toast({
                title: "Error al registrarse",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            setIsLoading(false);
        }
    };

    return (
        <VStack spacing={4} as="form" onSubmit={handleEmailRegister} animation={`${fadeInUp} 0.5s ease`}>
            <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={1}>Correo Electrónico</FormLabel>
                <InputGroup size="md">
                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                        <Icon as={FaEnvelope} boxSize={4} />
                    </InputLeftElement>
                    <Input
                        type="email"
                        placeholder="ejemplo@gmail.com"
                        bg="brand.bgBody"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        focusBorderColor="brand.primary"
                        borderRadius="xl"
                    />
                </InputGroup>
            </FormControl>

            <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={1}>Contraseña</FormLabel>
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
                    />
                    <InputRightElement width="3rem">
                        <Button h="1.5rem" size="xs" onClick={() => setShowPassword(!showPassword)} variant="ghost">
                            <Icon as={showPassword ? FaEyeSlash : FaEye} color="brand.textMuted" boxSize={3} />
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button
                w="full"
                variant="solid"
                size="md"
                h="44px"
                type="submit"
                isLoading={isLoading}
                borderRadius="xl"
                fontWeight="700"
            >
                Crear Cuenta
            </Button>

            <HStack w="full" spacing={3} my={1}>
                <Divider />
                <Text fontSize="xs" color="brand.textMuted" whiteSpace="nowrap">
                    O continúa con
                </Text>
                <Divider />
            </HStack>

            <OAuthButtons origin="register" />
        </VStack>
    );
};
