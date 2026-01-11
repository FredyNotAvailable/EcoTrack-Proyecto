import {
    Box,
    Button,
    Grid,
    Heading,
    Text,
    Icon,
    Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import {
    FaLeaf,
    FaTint,
    FaSun,
} from "react-icons/fa";
import { keyframes } from "@emotion/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

export const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = (toLogin: boolean) => {
        setIsLogin(toLogin);
    };

    return (
        <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr" }}
            gap={10}
            alignItems="center"
            minH="80vh"
            w="100%"
        >
            {/* --- Left Column: Form --- */}
            <Box
                bg="white"
                p={{ base: 6, md: 10 }}
                borderRadius="24px"
                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
                border="1px solid rgba(0, 0, 0, 0.05)"
                animation={`${fadeInUp} 0.8s ease-out`}
            >
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
                h={{ md: "600px", lg: "700px" }}
                bgGradient="linear(135deg, brand.bgCardLight 0%, #e8f5e9 100%)"
                borderRadius="24px"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                border="1px solid rgba(0, 0, 0, 0.05)"
                overflow="hidden"
            >
                {/* Floating Icons */}
                <Icon
                    as={FaLeaf}
                    position="absolute"
                    top="10%"
                    right="10%"
                    fontSize="6rem"
                    color="rgba(53, 122, 98, 0.1)"
                    animation={`${float} 6s ease-in-out infinite`}
                />
                <Icon
                    as={FaTint}
                    position="absolute"
                    bottom="15%"
                    left="10%"
                    fontSize="4rem"
                    color="rgba(53, 122, 98, 0.1)"
                    animation={`${float} 6s ease-in-out infinite 2s`}
                />
                <Icon
                    as={FaSun}
                    position="absolute"
                    top="20%"
                    left="20%"
                    fontSize="3rem"
                    color="rgba(53, 122, 98, 0.1)"
                    animation={`${float} 6s ease-in-out infinite 4s`}
                />

                {/* Content Box */}
                <Box
                    position="relative"
                    zIndex={2}
                    p={10}
                    bg="rgba(255, 255, 255, 0.8)"
                    backdropFilter="blur(10px)"
                    borderRadius="16px"
                    m={10}
                    boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                >
                    <Heading as="h3" size="lg" color="brand.secondary" mb={4}>
                        Tu impacto comienza aquí
                    </Heading>
                    <Text color="brand.textMuted">
                        Únete a más de 10,000 usuarios que ya están cambiando el mundo, un
                        hábito a la vez.
                    </Text>
                </Box>
            </Box>
        </Grid>
    );
};
