import { Box, SimpleGrid, Stat, StatLabel, StatNumber, Text } from '@chakra-ui/react';

interface UserStatsGridProps {
    stats: any;
    racha: any;
}

export const UserStatsGrid = ({ stats, racha }: UserStatsGridProps) => {
    return (
        <Box gridColumn={{ lg: 'span 2' }}>
            <Text fontWeight="extrabold" fontSize="xl" mb={6}>Panel de Rendimiento Ecológico</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box p={6} borderRadius="3xl" bg="orange.50" border="1px solid" borderColor="orange.100">
                    <Stat>
                        <StatLabel color="orange.600" fontWeight="bold">Progreso Actual</StatLabel>
                        <StatNumber fontSize="4xl" color="orange.700">Nv. {stats?.nivel || 1}</StatNumber>
                        <Text fontSize="sm" color="orange.600">Nivel de conciencia ambiental</Text>
                    </Stat>
                </Box>
                <Box p={6} borderRadius="3xl" bg="brand.50" border="1px solid" borderColor="brand.100">
                    <Stat>
                        <StatLabel color="brand.600" fontWeight="bold">Capital Ecológico</StatLabel>
                        <StatNumber fontSize="4xl" color="brand.700">{stats?.puntos_totales?.toLocaleString() || 0}</StatNumber>
                        <Text fontSize="sm" color="brand.600">Puntos acumulados</Text>
                    </Stat>
                </Box>
                <Box p={6} borderRadius="3xl" bg="green.50" border="1px solid" borderColor="green.100">
                    <Stat>
                        <StatLabel color="green.600" fontWeight="bold">Impacto Social</StatLabel>
                        <StatNumber fontSize="4xl" color="green.700">{stats?.kg_co2_ahorrado?.toFixed(2) || 0} kg</StatNumber>
                        <Text fontSize="sm" color="green.600">CO2 evitado de la atmósfera</Text>
                    </Stat>
                </Box>
                <Box p={6} borderRadius="3xl" bg="blue.50" border="1px solid" borderColor="blue.100">
                    <Stat>
                        <StatLabel color="blue.600" fontWeight="bold">Constancia</StatLabel>
                        <StatNumber fontSize="4xl" color="blue.700">{stats?.misiones_diarias_completadas || 0}</StatNumber>
                        <Text fontSize="sm" color="blue.600">Misiones diarias finalizadas</Text>
                    </Stat>
                </Box>
                <Box p={6} borderRadius="3xl" bg="purple.50" border="1px solid" borderColor="purple.100">
                    <Stat>
                        <StatLabel color="purple.600" fontWeight="bold">Racha Actual</StatLabel>
                        <StatNumber fontSize="4xl" color="purple.700">{racha?.racha_actual || 0} 🔥</StatNumber>
                        <Text fontSize="sm" color="purple.600">Días consecutivos (Máx: {racha?.racha_maxima || 0})</Text>
                    </Stat>
                </Box>
            </SimpleGrid>
        </Box>
    );
};
