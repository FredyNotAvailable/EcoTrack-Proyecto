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
} from '@chakra-ui/react';
import { HiTrendingUp, HiAcademicCap, HiFire } from 'react-icons/hi';

interface LevelStatsProps {
    levels: any[];
}

export const LevelStats = ({ levels }: LevelStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const maxLevel = levels.length > 0 ? Math.max(...levels.map(l => l.nivel)) : 0;
    const totalPointsReq = levels.length > 0 ? Math.max(...levels.map(l => l.puntos_minimos)) : 0;
    const avgPointsPerLevel = levels.length > 1
        ? Math.round(totalPointsReq / (levels.length - 1))
        : 0;

    const stats = [
        {
            label: 'Nivel Máximo',
            value: maxLevel,
            help: 'Capacidad actual del sistema',
            icon: HiAcademicCap,
            color: 'blue.500',
        },
        {
            label: 'Puntos para Max Nivel',
            value: totalPointsReq.toLocaleString(),
            help: 'Esfuerzo total requerido',
            icon: HiTrendingUp,
            color: 'green.500',
        },
        {
            label: 'Promedio pts/nivel',
            value: avgPointsPerLevel.toLocaleString(),
            help: 'Incremento de dificultad',
            icon: HiFire,
            color: 'orange.500',
        },
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {stats.map((stat, index) => (
                <Box
                    key={index}
                    p={5}
                    bg={bg}
                    borderRadius="2xl"
                    border="1px"
                    borderColor={borderColor}
                    shadow="sm"
                >
                    <Flex align="center">
                        <Box
                            p={3}
                            borderRadius="xl"
                            bg={`${stat.color.split('.')[0]}.50`}
                            color={stat.color}
                            mr={4}
                        >
                            <Icon as={stat.icon} boxSize={6} />
                        </Box>
                        <Stat>
                            <StatLabel color="gray.500" fontWeight="bold">
                                {stat.label}
                            </StatLabel>
                            <StatNumber fontSize="2xl" fontWeight="800">
                                {stat.value}
                            </StatNumber>
                            <StatHelpText mb={0}>{stat.help}</StatHelpText>
                        </Stat>
                    </Flex>
                </Box>
            ))}
        </SimpleGrid>
    );
};
