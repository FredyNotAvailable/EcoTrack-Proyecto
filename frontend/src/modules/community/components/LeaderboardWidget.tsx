import {
    Box,
    Flex,
    Text,
    Avatar,
    VStack,
    Icon,
    Divider,
    Button,
    Skeleton
} from "@chakra-ui/react";
import { FaTrophy, FaMedal } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../../services/userStatsService";
import { useNavigate } from "react-router-dom";

export const LeaderboardWidget = () => {
    const navigate = useNavigate();
    const { data: leaders, isLoading } = useQuery({
        queryKey: ['leaderboard', 'global'],
        queryFn: () => userStatsService.getLeaderboard('global')
    });

    if (isLoading) {
        return <Skeleton height="250px" borderRadius="16px" />;
    }

    // Limit to top 3
    const topLeaders = leaders?.slice(0, 3) || [];

    return (
        <Box
            bg="white"
            borderRadius="16px"
            p={5}
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.100"
            mb={6}
        >
            <Flex align="center" mb={4} gap={2}>
                <Icon as={FaTrophy} color="brand.accentYellow" />
                <Text fontWeight="bold" fontSize="lg">Top Eco-Leaders</Text>
            </Flex>
            <Divider mb={4} />

            <VStack spacing={4} align="stretch" mb={4}>
                {topLeaders.map((leader, index) => (
                    <Flex
                        key={leader.user_id}
                        align="center"
                        justify="space-between"
                        borderRadius="md"
                        _hover={{ bg: "gray.50" }}
                        p={2}
                        transition="all 0.2s"
                    >
                        <Flex
                            align="center"
                            gap={3}
                            cursor="pointer"
                            onClick={() => leader.user?.username && navigate(`/app/perfil/${leader.user.username}`)}
                            _hover={{ opacity: 0.8 }}
                        >
                            <Flex
                                w="24px" h="24px"
                                align="center" justify="center"
                                fontWeight="bold"
                                fontSize="sm"
                                color={index < 3 ? "brand.primary" : "gray.500"}
                            >
                                {index === 0 ? <Icon as={FaMedal} color="#FFD700" /> :
                                    index === 1 ? <Icon as={FaMedal} color="#C0C0C0" /> :
                                        index === 2 ? <Icon as={FaMedal} color="#CD7F32" /> :
                                            (index + 1)}
                            </Flex>
                            <Avatar size="sm" name={leader.user?.username} src={leader.user?.avatar_url} />
                            <Text fontSize="sm" fontWeight="600" noOfLines={1} maxW="120px" title={leader.user?.username}>
                                {leader.user?.username || 'Usuario'}
                            </Text>
                        </Flex>
                        <Text fontSize="sm" fontWeight="bold" color="brand.primary">
                            {leader.puntos_totales}
                        </Text>
                    </Flex>
                ))}
                {topLeaders.length === 0 && <Text fontSize="sm" color="gray.500">No hay datos aún.</Text>}
            </VStack>

            <Button
                variant="ghost"
                size="sm"
                width="100%"
                rightIcon={<FaChevronRight />}
                color="brand.primary"
                onClick={() => navigate('/app/ranking')}
            >
                Ver más
            </Button>
        </Box>
    );
};
