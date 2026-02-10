import {
    Box,
    SimpleGrid,
    Heading,
    Text,
    Flex,
    Icon,
    VStack,
    HStack,
    Avatar,
    Badge,
    useColorModeValue,
    Skeleton,
    Grid,
    GridItem,
    Progress,
    Container,
} from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../../../config/supabase';
import {
    HiUsers,
    HiLightningBolt,
    HiTrendingUp,
    HiCollection,
    HiOutlineGlobeAlt,
    HiGlobe
} from 'react-icons/hi';
import { AdminAPIService } from '../services/admin.service';

const StatCard = ({ label, number, icon, color, subLabel }: any) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    return (
        <Box
            p={6}
            bg={bg}
            borderRadius="3xl"
            border="1px"
            borderColor={borderColor}
            shadow="sm"
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
        >
            <Flex justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                    <Text color="gray.400" fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="widest">
                        {label}
                    </Text>
                    <Text fontSize="3xl" fontWeight="900" color="gray.800">
                        {number}
                    </Text>
                    {subLabel && (
                        <Badge colorScheme={color} variant="subtle" borderRadius="full" px={2} fontSize="10px">
                            {subLabel}
                        </Badge>
                    )}
                </VStack>
                <Flex
                    w={14}
                    h={14}
                    bg={`${color}.50`}
                    color={`${color}.500`}
                    borderRadius="2xl"
                    align="center"
                    justify="center"
                    boxShadow={`0 8px 20px -6px var(--chakra-colors-${color}-200)`}
                >
                    <Icon as={icon} boxSize={7} />
                </Flex>
            </Flex>
        </Box>
    );
};

