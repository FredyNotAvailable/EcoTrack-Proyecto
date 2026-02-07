import {
    Box,
    Button,
    Grid,
    Heading,
    Text,
    Flex,
    HStack,
    Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { keyframes } from "@emotion/react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

// Animations
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
`;

export const AuthForm = () => {
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') !== 'register';
    const [isLogin, setIsLogin] = useState(initialMode);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLogin(searchParams.get('mode') !== 'register');
    }, [searchParams]);

    const toggleForm = (toLogin: boolean) => {
        setIsLogin(toLogin);
    };

    return (
        <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={{ base: 6, lg: 10 }}
            alignItems="center"
            w="100%"
            maxW="1000px"
            mx="auto"
        >
            {/* --- Left Column: Form --- */}
            <Box
                bg="white"
                p={{ base: 6, md: 8 }}
                borderRadius="32px"
                boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
                border="1px solid rgba(0, 0, 0, 0.05)"
                animation={`${fadeInUp} 0.8s ease-out`}
                h={{ base: "auto", lg: "580px" }}
                display="flex"
                flexDirection="column"
            >
                {/* Logo Section */}
                <HStack
                    spacing={2}
                    mb={4}
                    justify="center"
                    cursor="pointer"
                    onClick={() => navigate("/")}
                    _hover={{ transform: "scale(1.02)" }}
                    transition="all 0.2s"
                >
                    <Image 
                        src="/logo.png" 
                        alt="EcoTrack Logo" 
                        boxSize="36px"
                        objectFit="contain"
                    />
                    <Heading
                        as="span"
                        fontSize="1.4rem"
                        fontWeight="900"
                        bgGradient="linear(to-r, brand.primary, brand.accent)"
                        bgClip="text"
                        letterSpacing="-0.5px"
                    >
                        EcoTrack
                    </Heading>
                </HStack>

                <Box textAlign="center" mb={5}>
                    <Heading as="h2" size="lg" color="brand.secondary" mb={1}>
                        {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
                    </Heading>
                    <Text color="brand.textMuted" fontSize="sm">
                        {isLogin
                            ? "Continúa tu viaje sostenible."
                            : "Empieza tu viaje sostenible hoy."}
                    </Text>
                </Box>

                {/* Toggle */}
                <Flex
                    bg="brand.bgCardLight"
                    p={1}
                    borderRadius="full"
                    mb={5}
                    justify="space-between"
                >
                    <Button
                        flex={1}
                        borderRadius="full"
                        variant="ghost"
                        size="sm"
                        bg={isLogin ? "white" : "transparent"}
                        color={isLogin ? "brand.primary" : "brand.textMuted"}
                        boxShadow={isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none"}
                        onClick={() => toggleForm(true)}
                        _hover={{ bg: isLogin ? "white" : "blackAlpha.50" }}
                        fontWeight="600"
                    >
                        Iniciar Sesión
                    </Button>
                    <Button
                        flex={1}
                        borderRadius="full"
                        variant="ghost"
                        size="sm"
                        bg={!isLogin ? "white" : "transparent"}
                        color={!isLogin ? "brand.primary" : "brand.textMuted"}
                        boxShadow={!isLogin ? "0 2px 8px rgba(0,0,0,0.1)" : "none"}
                        onClick={() => toggleForm(false)}
                        _hover={{ bg: !isLogin ? "white" : "blackAlpha.50" }}
                        fontWeight="600"
                    >
                        Registrarse
                    </Button>
                </Flex>

                {/* Forms Container - Fixed height */}
                <Box flex={1} key={isLogin ? 'login' : 'register'} animation={`${slideIn} 0.3s ease-out`}>
                    {isLogin ? <LoginForm /> : <RegisterForm />}
                </Box>
            </Box>

            {/* --- Right Column: Visual Side --- */}
            <Box
                display={{ base: "none", lg: "flex" }}
                position="relative"
                h="580px"
                bgImage="url('/auth_photo.jpg')"
                bgSize="cover"
                bgPosition="center"
                borderRadius="32px"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                border="1px solid rgba(0, 0, 0, 0.05)"
                overflow="hidden"
            >
                {/* Overlay */}
                <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bg="blackAlpha.300"
                    zIndex={1}
                />

                {/* Content Box */}
                <Box
                    position="relative"
                    zIndex={2}
                    p={6}
                    bg="rgba(255, 255, 255, 0.9)"
                    backdropFilter="blur(12px)"
                    borderRadius="24px"
                    mx={8}
                    boxShadow="0 20px 40px rgba(0,0,0,0.15)"
                    border="1px solid white"
                    maxW="85%"
                >
                    <Heading as="h3" size="md" color="brand.secondary" mb={3} fontWeight="900" letterSpacing="-0.5px">
                        Tu impacto comienza aquí
                    </Heading>
                    <Text color="gray.600" fontSize="sm" fontWeight="500" lineHeight="1.6">
                        Únete a personas comprometidas con transformar el mundo, un pequeño hábito a la vez.
                    </Text>
                </Box>
            </Box>
        </Grid>
    );
};
