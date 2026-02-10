import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    useColorModeValue,
    Box,
    Icon,
    Flex,
} from '@chakra-ui/react';
import { HiUserGroup, HiGlobe, HiLightningBolt } from 'react-icons/hi';
import type { AdminUser } from '../../services/admin.service';

interface UserStatsProps {
    users: AdminUser[];
}

export const UserStats = ({ users }: UserStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const secondaryColor = useColorModeValue('gray.500', 'gray.400');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    // Simular "Nuevos hoy" comparando con la fecha actual
    const today = new Date().toISOString().split('T')[0];
    const newUsersToday = users.filter(u => u.created_at.startsWith(today)).length;

    const stats = [
        {
            label: 'Total Eco-Ciudadanos',
            number: totalUsers,
            helpText: 'Registrados en la plataforma',
            icon: HiUserGroup,
            color: 'blue.500'
        },
        {
            label: 'Impacto Activo',
            number: activeUsers,
            helpText: `${((activeUsers / totalUsers || 0) * 100).toFixed(1)}% de actividad`,
            icon: HiGlobe,
            color: 'green.500'
        },
        {
            label: 'Nuevos hoy',
            number: newUsersToday,
            helpText: 'Nuevas mentes unidas',
            icon: HiLightningBolt,
            color: 'orange.500'
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
                                <StatNumber fontSize="4xl" fontWeight="900" mt={1}>
                                    {stat.number}
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
