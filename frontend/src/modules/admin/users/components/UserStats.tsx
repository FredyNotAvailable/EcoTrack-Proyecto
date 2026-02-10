import {
    SimpleGrid,
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
    useColorModeValue,
} from '@chakra-ui/react';
import type { AdminUser } from '../../services/admin.service';

interface UserStatsProps {
    users: AdminUser[];
}

export const UserStats = ({ users }: UserStatsProps) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;

    // Simular "Nuevos hoy" comparando con la fecha actual
    const today = new Date().toISOString().split('T')[0];
    const newUsersToday = users.filter(u => u.created_at.startsWith(today)).length;

    const stats = [
        { label: 'Total Usuarios', number: totalUsers, helpText: 'En el sistema', type: 'increase' },
        { label: 'Usuarios Activos', number: activeUsers, helpText: `${((activeUsers / totalUsers || 0) * 100).toFixed(1)}% del total`, type: 'increase' },
        { label: 'Nuevos hoy', number: newUsersToday, helpText: 'Registros diarios', type: 'increase' },
    ];

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {stats.map((stat, index) => (
                <Stat
                    key={index}
                    px={6}
                    py={5}
                    bg={bg}
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="xl"
                    shadow="sm"
                >
                    <StatLabel fontWeight="medium" color="gray.500">
                        {stat.label}
                    </StatLabel>
                    <StatNumber fontSize="3xl" fontWeight="800">
                        {stat.number}
                    </StatNumber>
                    <StatHelpText>
                        <StatArrow type={stat.type as 'increase' | 'decrease'} />
                        {stat.helpText}
                    </StatHelpText>
                </Stat>
            ))}
        </SimpleGrid>
    );
};
