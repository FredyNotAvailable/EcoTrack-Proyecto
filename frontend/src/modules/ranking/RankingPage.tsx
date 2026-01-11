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
} from "@chakra-ui/react";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { keyframes } from "@emotion/react";

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const mockRanking = [
    { rank: 1, name: "Ana Belén", score: "12,450", color: "gold" },
    { rank: 2, name: "Juan Pérez", score: "11,200", color: "silver" },
    { rank: 3, name: "Carlos Ruiz", score: "10,800", color: "#cd7f32" },
    { rank: 4, name: "Tú", score: "2,450", color: "gray.400", isMe: true },
    { rank: 5, name: "Sofía M.", score: "9,500", color: "gray.400" },
];

const RankingPage = () => {
    return (
        <Box animation={`${fadeInUp} 0.6s ease-out`} pb={10}>
            <VStack align="start" spacing={2} mb={10}>
                <HStack spacing={4}>
                    <Icon as={FaTrophy} color="gold" fontSize="4xl" />
                    <Heading size="xl" color="brand.secondary">Ranking Global</Heading>
                </HStack>
                <Text color="brand.textMuted" fontSize="lg">
                    Los guerreros más comprometidos con el planeta. 🏆
                </Text>
            </VStack>

            <VStack spacing={4} align="stretch" maxW="900px">
                {mockRanking.map((user) => (
                    <Card
                        key={user.rank}
                        p={5}
                        borderRadius="20px"
                        boxShadow={user.isMe ? "0 10px 20px rgba(74, 184, 140, 0.1)" : "sm"}
                        border="1px solid"
                        borderColor={user.isMe ? "brand.primary" : "gray.100"}
                        bg={user.isMe ? "green.50" : "white"}
                        transition="all 0.2s"
                        _hover={{ transform: "translateX(10px)", boxShadow: "md" }}
                    >
                        <Flex justify="space-between" align="center">
                            <HStack spacing={6}>
                                <Text fontWeight="bold" fontSize="xl" w="30px" color={user.rank <= 3 ? user.color : "gray.400"}>
                                    #{user.rank}
                                </Text>
                                <Avatar name={user.name} size="md" bg={user.isMe ? "brand.primary" : "gray.200"} />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold" color="brand.secondary">
                                        {user.name} {user.isMe && "(Tú)"}
                                    </Text>
                                    <Badge colorScheme={user.rank <= 3 ? "yellow" : "gray"} borderRadius="full" px={2}>
                                        Nivel {Math.floor(parseInt(user.score.replace(',', '')) / 1000) + 1}
                                    </Badge>
                                </VStack>
                            </HStack>
                            <HStack spacing={2}>
                                <Icon as={FaMedal} color="brand.primary" />
                                <Text fontWeight="bold" fontSize="lg" color="brand.primary">
                                    {user.score} pts
                                </Text>
                            </HStack>
                        </Flex>
                    </Card>
                ))}
            </VStack>
        </Box>
    );
};

export default RankingPage;
