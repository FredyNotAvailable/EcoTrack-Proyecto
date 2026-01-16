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
} from "@chakra-ui/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { OAuthButtons } from "./OAuthButtons";
import { getAuthErrorMessage } from "../utils/authErrors";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseSoft = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(53, 122, 98, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(53, 122, 98, 0); }
  100% { box-shadow: 0 0 0 0 rgba(53, 122, 98, 0); }
`;

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();

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
        <VStack spacing={5} as="form" onSubmit={handleLogin} animation={`${fadeInUp} 0.5s ease`}>
            <FormControl isRequired>
                <FormLabel fontWeight="600">Correo Electrónico</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                        <Icon as={FaEnvelope} />
                    </InputLeftElement>
                    <Input
                        type="email"
                        placeholder="ejemplo@email.com"
                        bg="brand.bgBody"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        focusBorderColor="brand.primary"
                    />
                </InputGroup>
            </FormControl>

            <FormControl isRequired>
                <FormLabel fontWeight="600">Contraseña</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                        <Icon as={FaLock} />
                    </InputLeftElement>
                    <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        bg="brand.bgBody"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        focusBorderColor="brand.primary"
                    />
                    <InputRightElement width="4.5rem">
                        <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)} variant="ghost">
                            <Icon as={showPassword ? FaEyeSlash : FaEye} color="brand.textMuted" />
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Flex justify="flex-end" w="full">
                <Link color="brand.primary" fontSize="sm" fontWeight="600">
                    ¿Olvidaste tu contraseña?
                </Link>
            </Flex>

            <Button
                w="full"
                variant="solid"
                size="lg"
                h="50px"
                type="submit"
                isLoading={isLoading}
                animation={`${pulseSoft} 2s infinite`}
            >
                Entrar
            </Button>

            <HStack w="full" spacing={4} my={2}>
                <Divider />
                <Text fontSize="sm" color="brand.textMuted" whiteSpace="nowrap">
                    O continúa con
                </Text>
                <Divider />
            </HStack>

            <OAuthButtons />
        </VStack>
    );
};
