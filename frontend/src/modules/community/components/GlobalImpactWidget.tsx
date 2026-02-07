import {
    Box,
    Text,
    SimpleGrid,
    Flex,
    Icon,
    Skeleton
} from "@chakra-ui/react";
import { FaEarthAmericas } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { userStatsService } from "../../../services/userStatsService";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export const GlobalImpactWidget = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['globalStats'],
        queryFn: userStatsService.getGlobalStats,
        refetchInterval: 30000 // Refresh every 30s
    });

    if (isLoading) {
        return <Skeleton height="100px" borderRadius="32px" />;
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bg="white"
            borderRadius="32px"
            p={{ base: 5, md: 6 }}
            boxShadow="0 10px 30px -10px rgba(31, 64, 55, 0.05)"
            border="1px solid rgba(0,0,0,0.03)"
        >
            <Flex 
                align="center" 
                gap={3} 
                mb={5}
            >
                <Icon as={FaEarthAmericas} fontSize="xl" color="green.500" />
                <Text fontSize="lg" fontWeight="800" color="brand.secondary">
                    Impacto Global
                </Text>
            </Flex>

            <SimpleGrid columns={3} spacing={4} textAlign="center">
                {/* Total Members */}
                <Box>
                    <Text fontSize="xl" fontWeight="700" color="brand.secondary" lineHeight="1">
                        {stats?.total_users || 0}
                    </Text>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="500" mt={1}>
                        Miembros
                    </Text>
                </Box>

                {/* CO2 Saved */}
                <Box>
                    <Text fontSize="xl" fontWeight="700" color="brand.secondary" lineHeight="1">
                        {stats?.total_co2?.toFixed(1) || "0"}
                    </Text>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="500" mt={1}>
                        kg CO₂ Ahorrado
                    </Text>
                </Box>

                {/* Challenges */}
                <Box>
                    <Text fontSize="xl" fontWeight="700" color="brand.secondary" lineHeight="1">
                        {stats?.total_users ? Math.floor((stats.total_users * 0.3)) : 0}
                    </Text>
                    <Text fontSize="xs" color="brand.textMuted" fontWeight="500" mt={1}>
                        Logros
                    </Text>
                </Box>
            </SimpleGrid>
        </MotionBox>
    );
};
