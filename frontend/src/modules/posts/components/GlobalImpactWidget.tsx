import { Box, Flex, Icon, Skeleton, Text, VStack } from "@chakra-ui/react";
import { FaGlobeAmericas, FaCloud } from "react-icons/fa"; // Changed to FaGlobeAmericas for global context
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../../services/userStatsService";

export const GlobalImpactWidget = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['globalStats'],
        queryFn: userStatsService.getGlobalStats,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    if (isLoading) {
        return <Skeleton height="200px" borderRadius="16px" />;
    }

    return (
        <Box
            p={6}
            bgGradient="linear(to-br, #2c3e50, #3498db)" // Darker "global" theme
            borderRadius="16px"
            boxShadow="0 10px 30px -10px rgba(44, 62, 80, 0.4)"
            color="white"
            mb={6}
            textAlign="center"
        >
            <VStack spacing={3}>
                <Icon as={FaGlobeAmericas} w={10} h={10} color="whiteAlpha.900" />
                <Text fontSize="lg" fontWeight="600" letterSpacing="wide" textTransform="uppercase" opacity={0.9}>
                    Impacto Global
                </Text>

                <Flex direction="column" align="center">
                    <Text fontSize="4xl" fontWeight="800" lineHeight="1">
                        {data?.total_co2 || 0}
                    </Text>
                    <Text fontSize="md" fontWeight="500" opacity={0.8} mt={1}>
                        kg de CO₂ Ahorrados
                    </Text>
                </Flex>

                <Box h="2px" w="20%" bg="whiteAlpha.400" my={2} />

                <Flex align="center" gap={2} fontSize="sm" opacity={0.85}>
                    <Icon as={FaCloud} />
                    <Text>Por toda la comunidad EcoTrack</Text>
                </Flex>
            </VStack>
        </Box>
    );
};
