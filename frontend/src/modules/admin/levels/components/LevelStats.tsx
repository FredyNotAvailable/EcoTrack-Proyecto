import {
    SimpleGrid,
    Box,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    useColorModeValue,
    Icon,
    Flex,
    StatArrow,
} from '@chakra-ui/react';
import { HiTrendingUp, HiAcademicCap, HiFire } from 'react-icons/hi';

interface LevelStatsProps {
    levels: any[];
}

export const LevelStats = ({ levels }: LevelStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const secondaryColor = useColorModeValue('gray.500', 'gray.400');

    const maxLevel = levels.length > 0 ? Math.max(...levels.map(l => l.nivel)) : 0;
    const totalPointsReq = levels.length > 0 ? Math.max(...levels.map(l => l.puntos_minimos)) : 0;
    const avgPointsPerLevel = levels.length > 1
        ? Math.round(totalPointsReq / (levels.length - 1))
        : 0;

    const stats = [
        {
            label: 'Nivel Máximo',
            value: maxLevel,
            helpText: 'Capacidad del sistema',
            icon: HiAcademicCap,
            color: 'blue.500',
        },
        {
            label: 'Meta Final',
            value: totalPointsReq.toLocaleString(),
            helpText: 'Puntos para nivel max',
            icon: HiTrendingUp,
            color: 'green.500',
        },
        {
            label: 'Curva de Dificultad',
            value: avgPointsPerLevel.toLocaleString(),
            helpText: 'Promedio pts/nivel',
            icon: HiFire,
            color: 'orange.500',
        },
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {stats.map((stat, index) => (
                <Box
                    key={index}
                    px={8}
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
