import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    Box,
    useColorModeValue,
    Icon,
    Flex,
} from '@chakra-ui/react';
import { HiOutlineCalendar, HiOutlineCollection, HiOutlineChartBar, HiOutlineCheckCircle } from 'react-icons/hi';

interface ChallengeStatsProps {
    challenges: any[];
}

export const ChallengeStats = ({ challenges }: ChallengeStatsProps) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    const total = challenges.length;
    const active = challenges.filter(c => c.activo).length;
    const totalPoints = challenges.reduce((acc, c) => acc + (c.recompensa_puntos || 0), 0);
    const avgCO2 = total > 0
        ? (challenges.reduce((acc, c) => acc + (c.recompensa_kg_co2 || 0), 0) / total).toFixed(1)
        : 0;

    const stats = [
        {
            label: 'Total Retos',
            value: total,
            help: 'Historial completo',
            icon: HiOutlineCollection,
            color: 'blue.500',
        },
        {
            label: 'Retos Activos',
            value: active,
            help: 'Disponibles hoy',
            icon: HiOutlineCheckCircle,
            color: 'green.500',
        },
        {
            label: 'Eco-Inversión',
            value: totalPoints.toLocaleString(),
            help: 'Puntos en juego',
            icon: HiOutlineChartBar,
            color: 'purple.500',
        },
        {
            label: 'Impacto Promedio',
            value: `${avgCO2} kg`,
            help: 'CO2 por reto',
            icon: HiOutlineCalendar,
            color: 'orange.500',
        }
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {stats.map((stat, index) => (
                <Box
                    key={index}
                    p={5}
                    bg={cardBg}
                    borderRadius="2xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <Stat>
                        <Flex justify="space-between" align="start">
                            <Box>
                                <StatLabel color="gray.500" fontWeight="medium" fontSize="sm">
                                    {stat.label}
                                </StatLabel>
                                <StatNumber fontSize="2xl" fontWeight="bold" mt={1}>
                                    {stat.value}
                                </StatNumber>
                            </Box>
                            <Flex
                                p={2}
                                bg={`${stat.color.split('.')[0]}.50`}
                                borderRadius="xl"
                                color={stat.color}
                            >
                                <Icon as={stat.icon} boxSize={6} />
                            </Flex>
                        </Flex>
                        <StatHelpText mb={0} mt={2} fontSize="xs">
                            {stat.help}
                        </StatHelpText>
                    </Stat>
                </Box>
            ))}
        </SimpleGrid>
    );
};
