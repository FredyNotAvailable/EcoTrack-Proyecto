import {
    Box,
    Flex,
    Text,
    Avatar,
    VStack,
    Icon,
    Button,
    Skeleton,
    HStack
} from "@chakra-ui/react";
import { FaTrophy, FaMedal, FaCrown, FaStar } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../../services/userStatsService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export const LeaderboardWidget = () => {
    const navigate = useNavigate();
    const { data: leaders, isLoading } = useQuery({
        queryKey: ['leaderboard', 'global'],
        queryFn: () => userStatsService.getLeaderboard('global')
    });

    if (isLoading) {
        return <Skeleton height="250px" borderRadius="32px" />;
    }

    const topLeaders = leaders?.slice(0, 3) || [];

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return { icon: FaCrown, color: "yellow.400" };
            case 1: return { icon: FaTrophy, color: "gray.400" };
            case 2: return { icon: FaMedal, color: "orange.400" };
            default: return { icon: FaStar, color: "gray.300" };
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg="white"
            borderRadius="32px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
            border="1px solid rgba(0,0,0,0.03)"
        >
            <Flex
                align="center"
                justify="space-between"
                mb={4}
            >
                <HStack spacing={3}>
                    <Icon as={FaTrophy} fontSize="xl" color="orange.400" />
                    <Text fontWeight="800" fontSize="lg" color="brand.secondary">
                        Top Eco-Líderes
                    </Text>
                </HStack>
            </Flex>

            <VStack spacing={3} align="stretch" mb={5}>
                {topLeaders.map((leader, index) => {
                    const rankStyle = getRankIcon(index);
                    return (
                        <MotionFlex
                            key={leader.user_id}
                            whileHover={{ backgroundColor: "var(--chakra-colors-gray-50)" }}
                            align="center"
                            justify="space-between"
                            borderRadius="xl"
                            p={2.5}
                            cursor="pointer"
                            onClick={() => leader.user?.username && navigate(`/app/perfil/${leader.user.username}`)}
                        >
                            <HStack spacing={4}>
                                <Icon as={rankStyle.icon} color={rankStyle.color} fontSize="lg" w="20px" />

                                <Avatar
                                    size="sm"
                                    name={leader.user?.username}
                                    src={leader.user?.avatar_url}
                                />

                                <Box>
                                    <Text fontSize="sm" fontWeight="700" color="brand.secondary" noOfLines={1}>
                                        {leader.user?.username || 'Usuario'}
                                    </Text>
                                    <Text fontSize="xs" color="brand.textMuted" fontWeight="500">
                                        Nivel {leader.nivel || 1}
                                    </Text>
                                </Box>
                            </HStack>

                            <Text fontSize="sm" fontWeight="700" color="green.500">
                                {(leader.puntos_totales || 0).toLocaleString()} XP
                            </Text>
                        </MotionFlex>
                    );
                })}
            </VStack>

            <Button
                w="full"
                variant="ghost"
                colorScheme="green"
                rightIcon={<FaChevronRight size={12} />}
                onClick={() => navigate('/app/ranking')}
                _hover={{
                    bg: "green.50"
                }}
            >
                Ver Ranking Completo
            </Button>
        </MotionBox>
    );
};
