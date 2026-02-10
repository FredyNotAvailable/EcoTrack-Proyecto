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
    StatArrow,
} from '@chakra-ui/react';
import { HiCollection, HiFlag, HiChartBar, HiGlobe } from 'react-icons/hi';

interface ChallengeStatsProps {
    challenges: any[];
}

export const ChallengeStats = ({ challenges }: ChallengeStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const secondaryColor = useColorModeValue('gray.500', 'gray.400');

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
            helpText: 'Repositorio de desafíos',
            icon: HiCollection,
            color: 'blue.500',
        },
        {
            label: 'Retos Activos',
            value: active,
            helpText: 'Disponibles actualmente',
            icon: HiFlag,
            color: 'green.500',
        },
        {
            label: 'Incentivos Totales',
            value: totalPoints.toLocaleString(),
            helpText: 'Eco-puntos en circulación',
            icon: HiChartBar,
            color: 'purple.500',
        },
        {
            label: 'Impacto Global',
            value: `${avgCO2} kg`,
            helpText: 'CO2 evitado por reto',
            icon: HiGlobe,
            color: 'orange.500',
        }
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {stats.map((stat, index) => (
                <Box
                    key={index}
                    px={6}
                    py={6}
                    bg={bg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="3xl"
                    shadow="sm"
                    transition="all 0.3s"
                    _hover={{ transform: 'translateY(-4px)', shadow: 'xl', borderColor: stat.color }}
                >
                    <Stat>
                        <Flex justify="space-between" align="start" mb={4}>
                            <Box>
                                <StatLabel fontWeight="800" fontSize="xs" color={secondaryColor} textTransform="uppercase" letterSpacing="widest">
                                    {stat.label}
                                </StatLabel>
                                <StatNumber fontSize="3xl" fontWeight="900" mt={1}>
                                    {stat.value}
                                </StatNumber>
                            </Box>
                            <Box p={3} bg={`${stat.color.split('.')[0]}.50`} borderRadius="2xl" color={stat.color}>
                                <Icon as={stat.icon} fontSize="24px" />
                            </Box>
                        </Flex>
                        <StatHelpText m={0} display="flex" alignItems="center" fontSize="xs" color={secondaryColor} fontWeight="600">
                            <StatArrow type="increase" />
                            {stat.helpText}
                        </StatHelpText>
                    </Stat>
                </Box>
            ))}
        </SimpleGrid>
    );
};
