import {
    Box,
    Text,
    SimpleGrid,
    Flex,
    Icon,
    Skeleton,
    useColorModeValue
} from "@chakra-ui/react";
import { FaLeaf, FaUsers, FaFlagCheckered, FaEarthAmericas } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../../services/userStatsService";

export const GlobalImpactWidget = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['globalStats'],
        queryFn: userStatsService.getGlobalStats,
        refetchInterval: 30000 // Refresh every 30s
    });

    // const bg = useColorModeValue("white", "gray.800");

    if (isLoading) {
        return <Skeleton height="100px" borderRadius="16px" />;
    }

    return (
        <Box
            bg="brand.primary"
            borderRadius="16px"
            p={6}
            color="white"
            boxShadow="lg"
            mb={8}
            position="relative"
            overflow="hidden"
        >
            <Flex align="center" gap={3} mb={6}>
                <Icon as={FaEarthAmericas} fontSize="2xl" />
                <Text fontSize="xl" fontWeight="bold">Impacto Global</Text>
            </Flex>

            <SimpleGrid columns={3} spacing={4} textAlign="center">

                {/* Total Members */}
                <Box>
                    <Flex justify="center" mb={2}>
                        <Box p={2} bg="whiteAlpha.200" borderRadius="full">
                            <Icon as={FaUsers} fontSize="xl" />
                        </Box>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="800" lineHeight="1">{stats?.total_users || 0}</Text>
                    <Text fontSize="xs" opacity={0.9} mt={1}>Miembros</Text>
                </Box>

                {/* CO2 Saved */}
                <Box borderX="1px solid" borderColor="whiteAlpha.300">
                    <Flex justify="center" mb={2}>
                        <Box p={2} bg="whiteAlpha.200" borderRadius="full">
                            <Icon as={FaLeaf} fontSize="xl" />
                        </Box>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="800" lineHeight="1">{stats?.total_co2?.toFixed(1) || "0"}</Text>
                    <Text fontSize="xs" opacity={0.9} mt={1}>kg CO₂ Ahorrado</Text>
                </Box>

                {/* Challenges Completed (Static Mock) */}
                <Box>
                    <Flex justify="center" mb={2}>
                        <Box p={2} bg="whiteAlpha.200" borderRadius="full">
                            <Icon as={FaFlagCheckered} fontSize="xl" />
                        </Box>
                    </Flex>
                    <Text fontSize="2xl" fontWeight="800" lineHeight="1">0</Text>
                    <Text fontSize="xs" opacity={0.9} mt={1}>Retos Completados</Text>
                </Box>

            </SimpleGrid>
        </Box>
    );
};
