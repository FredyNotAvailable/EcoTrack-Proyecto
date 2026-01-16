import {
    Box,
    Button,
    Grid,
    Heading,
    Text,
    Flex,
    Icon,
    HStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { FaEnvira } from "react-icons/fa";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const toggleForm = (toLogin: boolean) => {
        setIsLogin(toLogin);
    };

    return (
        <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={10}
            alignItems="stretch"
            minH="70vh"
            w="100%"
        >
            {/* --- Left Column: Form --- */}
            <Box
                bg="white"
                p={{ base: 6, md: 10 }}
                borderRadius="32px"
                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
                border="1px solid rgba(0, 0, 0, 0.05)"
                animation={`${fadeInUp} 0.8s ease-out`}
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                {/* Logo Section */}
                <HStack
                    spacing={2}
                    mb={6}
                    justify="center"
                    cursor="pointer"
                    onClick={() => navigate("/")}
                    _hover={{ transform: "scale(1.02)" }}
                    transition="all 0.2s"
                >
                    <Icon as={FaEnvira} color="brand.primary" boxSize={6} />
                    <Heading
                        as="span"
                        fontSize="1.5rem"
                        fontWeight="900"
                        bgGradient="linear(to-r, brand.primary, brand.accent)"
                        bgClip="text"
                        letterSpacing="-0.5px"
                    >
                        EcoTrack
                    </Heading>
                </HStack>

                <Box textAlign="center" mb={8}>
                    <Heading as="h2" size="xl" color="brand.secondary" mb={2}>
                        {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </Heading>
                    <Text color="brand.textMuted">
                        {isLogin
                            ? "Únete a la comunidad que transforma el planeta."
                            : "Empieza tu viaje sostenible hoy mismo."}
                    </Text>
                </Box>

                {/* Toggle */}
                <Flex
                    bg="brand.bgCardLight"
                    p={1}
                    borderRadius="full"
                    mb={8}
                    justify="space-between"
                >
                    <Button
                        flex={1}
                        borderRadius="full"
                        variant="ghost"
                        bg={isLogin ? "white" : "transparent"}
                        color={isLogin ? "brand.primary" : "brand.textMuted"}
                        boxShadow={isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none"}
                        onClick={() => toggleForm(true)}
                        _hover={{ bg: isLogin ? "white" : "blackAlpha.50" }}
                    >
                        Iniciar Sesión
                    </Button>
                    <Button
                        flex={1}
                        borderRadius="full"
                        variant="ghost"
                        bg={!isLogin ? "white" : "transparent"}
                        color={!isLogin ? "brand.primary" : "brand.textMuted"}
                        boxShadow={!isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none"}
                        onClick={() => toggleForm(false)}
                        _hover={{ bg: !isLogin ? "white" : "blackAlpha.50" }}
                    >
                        Registrarse
                    </Button>
                </Flex>

                {/* Forms Container */}
                <Box>
                    {isLogin ? (
                        <LoginForm />
                    ) : (
                        <RegisterForm />
                    )}
                </Box>
            </Box>

            {/* --- Right Column: Visual Side --- */}
            <Box
                display={{ base: "none", md: "flex" }}
                position="relative"
                minH={{ md: "500px" }}
                bgImage="url('/auth_photo.jpg')"
                bgSize="cover"
                bgPosition="center"
                borderRadius="32px"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                border="1px solid rgba(0, 0, 0, 0.05)"
                overflow="hidden"
                boxShadow="inner"
            >
                {/* Overlay with glassmorphism */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="blackAlpha.200"
                    zIndex={1}
                />

                {/* Content Box */}
                <Box
                    position="relative"
                    zIndex={2}
                    p={8}
                    bg="rgba(255, 255, 255, 0.85)"
                    backdropFilter="blur(12px)"
                    borderRadius="28px"
                    m={10}
                    boxShadow="0 20px 40px rgba(0,0,0,0.1)"
                    border="1px solid white"
                    maxW="80%"
                >
                    <Heading as="h3" size="lg" color="brand.secondary" mb={4} fontWeight="900" letterSpacing="-0.5px">
                        Tu impacto comienza aquí
                    </Heading>
                    <Text color="gray.600" fontSize="md" fontWeight="500" lineHeight="1.6">
                        Únete a personas comprometidas con transformar el mundo, un pequeño hábito a la vez. Tu camino hacia la sostenibilidad sigue aquí.
                    </Text>
                </Box>
            </Box>
        </Grid>
    );
};
