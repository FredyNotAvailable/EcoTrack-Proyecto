import {
    Box,
    Button,
    Grid,
    Heading,
    Text,
    Icon,
    Badge,
    Flex,
    Card,
    Container,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaEnvira,
    FaGlobeAmericas,
    FaTrophy,
    FaUsers,
    FaChartPie,
} from "react-icons/fa";
import { keyframes } from "@emotion/react";

// Floating animation
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <Box width="100%" animation={`${fadeInUp} 0.8s ease-out`} bg="brand.bgBody">

            {/* --- Hero Section --- */}
            <Box width="100%" pt={{ base: 10, md: 20 }} pb={20}>
                <Container maxW="container.xl">
                    <Grid
                        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                        gap={10}
                        alignItems="center"
                    >
                        {/* Left Content */}
                        <Box textAlign={{ base: "center", md: "left" }}>
                            <Badge
                                bg="#e3f2fd"
                                color="brand.primary"
                                px={4}
                                py={1}
                                borderRadius="full"
                                fontSize="0.85rem"
                                fontWeight="700"
                                textTransform="uppercase"
                                letterSpacing="0.5px"
                                mb={4}
                                display="inline-block"
                            >
                                Actúa Hoy Por El Mañana
                            </Badge>

                            <Heading
                                as="h1"
                                fontSize={{ base: "2.5rem", md: "3.5rem" }}
                                lineHeight="1.2"
                                mb={5}
                                color="brand.secondary"
                                letterSpacing="-0.02em"
                            >
                                Tu impacto cuenta: <br />
                                <Text
                                    as="span"
                                    bgGradient="linear(to-r, brand.primary, brand.accent)"
                                    bgClip="text"
                                >
                                    Transforma tus hábitos
                                </Text>
                            </Heading>

                            <Text
                                fontSize="1.1rem"
                                color="brand.textMuted"
                                mb={8}
                                maxW={{ base: "100%", md: "90%" }}
                            >
                                EcoTrack es la plataforma que te ayuda a registrar, medir y mejorar
                                tu impacto ambiental a través de retos gamificados y una comunidad
                                activa.
                            </Text>

                            <Button
                                variant="solid"
                                size="lg"
                                px={8}
                                h="54px"
                                fontSize="1.1rem"
                                rightIcon={<Icon as={FaArrowRight} />}
                                onClick={() => navigate("/login")}
                            >
                                Comienza ahora
                            </Button>
                        </Box>

                        {/* Right Image Placeholder */}
                        <Flex
                            justify="center"
                            position="relative"
                            mt={{ base: 12, md: 0 }}
                        >
                            <Box
                                position="relative"
                                h="300px"
                                w="100%"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon
                                    as={FaEnvira}
                                    position="absolute"
                                    fontSize="12rem"
                                    color="#e8f5e9"
                                    zIndex={0}
                                />

                                <Box
                                    zIndex={2}
                                    animation={`${float} 3s ease-in-out infinite`}
                                    color="brand.primary"
                                >
                                    <Icon as={FaGlobeAmericas} fontSize="6rem" />
                                </Box>

                                <Box
                                    position="absolute"
                                    top="20%"
                                    right="10%"
                                    bg="white"
                                    px={5}
                                    py={2}
                                    borderRadius="20px"
                                    boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
                                    animation={`${float} 4s ease-in-out infinite`}
                                    zIndex={3}
                                >
                                    <Text fontWeight="800" bgGradient="linear(to-r, brand.primary, brand.accent)" bgClip="text">
                                        -120kg CO₂
                                    </Text>
                                </Box>

                                <Box
                                    position="absolute"
                                    bottom="20%"
                                    left="10%"
                                    bg="white"
                                    px={5}
                                    py={2}
                                    borderRadius="20px"
                                    boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
                                    animation={`${float} 3.5s ease-in-out infinite`}
                                    zIndex={3}
                                >
                                    <Text fontWeight="bold" fontSize="0.9rem">
                                        🌟 <Box as="span">Nivel 5</Box>
                                    </Text>
                                </Box>
                            </Box>
                        </Flex>
                    </Grid>
                </Container>
            </Box>

            {/* --- Features Section --- */}
            <Box width="100%" bg="white" py={20}>
                <Container maxW="container.xl">
                    <Box textAlign="center" mb={10}>
                        <Heading as="h2" size="xl" mb={4} color="brand.textMain">
                            ¿Por qué EcoTrack?
                        </Heading>
                        <Text color="brand.textMuted" maxW="2xl" mx="auto">
                            Descubre las herramientas que te ayudarán a ser más sostenible y consciente de tu huella en el mundo.
                        </Text>
                    </Box>

                    <Grid
                        templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                        gap={8}
                    >
                        <FeatureCard
                            icon={FaTrophy}
                            iconColor="brand.primary"
                            title="Retos Gamificados"
                            text="Convierte la sostenibilidad en un juego. Gana puntos, sube de nivel y desbloquea insignias."
                        />
                        <FeatureCard
                            icon={FaUsers}
                            iconColor="#00b894"
                            title="Comunidad Activa"
                            text="Comparte tus logros, inspira a otros y participa en eventos globales con miles de usuarios."
                        />
                        <FeatureCard
                            icon={FaChartPie}
                            iconColor="#6c5ce7"
                            title="Mide tu Impacto"
                            text="Visualiza cuánto CO₂ has ahorrado y cómo tus acciones ayudan al planeta en tiempo real."
                        />
                    </Grid>
                </Container>
            </Box>

            {/* --- Call to Action --- */}
            <Box width="100%" py={20}>
                <Container maxW="container.xl">
                    <Box
                        bgGradient="linear(135deg, brand.primary 0%, brand.secondary 100%)"
                        borderRadius="24px"
                        p={{ base: 8, md: 12 }}
                        textAlign="center"
                        color="white"
                    >
                        <Heading as="h2" size="xl" mb={4}>
                            Únete a la Revolución Verde
                        </Heading>
                        <Text
                            opacity={0.9}
                            maxW="600px"
                            mx="auto"
                            mb={8}
                            fontSize="1.1rem"
                        >
                            No necesitas cambiar todo tu estilo de vida de un día para otro.
                            Empieza con pequeños pasos hoy.
                        </Text>
                        <Button
                            bg="white"
                            color="brand.primary"
                            variant="solid"
                            size="lg"
                            h="54px"
                            px={10}
                            fontSize="1.1rem"
                            _hover={{ transform: "translateY(-2px)", boxShadow: "xl", bg: "white", color: "brand.primaryHover" }}
                            onClick={() => navigate("/onboarding")}
                        >
                            Crear Cuenta Gratis
                        </Button>
                    </Box>
                </Container>
            </Box>

        </Box>
    );
};

interface FeatureCardProps {
    icon: any;
    iconColor: string;
    title: string;
    text: string;
}

const FeatureCard = ({
    icon,
    iconColor,
    title,
    text,
}: FeatureCardProps) => {
    return (
        <Card
            bg="white"
            p={8}
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.15)"
            border="1px solid rgba(0,0,0,0.05)"
            textAlign="center"
            _hover={{ transform: "translateY(-5px)", boxShadow: "0 20px 40px -10px rgba(31, 64, 55, 0.25)" }}
            transition="all 0.3s"
        >
            <Flex justify="center" mb={5}>
                <Icon as={icon} fontSize="2.5rem" color={iconColor} />
            </Flex>
            <Heading as="h3" size="md" mb={4}>
                {title}
            </Heading>
            <Text color="brand.textMuted">{text}</Text>
        </Card>
    );
};

export default LandingPage;
