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
import { HiLightBulb, HiCheckCircle, HiClock } from 'react-icons/hi';

interface TipStatsProps {
    tips: any[];
}

export const TipStats = ({ tips }: TipStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const secondaryColor = useColorModeValue('gray.500', 'gray.400');

    const total = tips.length;
    const active = tips.filter(t => t.activo).length;
    const inactive = total - active;

    const stats = [
        {
            label: 'Total Eco-Consejos',
            value: total,
            helpText: 'Sabiduría acumulada',
            icon: HiLightBulb,
            color: 'blue.500',
        },
        {
            label: 'Consejos Activos',
            value: active,
            helpText: 'Visibles para la comunidad',
            icon: HiCheckCircle,
            color: 'green.500',
        },
        {
            label: 'En Revisión / Pausados',
            value: inactive,
            helpText: 'Contenido no publicado',
            icon: HiClock,
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
