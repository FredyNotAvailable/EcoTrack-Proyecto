import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Card,
    Button,
    Icon,
    Flex,
    Badge,
    VStack,
    HStack,
    useToast,
    Spinner,
    useColorModeValue,
    Divider,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
    FaLeaf,
    FaBiking,
    FaTint,
    FaUtensils,
    FaRecycle,
    FaFire,
    FaCheckCircle,
} from "react-icons/fa";
import { keyframes } from "@emotion/react";
import type { Reto } from "./services/retos.service";
import { RetosAPIService } from "./services/retos.service";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const categoryIcons: Record<string, any> = {
    'Reciclaje': FaRecycle,
    'Transporte': FaBiking,
    'Agua': FaTint,
    'Alimentación': FaUtensils,
};

const categoryColors: Record<string, string> = {
    'Reciclaje': 'green.400',
    'Transporte': 'blue.400',
    'Agua': 'cyan.400',
    'Alimentación': 'orange.400',
};

const RetosPage = () => {
    const [retos, setRetos] = useState<Reto[]>([]);
    const [myChallenges, setMyChallenges] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const toast = useToast();
    const cardBg = useColorModeValue("white", "gray.800");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [allRetos, myRetos] = await Promise.all([
                RetosAPIService.getAll(),
                RetosAPIService.getMyChallenges(),
            ]);
            setRetos(allRetos);
            setMyChallenges(myRetos);
        } catch (error) {
            console.error("Error loading retos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoin = async (retoId: string) => {
        setJoiningId(retoId);
        try {
            await RetosAPIService.join(retoId);
            toast({
                title: "¡Inscrito con éxito!",
                description: "El reto se ha añadido a tu lista personal.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            await loadData();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setJoiningId(null);
        }
    };

    const isParticipating = (retoId: string) => {
        return myChallenges.some(pc => pc.reto_id === retoId);
    };

    if (isLoading) {
        return (
            <Flex h="60vh" align="center" justify="center">
                <Spinner size="xl" color="brand.primary" thickness="4px" />
            </Flex>
        );
    }

    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            <VStack align="start" spacing={2} mb={10}>
                <Heading size="xl" color="brand.secondary">Retos Ambientales</Heading>
                <Text color="brand.textMuted" fontSize="lg">
                    Supera desafíos y suma puntos por el planeta. 🌿
                </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
                {retos.map((reto) => {
                    const participating = isParticipating(reto.id);
                    const icon = categoryIcons[reto.categoria] || FaLeaf;
                    const color = categoryColors[reto.categoria] || "brand.primary";

                    return (
                        <Card
                            key={reto.id}
                            borderRadius="24px"
                            p={6}
                            boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                            border="1px solid"
                            borderColor="gray.100"
                            transition="all 0.3s"
                            _hover={{ transform: "translateY(-8px)", boxShadow: "2xl" }}
                            bg={cardBg}
                        >
                            <Flex justify="space-between" align="start" mb={4}>
                                <Flex
                                    p={3}
                                    bg={`${color}15`}
                                    borderRadius="16px"
                                    color={color}
                                >
                                    <Icon as={icon} fontSize="2xl" />
                                </Flex>
                                <Badge
                                    borderRadius="full"
                                    px={3}
                                    py={1}
                                    colorScheme={
                                        reto.nivel_dificultad === 'Fácil' ? 'green' :
                                            reto.nivel_dificultad === 'Intermedio' ? 'orange' : 'red'
                                    }
                                >
                                    {reto.nivel_dificultad}
                                </Badge>
                            </Flex>

                            <VStack align="start" spacing={3} mb={6}>
                                <Heading size="md" color="brand.secondary">{reto.titulo}</Heading>
                                <Text color="brand.textMuted" fontSize="sm" noOfLines={3}>
                                    {reto.descripcion}
                                </Text>
                            </VStack>

                            <Divider mb={5} />

                            <Flex justify="space-between" align="center">
                                <HStack color="brand.primary">
                                    <Icon as={FaFire} />
                                    <Text fontWeight="bold">{reto.puntos_recompensa} pts</Text>
                                </HStack>

                                {participating ? (
                                    <Badge
                                        bg="green.50"
                                        color="green.500"
                                        px={3}
                                        py={2}
                                        borderRadius="12px"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <Icon as={FaCheckCircle} /> En progreso
                                    </Badge>
                                ) : (
                                    <Button
                                        size="sm"
                                        bg="brand.primary"
                                        color="white"
                                        borderRadius="12px"
                                        _hover={{ bg: "brand.primaryHover" }}
                                        onClick={() => handleJoin(reto.id)}
                                        isLoading={joiningId === reto.id}
                                    >
                                        Unirme
                                    </Button>
                                )}
                            </Flex>
                        </Card>
                    );
                })}
            </SimpleGrid>
        </Box>
    );
};

export default RetosPage;
