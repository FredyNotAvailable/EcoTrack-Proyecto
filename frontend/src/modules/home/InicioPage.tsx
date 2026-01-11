import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Card,
    VStack,
    HStack,
    Icon,
    Flex,
    Button,
} from "@chakra-ui/react";
import { FaLeaf, FaArrowRight, FaChartLine } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const InicioPage = () => {
    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            <VStack align="start" spacing={2} mb={10}>
                <Heading size="xl" color="brand.secondary">¡Hola de nuevo! 👋</Heading>
                <Text color="brand.textMuted" fontSize="lg">
                    Hoy es un gran día para seguir salvando el planeta.
                </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} mb={10}>
                <Card p={8} borderRadius="30px" bgGradient="linear(to-br, brand.primary, #45b08c)" color="white">
                    <VStack align="start" spacing={4}>
                        <Icon as={FaLeaf} fontSize="4xl" />
                        <Heading size="lg">Progreso Semanal</Heading>
                        <Text opacity={0.9}>Has ahorrado un 15% más de CO₂ que la semana pasada. ¡Increíble!</Text>
                        <Button bg="white" color="brand.primary" _hover={{ bg: "gray.100" }} borderRadius="12px">
                            Ver estadísticas
                        </Button>
                    </VStack>
                </Card>

                <Card p={8} borderRadius="30px" bg="white" border="1px solid" borderColor="gray.100" boxShadow="lg">
                    <VStack align="start" spacing={4}>
                        <Icon as={FaChartLine} fontSize="4xl" color="brand.accentPurple" />
                        <Heading size="lg" color="brand.secondary">Tu Impacto</Heading>
                        <Text color="brand.textMuted">Equivale a haber plantado 4 árboles este mes.</Text>
                        <Button variant="outline" borderColor="brand.accentPurple" color="brand.accentPurple" borderRadius="12px">
                            Compartir logro
                        </Button>
                    </VStack>
                </Card>
            </SimpleGrid>

            <Heading size="md" mb={6} color="brand.secondary">Actividad sugerida</Heading>
            <Card p={6} borderRadius="24px" border="1px dashed" borderColor="gray.300" bg="gray.50" _hover={{ borderColor: "brand.primary", bg: "white", transform: "scale(1.02)" }} transition="all 0.2s" cursor="pointer">
                <HStack justify="space-between">
                    <HStack spacing={4}>
                        <Flex p={3} bg="white" borderRadius="12px" boxShadow="sm">
                            <Icon as={FaLeaf} color="brand.primary" />
                        </Flex>
                        <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">Nuevo reto disponible: Ducha de 5 minutos</Text>
                            <Text fontSize="sm" color="brand.textMuted">Gana 100 puntos extra hoy.</Text>
                        </VStack>
                    </HStack>
                    <Icon as={FaArrowRight} />
                </HStack>
            </Card>
        </Box>
    );
};

export default InicioPage;
