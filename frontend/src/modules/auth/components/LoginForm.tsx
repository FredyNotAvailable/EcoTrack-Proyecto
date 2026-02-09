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
    Flex,
    Link,
    Text,
    useToast,
    Divider,
    HStack,
    useDisclosure,
} from "@chakra-ui/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { OAuthButtons } from "./OAuthButtons";
import { getAuthErrorMessage } from "../utils/authErrors";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const { isOpen: isForgotOpen, onOpen: onForgotOpen, onClose: onForgotClose } = useDisclosure();

    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signIn({ email, password });

            toast({
                title: "¡Bienvenido!",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "top",
            });
            navigate("/app/inicio");
        } catch (error: any) {
            toast({
                title: "Error al iniciar sesión",
                description: getAuthErrorMessage(error),
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack spacing={4} as="form" onSubmit={handleLogin} animation={`${fadeInUp} 0.5s ease`}>
            <FormControl isRequired>
                <FormLabel fontWeight="600" fontSize="sm" mb={1}>Correo Electrónico</FormLabel>
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
                        placeholder="••••••••"
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

            <Flex justify="flex-end" w="full" mt={-1}>
                <Link
                    color="brand.primary"
                    fontSize="xs"
                    fontWeight="600"
                    onClick={onForgotOpen}
                    cursor="pointer"
                    _hover={{ textDecoration: "underline" }}
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </Flex>

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
                Entrar
            </Button>

            <HStack w="full" spacing={3} my={1}>
                <Divider />
                <Text fontSize="xs" color="brand.textMuted" whiteSpace="nowrap">
                    O continúa con
                </Text>
                <Divider />
            </HStack>

            <OAuthButtons origin="login" />

            <ForgotPasswordModal
                isOpen={isForgotOpen}
                onClose={onForgotClose}
                initialEmail={email}
            />
        </VStack>
    );
};
