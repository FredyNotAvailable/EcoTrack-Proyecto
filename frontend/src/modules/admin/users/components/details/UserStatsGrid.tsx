import {
    Box,
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    Text,
    useColorModeValue,
    CircularProgress,
    CircularProgressLabel,
    Icon,
    Flex
} from '@chakra-ui/react';
import { HiLightningBolt, HiChartBar, HiGlobe, HiFire } from 'react-icons/hi';

interface UserStatsGridProps {
    stats: any;
    racha: any;
}

const StatCard = ({ label, value, subLabel, icon, color, progress }: any) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box
            p={6}
            borderRadius="3xl"
            bg={bg}
            border="1px solid"
            borderColor={borderColor}
            shadow="sm"
            position="relative"
            overflow="hidden"
            transition="transform 0.2s"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
        >
            <Flex justify="space-between" align="start" mb={4}>
                <Stat>
                    <StatLabel color={`${color}.500`} fontWeight="900" fontSize="xs" textTransform="uppercase" letterSpacing="widest">
                        {label}
                    </StatLabel>
                    <StatNumber fontSize="4xl" fontWeight="900" lineHeight="1" mt={2}>
                        {value}
                    </StatNumber>
                </Stat>
                {progress ? (
                    <CircularProgress value={progress} color={`${color}.400`} size="60px" thickness="12px" trackColor={`${color}.50`}>
                        <CircularProgressLabel fontWeight="bold" fontSize="xs" color={`${color}.500`}>
                            {progress}%
                        </CircularProgressLabel>
                    </CircularProgress>
                ) : (
                    <Box p={3} bg={`${color}.50`} borderRadius="2xl" color={`${color}.500`}>
                        <Icon as={icon} boxSize={6} />
                    </Box>
                )}
            </Flex>
            <Text fontSize="xs" fontWeight="700" color="gray.400">
                {subLabel}
            </Text>
        </Box>
    );
};

export const UserStatsGrid = ({ stats, racha }: UserStatsGridProps) => {
    // Calcular progreso ficticio para nivel (solo visual por ahora)
    const levelProgress = ((stats?.puntos_totales % 1000) / 1000) * 100;

    return (
        <Box gridColumn={{ lg: 'span 2' }}>
            <Text fontWeight="900" fontSize="sm" color="gray.500" mb={6} textTransform="uppercase" letterSpacing="widest">
                Panel de Rendimiento Ecológico
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <StatCard
                    label="Nivel Actual"
                    value={`Nv. ${stats?.nivel || 1}`}
                    subLabel={`Progreso hacia Nivel ${(stats?.nivel || 1) + 1}`}
                    color="orange"
                    progress={levelProgress || 45} // Fallback visual
                />
                <StatCard
                    label="Capital Ecológico"
                    value={stats?.puntos_totales?.toLocaleString() || 0}
                    subLabel="Total de Eco-Puntos Acumulados"
                    icon={HiChartBar}
                    color="brand"
                />
                <StatCard
                    label="Impacto Real"
                    value={`${stats?.kg_co2_ahorrado?.toFixed(2) || 0}kg`}
                    subLabel="CO2 Evitado de la Atmósfera"
                    icon={HiGlobe}
                    color="green"
                />
                <StatCard
                    label="Constancia"
                    value={stats?.misiones_diarias_completadas || 0}
                    subLabel="Misiones Diarias Completadas"
                    icon={HiLightningBolt}
                    color="blue"
                />
                <Box gridColumn={{ md: 'span 2' }}>
                    <StatCard
                        label="Racha Histórica"
                        value={`${racha?.racha_actual || 0} 🔥`}
                        subLabel={`Récord Personal: ${racha?.racha_maxima || 0} días consecutivos`}
                        icon={HiFire}
                        color="purple"
                    />
                </Box>
            </SimpleGrid>
        </Box>
    );
};
