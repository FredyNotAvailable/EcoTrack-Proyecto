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
    Checkbox,
    Text,
    Link,
    useToast,
    Divider,
    HStack,
} from "@chakra-ui/react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseSoft = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(53, 122, 98, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(53, 122, 98, 0); }
  100% { box-shadow: 0 0 0 0 rgba(53, 122, 98, 0); }
`;

export const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // DEFERIDO: No creamos la cuenta aquí. Pasamos datos a Onboarding.
            // await signUp({ email, password }); 

            // Navigate to onboarding with credentials
            navigate("/onboarding", { state: { email, password } });
        } catch (error: any) {
            toast({
                title: "Error al registrarse",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <VStack spacing={5} as="form" onSubmit={handleRegister} animation={`${fadeInUp} 0.5s ease`}>
            <FormControl isRequired>
                <FormLabel fontWeight="600">Correo Electrónico</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none" color="brand.textMuted">
                        <Icon as={FaEnvelope} />
                    </InputLeftElement>
                    <Input
                        type="email"
                        placeholder="ejemplo@gmail.com"
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
                        placeholder="Contraseña"
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

            <Checkbox colorScheme="green" defaultChecked isRequired>
                <Text fontSize="sm">
                    Acepto los <Link color="brand.primary" fontWeight="600">Términos y Condiciones</Link>
                </Text>
            </Checkbox>

            <Button
                w="full"
                variant="solid"
                size="lg"
                h="50px"
                type="submit"
                isLoading={isLoading}
                animation={`${pulseSoft} 2s infinite`}
            >
                Crear Cuenta
            </Button>

            <HStack w="full" spacing={4} my={2}>
                <Divider />
                <Text fontSize="sm" color="brand.textMuted" whiteSpace="nowrap">
                    O regístrate con
                </Text>
                <Divider />
            </HStack>

            <Button
                w="full"
                type="button"
                variant="outline"
                size="lg"
                h="50px"
                leftIcon={<Icon as={FaGoogle} />}
                borderColor="gray.200"
                color="gray.600"
                _hover={{ bg: "gray.50", borderColor: "gray.300" }}
                onClick={() => navigate("/onboarding")}
            >
                Continuar con Google
            </Button>
        </VStack>
    );
};
