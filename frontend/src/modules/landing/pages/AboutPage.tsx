import {
    Box,
    Container,
    Heading,
    Text,
    Stack,
    SimpleGrid,
    Icon,
    Flex,
    Image,
    HStack,
} from '@chakra-ui/react';
import { FaLeaf, FaUsers, FaTrophy, FaGlobeAmericas, FaHeart, FaLightbulb } from 'react-icons/fa';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import type { IconType } from 'react-icons';

const AboutPage = () => {
    return (
        <Box width="100%" bg="brand.bgBody" minH="100vh">
            <Navbar />
            
            {/* Hero Section */}
            <Box py={{ base: 12, md: 20 }} bg="brand.bgBody">
                <Container maxW="container.xl">
                    <Stack
                        direction={{ base: 'column', lg: 'row' }}
                        spacing={10}
                        align="center"
                    >
                        <Stack flex={1} spacing={6} textAlign={{ base: 'center', lg: 'left' }}>
                            <Heading
                                fontSize={{ base: '3xl', md: '5xl' }}
                                fontWeight="900"
                                color="brand.secondary"
                                lineHeight="1.2"
                            >
                                Transformando hábitos, <br />
                                <Text as="span" color="brand.primary">
                                    protegiendo el planeta
                                </Text>
                            </Heading>
                            <Text
                                color="brand.textMuted"
                                fontSize="lg"
                                fontWeight="500"
                                maxW="lg"
                                lineHeight="1.8"
                                mx={{ base: 'auto', lg: 0 }}
                            >
                                EcoTrack nació de la convicción de que cada pequeña acción cuenta. 
                                Somos una plataforma que convierte el cuidado del medio ambiente en 
                                una experiencia gratificante y compartida.
                            </Text>
                        </Stack>
                        <Flex flex={1} justify="center">
                            <Box
                                position="relative"
                                w="300px"
                                h="300px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Box
                                    position="absolute"
                                    w="100%"
                                    h="100%"
                                    bg="brand.bgCardLight"
                                    borderRadius="full"
                                    opacity={0.5}
                                />
                                <Image 
                                    src="/logo.png" 
                                    alt="EcoTrack" 
                                    boxSize="150px" 
                                    objectFit="contain"
                                    zIndex={1}
                                />
                            </Box>
                        </Flex>
                    </Stack>
                </Container>
            </Box>

            {/* Mission Section */}
            <Box py={16} bg="white">
                <Container maxW="container.xl">
                    <Stack spacing={12}>
                        <Box textAlign="center" maxW="3xl" mx="auto">
                            <Text
                                color="brand.primary"
                                fontWeight="800"
                                fontSize="sm"
                                letterSpacing="1px"
                                textTransform="uppercase"
                                mb={3}
                            >
                                Nuestra Misión
                            </Text>
                            <Heading fontSize="3xl" fontWeight="900" color="brand.secondary" mb={4}>
                                Hacer del cuidado ambiental un hábito divertido
                            </Heading>
                            <Text color="brand.textMuted" fontSize="lg" fontWeight="500" lineHeight="1.8">
                                Creemos que la gamificación puede transformar la manera en que las personas 
                                interactúan con el medio ambiente. Al convertir acciones sostenibles en retos, 
                                misiones y logros, hacemos que cuidar el planeta sea tan adictivo como un juego.
                            </Text>
                        </Box>

                        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
                            <ValueCard
                                icon={FaLeaf}
                                title="Sostenibilidad"
                                description="Cada funcionalidad está diseñada para promover hábitos que reduzcan nuestra huella de carbono."
                            />
                            <ValueCard
                                icon={FaUsers}
                                title="Comunidad"
                                description="Creemos en el poder de la acción colectiva. Juntos, nuestro impacto se multiplica."
                            />
                            <ValueCard
                                icon={FaLightbulb}
                                title="Educación"
                                description="Informamos y concientizamos sobre el impacto real de nuestras decisiones diarias."
                            />
                        </SimpleGrid>
                    </Stack>
                </Container>
            </Box>

            {/* How We Work Section */}
            <Box py={16} bg="brand.bgBody">
                <Container maxW="container.xl">
                    <Box textAlign="center" maxW="3xl" mx="auto" mb={12}>
                        <Text
                            color="brand.primary"
                            fontWeight="800"
                            fontSize="sm"
                            letterSpacing="1px"
                            textTransform="uppercase"
                            mb={3}
                        >
                            Cómo Funciona
                        </Text>
                        <Heading fontSize="3xl" fontWeight="900" color="brand.secondary">
                            El impacto en números
                        </Heading>
                    </Box>

                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
                        <StatCard icon={FaTrophy} number="52" label="Retos semanales al año" />
                        <StatCard icon={FaLeaf} number="365" label="Misiones diarias" />
                        <StatCard icon={FaGlobeAmericas} number="∞" label="Kg de CO₂ por ahorrar" />
                        <StatCard icon={FaHeart} number="1" label="Planeta por proteger" />
                    </SimpleGrid>
                </Container>
            </Box>

            {/* Vision Section */}
            <Box py={16} bg="white">
                <Container maxW="container.md">
                    <Box
                        bg="brand.bgCardLight"
                        p={{ base: 8, md: 12 }}
                        borderRadius="3xl"
                        textAlign="center"
                    >
                        <Text
                            color="brand.primary"
                            fontWeight="800"
                            fontSize="sm"
                            letterSpacing="1px"
                            textTransform="uppercase"
                            mb={3}
                        >
                            Nuestra Visión
                        </Text>
                        <Heading fontSize="2xl" fontWeight="900" color="brand.secondary" mb={4}>
                            Un futuro donde cada acción cuenta
                        </Heading>
                        <Text color="brand.textMuted" fontSize="md" fontWeight="500" lineHeight="1.8">
                            Imaginamos un mundo donde millones de personas utilizan EcoTrack para 
                            monitorear y mejorar su impacto ambiental. Donde la sostenibilidad no es 
                            una carga, sino una parte natural y gratificante de la vida diaria. 
                            Donde la comunidad global trabaja junta para preservar nuestro planeta 
                            para las generaciones futuras.
                        </Text>
                    </Box>
                </Container>
            </Box>

            {/* Team/Project Section */}
            <Box py={16} bg="brand.bgBody">
                <Container maxW="container.xl">
                    <Box textAlign="center" maxW="3xl" mx="auto">
                        <Text
                            color="brand.primary"
                            fontWeight="800"
                            fontSize="sm"
                            letterSpacing="1px"
                            textTransform="uppercase"
                            mb={3}
                        >
                            El Proyecto
                        </Text>
                        <Heading fontSize="3xl" fontWeight="900" color="brand.secondary" mb={4}>
                            Desarrollado con propósito
                        </Heading>
                        <Text color="brand.textMuted" fontSize="lg" fontWeight="500" lineHeight="1.8" mb={8}>
                            EcoTrack es un proyecto universitario desarrollado como parte del curso de 
                            Ecología y Medio Ambiente Tecnológico. Combina tecnología moderna con 
                            conciencia ambiental para crear una herramienta que inspire cambios positivos.
                        </Text>
                        <HStack justify="center" spacing={4} flexWrap="wrap">
                            <TechBadge>React</TechBadge>
                            <TechBadge>TypeScript</TechBadge>
                            <TechBadge>Node.js</TechBadge>
                            <TechBadge>Supabase</TechBadge>
                            <TechBadge>Chakra UI</TechBadge>
                        </HStack>
                    </Box>
                </Container>
            </Box>

            <Footer />
        </Box>
    );
};

