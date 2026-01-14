import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Avatar,
    Card,
    Icon,
    Flex,
    Badge,
    Spinner,
    Center,
    Container
} from "@chakra-ui/react";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { useState } from "react";
import { keyframes } from "@emotion/react";
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../services/userStatsService";
import { useAuth } from "../auth/AuthContext";
// import { useNavigate } from "react-router-dom";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const RankingPage = () => {
    const { user: currentUser } = useAuth();
    // const navigate = useNavigate();
    const [period, setPeriod] = useState<'global' | 'day' | 'week' | 'month'>('global');

    const { data: ranking, isLoading } = useQuery({
        queryKey: ['leaderboard', period],
        queryFn: () => userStatsService.getLeaderboard(period)
    });

    const FilterButton = ({ value, label }: { value: typeof period, label: string }) => {
        const isActive = period === value;
        return (
            <Box
                as="button"
                onClick={() => setPeriod(value)}
                px={4}
                py={1}
                borderRadius="full"
                fontWeight="bold"
                fontSize="sm"
                transition="all 0.2s"
                bg={isActive ? "brand.primary" : "transparent"}
                color={isActive ? "white" : "gray.500"}
                _hover={{
                    bg: isActive ? "brand.primary" : "gray.100"
                }}
            >
                {label}
            </Box>
        );
    };

    if (isLoading) {
        return (
            <Center minH="50vh">
                <Spinner size="xl" color="brand.primary" />
            </Center>
        );
    }

    return (
        <Container maxW="container.md" centerContent>
            <Box w="100%" animation={`${fadeInUp} 0.6s ease-out`} pb={10}>

                {/* Header & Title */}
                <VStack align="center" spacing={2} mb={6} textAlign="center">
                    <HStack spacing={4} justify="center">
                        <Icon as={FaTrophy} color="gold" fontSize="4xl" />
                        <Heading size="xl" color="brand.secondary">Ranking Global</Heading>
                    </HStack>
                    <Text color="brand.textMuted" fontSize="lg">
                        Los guerreros más comprometidos con el planeta. 🏆
                    </Text>
                </VStack>

                {/* Filter Tabs */}
                <Flex
                    justify="center"
                    mb={8}
                    bg="white"
                    p={1}
                    borderRadius="full"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.100"
                    gap={1}
                >
                    <FilterButton value="global" label="Global" />
                    <FilterButton value="day" label="Día" />
                    <FilterButton value="week" label="Semana" />
                    <FilterButton value="month" label="Mes" />
                </Flex>

                <VStack spacing={4} align="stretch" w="100%">
                    {ranking?.map((user, index) => {
                        const isMe = user.user_id === currentUser?.id;
                        const rank = index + 1;
                        const username = user.user?.username || 'Usuario';
                        // Default logic if score is missing
                        const score = user.puntos_totales || 0;
                        const formattedScore = score.toLocaleString();
                        // Level might be undefined for time-periods, so fallback safely
                        const level = user.nivel || Math.floor(score / 1000) + 1;

                        let rankColor = "gray.400";
                        if (rank === 1) rankColor = "gold";
                        if (rank === 2) rankColor = "silver";
                        if (rank === 3) rankColor = "#cd7f32";

                        return (
                            <Card
                                key={user.user_id}
                                p={5}
                                borderRadius="20px"
                                boxShadow={isMe ? "0 10px 20px rgba(74, 184, 140, 0.1)" : "sm"}
                                border="1px solid"
                                borderColor={isMe ? "brand.primary" : "gray.100"}
                                bg={isMe ? "green.50" : "white"}
                                transition="all 0.2s"
                                _hover={{ transform: "translateX(5px)", boxShadow: "md" }}
                            >
                                <Flex justify="space-between" align="center">
                                    <HStack spacing={{ base: 3, md: 6 }}>
                                        <Text fontWeight="bold" fontSize="xl" w="30px" textAlign="center" color={rank <= 3 ? rankColor : "gray.400"}>
                                            #{rank}
                                        </Text>
                                        <Avatar name={username} src={user.user?.avatar_url} size="md" bg={isMe ? "brand.primary" : "gray.200"} />
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="bold" color="brand.secondary">
                                                {username} {isMe && "(Tú)"}
                                            </Text>
                                            <Badge colorScheme={rank <= 3 ? "yellow" : "gray"} borderRadius="full" px={2}>
                                                Nivel {level}
                                            </Badge>
                                        </VStack>
                                    </HStack>
                                    <HStack spacing={2}>
                                        <Icon as={FaMedal} color="brand.primary" display={{ base: "none", sm: "block" }} />
                                        <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }} color="brand.primary">
                                            {formattedScore} pts
                                        </Text>
                                    </HStack>
                                </Flex>
                            </Card>
                        );
                    })}

                    {ranking?.length === 0 && (
                        <VStack py={10} spacing={4}>
                            <Icon as={FaMedal} fontSize="4xl" color="gray.300" />
                            <Text textAlign="center" color="gray.500">No hay puntos registrados en este periodo.</Text>
                        </VStack>
                    )}
                </VStack>
            </Box>
        </Container>
    );
};

export default RankingPage;
