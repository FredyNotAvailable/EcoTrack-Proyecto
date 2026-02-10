import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    Box,
    useColorModeValue,
    Icon,
    Flex,
} from '@chakra-ui/react';
import { HiOutlineLightBulb, HiOutlineLightningBolt, HiOutlineGlobeAlt, HiOutlineLightningBolt as HiFlash } from 'react-icons/hi';

interface MissionStatsProps {
    missions: any[];
}

export const MissionStats = ({ missions }: MissionStatsProps) => {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    const totalMissions = missions.length;
    const activeMissions = missions.filter(m => m.activa).length;
    const energyMissions = missions.filter(m => m.categoria === 'energia').length;
    const avgPoints = totalMissions > 0
        ? Math.round(missions.reduce((acc, m) => acc + m.puntos, 0) / totalMissions)
        : 0;

    const stats = [
        {
            label: 'Total Misiones',
            value: totalMissions.toLocaleString(),
            help: 'Registradas en sistema',
            icon: HiOutlineGlobeAlt,
            color: 'blue.500',
            trend: 'increase'
        },
        {
            label: 'Misiones Activas',
            value: activeMissions.toLocaleString(),
            help: 'Visibles para usuarios',
            icon: HiOutlineLightningBolt,
            color: 'green.500',
            trend: 'increase'
        },
        {
            label: 'Foco en Energía',
            value: energyMissions.toLocaleString(),
            help: 'Misiones de ahorro',
            icon: HiOutlineLightBulb,
            color: 'orange.500',
            trend: 'increase'
        },
        {
            label: 'Promedio Puntos',
            value: avgPoints.toLocaleString(),
            help: 'Por misión cumplida',
            icon: HiFlash,
            color: 'purple.500',
            trend: 'increase'
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
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-4px)', shadow: 'md' }}
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
                            <StatArrow type={stat.trend as 'increase' | 'decrease'} />
                            {stat.help}
                        </StatHelpText>
                    </Stat>
                </Box>
            ))}
        </SimpleGrid>
    );
};