const ValueCard = ({ icon, title, description }: { icon: IconType; title: string; description: string }) => (
    <Stack
        bg="brand.bgCardLight"
        p={8}
        borderRadius="2xl"
        align="center"
        textAlign="center"
        spacing={4}
    >
        <Flex
            w={14}
            h={14}
            align="center"
            justify="center"
            bg="white"
            borderRadius="xl"
            boxShadow="sm"
        >
            <Icon as={icon} boxSize={6} color="brand.primary" />
        </Flex>
        <Heading as="h3" fontSize="lg" fontWeight="800" color="brand.secondary">
            {title}
        </Heading>
        <Text color="brand.textMuted" fontSize="sm" fontWeight="500" lineHeight="1.7">
            {description}
        </Text>
    </Stack>
);

const StatCard = ({ icon, number, label }: { icon: IconType; number: string; label: string }) => (
    <Stack
        bg="white"
        p={6}
        borderRadius="2xl"
        align="center"
        textAlign="center"
        boxShadow="0 4px 20px -5px rgba(31, 64, 55, 0.08)"
        border="1px solid rgba(0,0,0,0.03)"
    >
        <Icon as={icon} boxSize={8} color="brand.primary" mb={2} />
        <Text fontSize="3xl" fontWeight="900" color="brand.secondary">
            {number}
        </Text>
        <Text color="brand.textMuted" fontSize="sm" fontWeight="600">
            {label}
        </Text>
    </Stack>
);

const TechBadge = ({ children }: { children: React.ReactNode }) => (
    <Box
        bg="white"
        color="brand.secondary"
        px={4}
        py={2}
        borderRadius="full"
        fontSize="sm"
        fontWeight="700"
        boxShadow="sm"
    >
        {children}
    </Box>
);

export default AboutPage;