export const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const bgCard = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin', 'dashboard-stats'],
        queryFn: AdminAPIService.getDashboardStats,
        staleTime: 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const channel = supabase
            .channel('admin-dashboard-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'kgco2_logs' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    if (isLoading) {
        return (
            <Container maxW="container.xl" py={8}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} height="140px" borderRadius="3xl" />)}
                </SimpleGrid>
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={8} mt={8}>
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <Skeleton height="500px" borderRadius="3xl" />
                    </GridItem>
                    <GridItem>
                        <Skeleton height="500px" borderRadius="3xl" />
                    </GridItem>
                </Grid>
            </Container>
        );
    }

    return (
        <Container maxW="full" py={4} px={{ base: 0, md: 4 }}>
            <VStack spacing={8} align="stretch">
                {/* Métricas Principales */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
                    <StatCard
                        label="Impacto CO2"
                        number={`${stats?.impacto?.co2Total?.toFixed(1) || 0}kg`}
                        subLabel="Reducción neta"
                        icon={HiOutlineGlobeAlt}
                        color="green"
                    />
                    <StatCard
                        label="Ciudadanos"
                        number={stats?.usuarios?.total || 0}
                        subLabel={`+${stats?.usuarios?.nuevosMes || 0} este mes`}
                        icon={HiUsers}
                        color="blue"
                    />
                    <StatCard
                        label="Misiones"
                        number={stats?.impacto?.misionesCompletadas || 0}
                        subLabel="Acciones completadas"
                        icon={HiLightningBolt}
                        color="yellow"
                    />
                    <Box as={RouterLink} to="/admin/reports" style={{ textDecoration: 'none' }}>
                        <StatCard
                            label="Moderación"
                            number={stats?.comunidad?.reportados || 0}
                            subLabel="Alertas pendientes"
                            icon={HiCollection}
                            color="purple"
                        />
                    </Box>
                </SimpleGrid>

                <Grid templateColumns={{ base: '1fr', lg: 'repeat(3, 1fr)' }} gap={8}>
                    {/* Latido de la Comunidad (Impacto en vivo) */}
                    <GridItem colSpan={{ base: 1, lg: 2 }}>
                        <Box
                            p={8}
                            bg={bgCard}
                            borderRadius="3xl"
                            border="1px"
                            borderColor={borderColor}
                            shadow="lg"
                        >
                            <HStack justify="space-between" mb={8}>
                                <VStack align="start" spacing={0}>
                                    <Heading size="md" fontWeight="900">Latido de Impacto</Heading>
                                    <Text fontSize="xs" color="gray.400" fontWeight="700" textTransform="uppercase" letterSpacing="widest">Registro de actividad</Text>
                                </VStack>
                                <Icon as={HiTrendingUp} color="green.500" boxSize={6} />
                            </HStack>

                            <VStack spacing={5} align="stretch">
                                {stats?.actividadReciente?.map((log: any) => (
                                    <Flex
                                        key={log.id}
                                        align="center"
                                        justify="space-between"
                                        p={4}
                                        borderRadius="2xl"
                                        bg="gray.50"
                                        transition="all 0.2s"
                                        _hover={{ bg: 'green.50', transform: 'scale(1.02)' }}
                                    >
                                        <HStack spacing={4}>
                                            <Avatar
                                                size="md"
                                                name={log.user?.username}
                                                src={log.user?.avatar_url}
                                                border="2px solid white"
                                                boxShadow="sm"
                                            />
                                            <VStack align="start" spacing={0}>
                                                <Text fontSize="sm" fontWeight="800" color="gray.700">
                                                    @{log.user?.username || 'EcoUsuario'}
                                                </Text>
                                                <HStack spacing={1}>
                                                    <Icon as={HiGlobe} size="10px" color="green.500" />
                                                    <Text fontSize="xs" color="gray.500" fontWeight="600">
                                                        {log.origen}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>
                                        <Box textAlign="right">
                                            <Text fontSize="sm" fontWeight="900" color="green.600">
                                                -{log.kg_co2} kg
                                            </Text>
                                            <Text fontSize="10px" color="gray.400" fontWeight="700">
                                                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </Box>
                                    </Flex>
                                ))}
                                {stats?.actividadReciente?.length === 0 && (
                                    <Flex direction="column" align="center" justify="center" py={20}>
                                        <Icon as={HiOutlineGlobeAlt} boxSize={12} color="gray.200" mb={4} />
                                        <Text fontWeight="800" color="gray.300">Esperando el primer latido...</Text>
                                    </Flex>
                                )}
                            </VStack>
                        </Box>
                    </GridItem>

                    {/* Progresión de la Comunidad */}
                    <GridItem>
                        <Box
                            p={8}
                            bg={bgCard}
                            borderRadius="3xl"
                            border="1px"
                            borderColor={borderColor}
                            shadow="lg"
                            h="full"
                        >
                            <VStack align="start" spacing={6} h="full">
                                <Box>
                                    <Heading size="md" fontWeight="900">Progresión</Heading>
                                    <Text fontSize="xs" color="gray.400" fontWeight="700" textTransform="uppercase" letterSpacing="widest">Distribución de eco-rangos</Text>
                                </Box>

                                <VStack spacing={10} width="100%" flex="1" justify="center">
                                    <Box width="100%">
                                        <Flex justify="space-between" mb={3}>
                                            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase">Principiantes (1-3)</Text>
                                            <Badge colorScheme="green" borderRadius="full">{stats?.niveles?.principiante}</Badge>
                                        </Flex>
                                        <Progress value={(stats?.niveles?.principiante / stats?.usuarios?.total) * 100} colorScheme="green" size="lg" borderRadius="full" bg="green.50" />
                                    </Box>

                                    <Box width="100%">
                                        <Flex justify="space-between" mb={3}>
                                            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase">Intermedios (4-6)</Text>
                                            <Badge colorScheme="blue" borderRadius="full">{stats?.niveles?.intermedio}</Badge>
                                        </Flex>
                                        <Progress value={(stats?.niveles?.intermedio / stats?.usuarios?.total) * 100} colorScheme="blue" size="lg" borderRadius="full" bg="blue.50" />
                                    </Box>

                                    <Box width="100%">
                                        <Flex justify="space-between" mb={3}>
                                            <Text fontSize="xs" fontWeight="800" color="gray.500" textTransform="uppercase">Expertos (7-9)</Text>
                                            <Badge colorScheme="purple" borderRadius="full">{stats?.niveles?.experto}</Badge>
                                        </Flex>
                                        <Progress value={(stats?.niveles?.experto / stats?.usuarios?.total) * 100} colorScheme="purple" size="lg" borderRadius="full" bg="purple.50" />
                                    </Box>
                                </VStack>

                                <Box
                                    p={5}
                                    bg="green.600"
                                    borderRadius="2xl"
                                    width="100%"
                                    boxShadow="lg"
                                    color="white"
                                >
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="xs" fontWeight="800" opacity={0.8} textTransform="uppercase">Eco-Economía</Text>
                                        <Heading size="md">{stats?.impacto?.puntosTotal.toLocaleString()}</Heading>
                                        <Text fontSize="10px" fontWeight="700">PUNTOS CIRCULANDO</Text>
                                    </VStack>
                                </Box>
                            </VStack>
                        </Box>
                    </GridItem>
                </Grid>
            </VStack>
        </Container>
    );
};
