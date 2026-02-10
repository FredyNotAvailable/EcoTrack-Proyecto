import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Heading } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../config/supabase';

// Helper component for Stat Card
const StatCard = ({ label, number, helpText, type = 'increase' }: any) => {
    return (
        <Stat
            px={{ base: 2, md: 4 }}
            py={'5'}
            shadow={'xl'}
            border={'1px solid'}
            borderColor={'gray.200'}
            rounded={'lg'}
            bg={'white'}
        >
            <StatLabel fontWeight={'medium'} isTruncated>
                {label}
            </StatLabel>
            <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
                {number}
            </StatNumber>
            <StatHelpText>
                <StatArrow type={type} />
                {helpText}
            </StatHelpText>
        </Stat>
    );
};

export const AdminDashboard = () => {
    // Quick demo query to count users
    const { data: userCount } = useQuery({
        queryKey: ['admin', 'users', 'count'],
        queryFn: async () => {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            if (error) throw error;
            return count;
        }
    });

    return (
        <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
            <Heading mb={10} fontSize={'2xl'} fontWeight={'bold'}>
                Dashboard Operativo - EcoTrack
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
                <StatCard
                    label={'Usuarios Totales'}
                    number={userCount || 0}
                    helpText={'Desde el inicio'}
                />
                <StatCard
                    label={'Misiones Completadas'}
                    number={'1,284'}
                    helpText={'12% vs ayer'}
                />
                <StatCard
                    label={'Estado API'}
                    number={'100%'}
                    helpText={'Uptime estable'}
                    type="increase"
                />
            </SimpleGrid>

            {/* More content blocks can be added here */}
            <Box mt={10} p={5} bg="white" shadow="md" borderRadius="xl">
                <Heading size="md" mb={4}>Actividad Reciente</Heading>
                <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0, overflow: 'hidden' }}
                    srcDoc="<body><h3 style='font-family:sans-serif; text-align:center; color:#888; margin-top:100px;'>Gráficas de actividad en tiempo real próximamente...</h3></body>"
                ></iframe>
            </Box>
        </Box>
    );
};
